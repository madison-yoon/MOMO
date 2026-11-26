package com.momo.backend.rag.service;

import com.momo.backend.entity.Review;
import com.momo.backend.entity.User;
import com.momo.backend.rag.enums.IndexStatus;
import com.momo.backend.rag.enums.QueryScope;
import com.momo.backend.repository.ReviewRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

/** 명시적으로 띄운 폐기용 로컬 MySQL만 사용한다. 공유 DB URL이나 기본 포트로는 실행하지 않는다. */
@EnabledIfEnvironmentVariable(named = "MOMO_RAG5_MYSQL_ISOLATED", matches = "true")
@DataJpaTest(showSql = false, properties = {
        "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",
        "spring.datasource.username=root", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.open-in-view=false",
        "spring.datasource.hikari.maximum-pool-size=4"})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({RagQueryReader.class, ReviewIndexTransactions.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class RagMySqlValidationTest {
    private static final Pattern ISOLATED_URL = Pattern.compile(
            "jdbc:mysql://(?:127[.]0[.]0[.]1|localhost):([0-9]{1,5})/momo_rag5_test_[a-f0-9]{12}"
                    + "[?]useSSL=false&allowPublicKeyRetrieval=true");
    private static final LocalDateTime ORIGINAL_TIME = LocalDateTime.of(2026, 11, 25, 10, 11, 12, 123456000);

    @DynamicPropertySource
    static void isolatedDatabase(DynamicPropertyRegistry registry) {
        String url = System.getenv("MOMO_RAG5_MYSQL_URL");
        var match = ISOLATED_URL.matcher(url == null ? "" : url);
        if (!"true".equals(System.getenv("MOMO_RAG5_MYSQL_ISOLATED")) || !match.matches()) {
            throw new IllegalStateException("명시적인 격리 MySQL URL이 필요합니다.");
        }
        int port = Integer.parseInt(match.group(1));
        if (port < 1024 || port > 65535 || port == 3306) {
            throw new IllegalStateException("격리 MySQL은 기본 포트와 구분된 임시 포트가 필요합니다.");
        }
        registry.add("spring.datasource.url", () -> url);
    }

    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager manager;
    @Autowired RagQueryReader reader;
    @Autowired ReviewIndexTransactions transactions;
    @Autowired ReviewRepository reviews;

    @Test
    void mysqlSha2MatchesKnownUtf8DigestAndAllSourceChangesAtSameTimestampAreDetected() {
        Fixture fixture = fixture("Café 한글 ", "첫 줄\nSecond ");
        assertTrue(transactions.recordResult(transactions.readLatest(fixture.reviewId).orElseThrow(), IndexStatus.READY, null));
        var initial = reader.readAllowed(QueryScope.MINE, fixture.userId, 5001).getFirst();
        assertEquals("7d696856113a28f7b7c9d52ced74b2682153caa7e20a02fe79d30b0e35e9c173", initial.fingerprint());
        for (String[] changed : List.of(
                new String[]{"CAFÉ 한글 ", "첫 줄\nSecond "},
                new String[]{"Cafe 한글 ", "첫 줄\nSecond "},
                new String[]{"Café 한굴 ", "첫 줄\nSecond "},
                new String[]{"Café 한글", "첫 줄\nSecond "},
                new String[]{"Café 한글 ", "첫 줄\nSECOND "},
                new String[]{"Café 한글 ", "첫 줄\nSécônd "},
                new String[]{"Café 한글 ", "첫 줄\nSecond"})) {
            changeOriginal(fixture.reviewId, changed[0], changed[1]);
            var latest = reader.readReadySources(List.of(fixture.reviewId)).getFirst();
            assertEquals(ORIGINAL_TIME, latest.updatedAt());
            assertEquals(initial.updatedAt(), latest.updatedAt());
            assertNotEquals(initial.fingerprint(), latest.fingerprint());
        }
    }

    @Test
    void datetime6RetainsMicrosecondsInBothEntityAndProjectionReads() {
        Fixture fixture = fixture("정밀도", "본문");
        var original = transactions.readLatest(fixture.reviewId).orElseThrow();
        assertEquals(ORIGINAL_TIME, original.updatedAt());
        assertTrue(transactions.recordResult(original, IndexStatus.READY, null));
        assertEquals(ORIGINAL_TIME, reader.readReadySources(List.of(fixture.reviewId)).getFirst().updatedAt());
        tx(() -> {
            Review current = reviews.findById(fixture.reviewId).orElseThrow();
            assertNotNull(current.getIndexedAt());
            assertEquals(0, current.getIndexedAt().getNano() % 1000);
            for (String column : List.of("updated_at", "indexed_at")) {
                Number precision = (Number) em.createNativeQuery("select DATETIME_PRECISION from information_schema.columns "
                                + "where TABLE_SCHEMA=database() and TABLE_NAME='reviews' and COLUMN_NAME=:column")
                        .setParameter("column", column).getSingleResult();
                assertEquals(6, precision.intValue());
            }
        });
    }

    @Test
    void staleResultCannotWinCaseAccentKoreanOrTrailingSpaceChangesAndFreshResultCan() {
        for (String[] changed : List.of(new String[]{"CAFÉ 한글", "Body 한글 "},
                new String[]{"Cafe 한글", "Body 한글 "}, new String[]{"Café 한굴", "Body 한글 "},
                new String[]{"Café 한글 ", "Body 한글 "}, new String[]{"Café 한글", "body 한글"})) {
            Fixture fixture = fixture("Café 한글", "Body 한글 ");
            var stale = transactions.readLatest(fixture.reviewId).orElseThrow();
            changeOriginal(fixture.reviewId, changed[0], changed[1]);
            assertFalse(transactions.recordResult(stale, IndexStatus.READY, null));
            tx(() -> assertEquals(IndexStatus.INDEXING, reviews.findById(fixture.reviewId).orElseThrow().getIndexStatus()));
            var fresh = transactions.readLatest(fixture.reviewId).orElseThrow();
            assertEquals(ORIGINAL_TIME, fresh.updatedAt());
            assertTrue(transactions.recordResult(fresh, IndexStatus.READY, null));
            assertFalse(transactions.recordResult(fresh, IndexStatus.FAILED, "STALE"));
        }
    }

    @Test
    void bulkInvalidationManualResetAndResultWritesPreserveOriginalTimestamp() {
        Fixture fixture = fixture("원본 제목", "원본 본문");
        var original = transactions.readLatest(fixture.reviewId).orElseThrow();
        assertTrue(transactions.recordResult(original, IndexStatus.READY, null));
        transactions.invalidateReady();
        assertTrue(reader.readReadySources(List.of(fixture.reviewId)).isEmpty());
        assertTrue(transactions.beginManual(fixture.reviewId));
        assertEquals(original, transactions.readLatest(fixture.reviewId).orElseThrow());
        assertTrue(transactions.recordResult(original, IndexStatus.FAILED, "SAFE_ERROR"));
        tx(() -> {
            Review current = reviews.findById(fixture.reviewId).orElseThrow();
            assertEquals(ORIGINAL_TIME, current.getUpdatedAt());
            assertEquals("원본 제목", current.getTitle());
            assertEquals("원본 본문", current.getContent());
            assertEquals(IndexStatus.FAILED, current.getIndexStatus());
            assertEquals("SAFE_ERROR", current.getIndexError());
            assertNull(current.getIndexedAt());
        });
    }

    @Test
    void requiresNewResultCommitAndFreshProjectionSurviveOuterRollbackAndStaleContext() {
        Fixture fixture = fixture("트랜잭션", "본문");
        var original = transactions.readLatest(fixture.reviewId).orElseThrow();
        new TransactionTemplate(manager).executeWithoutResult(outer -> {
            assertTrue(TransactionSynchronizationManager.isActualTransactionActive());
            Review stale = em.find(Review.class, fixture.reviewId);
            assertEquals(IndexStatus.INDEXING, stale.getIndexStatus());
            assertTrue(transactions.recordResult(original, IndexStatus.READY, null));
            assertEquals(1, reader.readReadySources(List.of(fixture.reviewId)).size());
            assertEquals(IndexStatus.INDEXING, stale.getIndexStatus());
            outer.setRollbackOnly();
        });
        tx(() -> {
            Review committed = reviews.findById(fixture.reviewId).orElseThrow();
            assertEquals(IndexStatus.READY, committed.getIndexStatus());
            assertEquals(ORIGINAL_TIME, committed.getUpdatedAt());
            assertNotNull(committed.getIndexedAt());
        });
    }

    private Fixture fixture(String title, String body) {
        return new TransactionTemplate(manager).execute(status -> {
            String unique = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
            User user = new User(unique, "hash", unique, unique + "@test.invalid");
            em.persist(user);
            Review review = new Review(user, "movie-a", title, body);
            em.persist(review);
            em.flush();
            em.createNativeQuery("update reviews set updated_at=:time where review_id=:id")
                    .setParameter("time", ORIGINAL_TIME).setParameter("id", review.getReviewId()).executeUpdate();
            return new Fixture(user.getUserId(), review.getReviewId());
        });
    }

    private void changeOriginal(Long id, String title, String body) {
        tx(() -> em.createNativeQuery("update reviews set title=:title, content=:body where review_id=:id")
                .setParameter("title", title).setParameter("body", body).setParameter("id", id).executeUpdate());
    }

    private void tx(Runnable action) { new TransactionTemplate(manager).executeWithoutResult(status -> action.run()); }
    private record Fixture(Long userId, Long reviewId) { }
}
