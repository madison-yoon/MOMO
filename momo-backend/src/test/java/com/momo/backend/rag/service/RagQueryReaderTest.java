package com.momo.backend.rag.service;

import com.momo.backend.entity.Review;
import com.momo.backend.entity.User;
import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.dto.RagAnswer;
import com.momo.backend.rag.dto.RagQueryRequest;
import com.momo.backend.rag.enums.QueryScope;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** 공유 DB 없이 H2에서 실제 별도 트랜잭션과 SQL 지문을 검증한다. */
@DataJpaTest(showSql = false, properties = {
        "spring.datasource.url=jdbc:h2:mem:rag-query-reader;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
        "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({RagQueryReader.class, RagQueryService.class, RagQueryReaderTest.ClientConfig.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class RagQueryReaderTest {
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager manager;
    @Autowired RagQueryReader reader;
    @Autowired RagQueryService service;
    @Autowired RagClient client;

    @TestConfiguration
    static class ClientConfig {
        @Bean RagClient client() { return mock(RagClient.class); }
    }

    @Test
    void onlyReadyRowsAndAuthenticatedOwnerEnterTheAllowlist() {
        Fixture a = fixture("READY", "movie-a", "Title", "Body");
        fixture("INDEXING", "movie-b", "Title", "Body");
        fixture("FAILED", "movie-c", "Title", "Body");
        Fixture other = fixture("READY", "movie-d", "Other", "Other");
        var mine = reader.readAllowed(QueryScope.MINE, a.userId, 5001);
        assertEquals(List.of(a.reviewId), mine.stream().map(RagQueryReader.Snapshot::reviewId).toList());
        var all = reader.readAllowed(QueryScope.ALL, a.userId, 5001);
        assertTrue(all.stream().anyMatch(row -> row.reviewId().equals(other.reviewId)));
        assertTrue(all.stream().allMatch(row -> row.fingerprint().length() == 64));
        assertTrue(reader.readAllowed(QueryScope.ALL, a.userId, 1).size() <= 1);
    }

    @Test
    void fingerprintDetectsCaseTrailingSpaceMovieCodeAndBoundaryChangesAtSameTimestamp() {
        Fixture a = fixture("READY", "movie-e", "Ab", "c");
        var original = reader.readReadySources(List.of(a.reviewId)).getFirst();
        for (String[] fields : List.of(new String[]{"ab", "c", "movie-e"},
                new String[]{"Ab ", "c", "movie-e"}, new String[]{"A", "bc", "movie-e"},
                new String[]{"Ab", "c", "movie-f"}, new String[]{"Ab", "c ", "movie-e"})) {
            tx(() -> em.createNativeQuery("update reviews set title=:title, content=:body, movie_code=:movie where review_id=:id")
                    .setParameter("title", fields[0]).setParameter("body", fields[1])
                    .setParameter("movie", fields[2]).setParameter("id", a.reviewId).executeUpdate());
            var latest = reader.readReadySources(List.of(a.reviewId)).getFirst();
            assertEquals(original.updatedAt(), latest.updatedAt());
            assertNotEquals(original.fingerprint(), latest.fingerprint());
        }
    }

    @Test
    void latestReadIgnoresTheCallingPersistenceContextAndHttpHasNoTransaction() {
        Fixture a = fixture("READY", "movie-g", "Before", "Body");
        reset(client);
        when(client.isEnabled()).thenReturn(true);
        when(client.query(any(), any(), anyInt())).thenAnswer(invocation -> {
            assertFalse(TransactionSynchronizationManager.isActualTransactionActive());
            tx(() -> em.createNativeQuery("update reviews set content='changed' where review_id=:id")
                    .setParameter("id", a.reviewId).executeUpdate());
            return new RagAnswer("폐기할 답변", false,
                    List.of(new RagAnswer.Source(a.reviewId, "Before", "Body", .9)), List.of("generate"));
        });
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            Review stale = em.find(Review.class, a.reviewId);
            assertEquals("Body", stale.getContent());
            RagAnswer result = service.query(a.userId, new RagQueryRequest("질문", QueryScope.MINE));
            assertTrue(result.abstained());
            assertTrue(result.sources().isEmpty());
            assertTrue(result.trace().isEmpty());
            assertEquals("Body", stale.getContent());
        });
    }

    @Test
    void oneBatchReadDropsDeletedOrInvalidatedSources() {
        Fixture a = fixture("READY", "movie-h", "A", "A");
        Fixture b = fixture("READY", "movie-i", "B", "B");
        assertEquals(2, reader.readReadySources(List.of(a.reviewId, b.reviewId)).size());
        tx(() -> {
            em.createNativeQuery("delete from reviews where review_id=:id").setParameter("id", a.reviewId).executeUpdate();
            em.createNativeQuery("update reviews set index_status='INDEXING' where review_id=:id")
                    .setParameter("id", b.reviewId).executeUpdate();
        });
        assertTrue(reader.readReadySources(List.of(a.reviewId, b.reviewId)).isEmpty());
        assertTrue(reader.readReadySources(List.of()).isEmpty());
    }

    private Fixture fixture(String state, String movie, String title, String body) {
        return new TransactionTemplate(manager).execute(status -> {
            String unique = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
            User user = new User(unique, "hash", unique, unique + "@test.com");
            em.persist(user);
            Review review = new Review(user, movie, title, body);
            em.persist(review);
            em.flush();
            em.createNativeQuery("update reviews set index_status=:state where review_id=:id")
                    .setParameter("state", state).setParameter("id", review.getReviewId()).executeUpdate();
            return new Fixture(user.getUserId(), review.getReviewId());
        });
    }

    private void tx(Runnable action) { new TransactionTemplate(manager).executeWithoutResult(status -> action.run()); }
    private record Fixture(Long userId, Long reviewId) { }
}
