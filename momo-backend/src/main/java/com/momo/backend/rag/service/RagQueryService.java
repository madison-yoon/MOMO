package com.momo.backend.rag.service;

import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.dto.RagAnswer;
import com.momo.backend.rag.dto.RagQueryRequest;
import com.momo.backend.rag.enums.QueryScope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RagQueryService {
    private static final Set<String> SAFE_TRACE = Set.of("retrieve", "grade", "rewrite", "generate", "abstain", "format");
    private final RagClient client;
    private final RagQueryReader reader;
    private final int topK;
    private final RagQueryBudget budget;
    @Value("${RAG_QUERY_ENABLED:true}")
    private boolean queryEnabled = true;
    private final int maxAllowedReviews;

    @org.springframework.beans.factory.annotation.Autowired
    public RagQueryService(RagClient client, RagQueryReader reader, RagQueryBudget budget,
                           @Value("${rag.query.top-k:5}") int topK,
                           @Value("${rag.query.max-allowed-reviews:5000}") int maxAllowedReviews) {
        if (topK < 1 || topK > 5 || maxAllowedReviews < 1 || maxAllowedReviews == Integer.MAX_VALUE) {
            throw new IllegalArgumentException("RAG 질문 설정 범위를 확인해 주세요.");
        }
        this.client = client;
        this.budget = budget;
        this.reader = reader;
        this.topK = topK;
        this.maxAllowedReviews = maxAllowedReviews;
    }

    public RagQueryService(RagClient client, RagQueryReader reader, int topK, int maxAllowedReviews) {
        this(client, reader, new RagQueryBudget(), topK, maxAllowedReviews);
    }

    // 상위 호출자의 트랜잭션도 중단하여 HTTP 대기 중 DB 트랜잭션을 유지하지 않는다.
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public RagAnswer query(Long userId, RagQueryRequest request) {
        if (userId == null || userId <= 0) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        if (request == null || request.scope() == null || request.question() == null
                || request.question().isBlank() || request.question().length() > 500) {
            throw new IllegalArgumentException("질문은 1~500자, 검색 범위는 ALL 또는 MINE이어야 합니다.");
        }
        if (!client.isEnabled() || !queryEnabled) throw unavailable();
        try (var ignored = budget.enter(userId)) { return execute(userId, request); }
    }

    private RagAnswer execute(Long userId, RagQueryRequest request) {

        List<RagQueryReader.Snapshot> initial = reader.readAllowed(request.scope(), userId, maxAllowedReviews + 1);
        if (initial.isEmpty()) return RagAnswer.hold();
        if (initial.size() > maxAllowedReviews) {
            return new RagAnswer("검색 가능한 리뷰가 한도를 초과했습니다. MINE 범위를 이용하거나 운영자에게 문의해 주세요.",
                    true, List.of(), List.of());
        }
        Map<Long, RagQueryReader.Snapshot> allowed = initial.stream()
                .collect(Collectors.toMap(RagQueryReader.Snapshot::reviewId, Function.identity()));
        RagAnswer answer;
        try {
            answer = client.query(request.question(), initial.stream().map(RagQueryReader.Snapshot::reviewId).toList(), topK, initial.stream().collect(Collectors.toMap(row -> row.reviewId().toString(), RagQueryReader.Snapshot::fingerprint)));
        } catch (org.springframework.web.client.RestClientResponseException failure) {
            if (failure.getStatusCode().value() == 429)
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "AI 서비스의 일일 이용 한도를 초과했습니다.");
            throw unavailable();
        } catch (RuntimeException ignored) {
            // 원격 응답이나 예외 메시지에 포함된 민감 정보를 사용자에게 노출하지 않는다.
            throw unavailable();
        }
        if (answer == null || answer.answer() == null || answer.answer().isBlank()
                || answer.sources() == null || answer.trace() == null
                || answer.trace().stream().anyMatch(node -> node == null || !SAFE_TRACE.contains(node))
                || (!answer.abstained() && answer.sources().isEmpty())) return RagAnswer.hold();

        Set<Long> sourceIds = new LinkedHashSet<>();
        for (RagAnswer.Source source : answer.sources()) {
            if (source == null || source.review_id() == null || !allowed.containsKey(source.review_id())
                    || source.fingerprint() == null || !source.fingerprint().equals(allowed.get(source.review_id()).fingerprint())
                    || source.title() == null || source.snippet() == null || !Double.isFinite(source.score())) {
                return RagAnswer.hold();
            }
            sourceIds.add(source.review_id());
        }
        if (!sourceIds.isEmpty()) {
            Map<Long, RagQueryReader.Snapshot> latest = reader.readReadySources(List.copyOf(sourceIds)).stream()
                    .collect(Collectors.toMap(RagQueryReader.Snapshot::reviewId, Function.identity()));
            for (Long id : sourceIds) {
                RagQueryReader.Snapshot now = latest.get(id);
                if (now == null || !now.equals(allowed.get(id))
                        || (request.scope() == QueryScope.MINE && !userId.equals(now.ownerId()))) {
                    // 출처 일부만 제거하면 생성 답변에 남은 원본이 유출될 수 있어 전체 폐기한다.
                    return RagAnswer.hold();
                }
            }
        }
        return new RagAnswer(answer.answer(), answer.abstained(), List.copyOf(answer.sources()), List.copyOf(answer.trace()));
    }

    private ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "RAG 질문 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
}
