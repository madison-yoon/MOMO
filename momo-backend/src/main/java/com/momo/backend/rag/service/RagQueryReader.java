package com.momo.backend.rag.service;

import com.momo.backend.rag.enums.QueryScope;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.hibernate.dialect.H2Dialect;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

/** 매번 새 읽기 트랜잭션의 단일 SELECT로 원본 식별 정보만 가져온다. */
@Component
public class RagQueryReader {
    private final EntityManager entityManager;

    public RagQueryReader(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public List<Snapshot> readAllowed(QueryScope scope, Long userId, int limit) {
        Query query = entityManager.createNativeQuery(selectSnapshot()
                + " where index_status='READY'"
                + (scope == QueryScope.MINE ? " and user_id=:userId" : "")
                + " order by review_id");
        if (scope == QueryScope.MINE) query.setParameter("userId", userId);
        return snapshots(query.setMaxResults(limit));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public List<Snapshot> readReadySources(List<Long> reviewIds) {
        if (reviewIds.isEmpty()) return List.of();
        return snapshots(entityManager.createNativeQuery(selectSnapshot()
                + " where index_status='READY' and review_id in (:ids)")
                .setParameter("ids", reviewIds));
    }

    private String selectSnapshot() {
        // 길이 접두어로 필드 경계를 보존하고 DB에서 해시하여 본문 대량 전송을 피한다.
        // 해시는 원본 바이트를 사용하므로 collation, 대소문자, 후행 공백에 영향받지 않는다.
        boolean h2 = entityManager.getEntityManagerFactory().unwrap(SessionFactoryImplementor.class)
                .getJdbcServices().getDialect() instanceof H2Dialect;
        // H2의 CHAR_LENGTH는 UTF-16 단위다. 보충 문자를 한 문자로 치환하여 MySQL 문자 수와 맞춘다.
        String framed = "concat(" + characterLength("title", h2) + ", ':', title, "
                + characterLength("content", h2) + ", ':', content, "
                + characterLength("movie_code", h2) + ", ':', movie_code)";
        String fingerprint = h2
                ? "lower(rawtohex(hash('SHA-256', stringtoutf8(" + framed + "))))"
                : "sha2(" + framed + ", 256)";
        return "select review_id, user_id, updated_at, " + fingerprint + " from reviews";
    }

    private String characterLength(String column, boolean h2) {
        return h2 ? "char_length(regexp_replace(" + column + ", '[\\x{10000}-\\x{10FFFF}]', 'x'))"
                : "char_length(" + column + ")";
    }

    @SuppressWarnings("unchecked")
    private List<Snapshot> snapshots(Query query) {
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(row -> new Snapshot(((Number) row[0]).longValue(),
                ((Number) row[1]).longValue(), row[2] instanceof Timestamp timestamp
                ? timestamp.toLocalDateTime() : (LocalDateTime) row[2], (String) row[3])).toList();
    }

    public record Snapshot(Long reviewId, Long ownerId, LocalDateTime updatedAt, String fingerprint) { }
}
