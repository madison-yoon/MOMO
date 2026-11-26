package com.momo.backend.rag.service;

import com.momo.backend.rag.client.RagClient;
import com.momo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/** JWT로 얻은 숫자 회원 ID만 받으며 빈 운영자 목록은 항상 거부한다. */
@Component
public class ReindexAccessGuard {
    private final UserRepository users;
    private final RagClient client;
    private final boolean enabled;
    private final Set<Long> operatorIds;

    public ReindexAccessGuard(UserRepository users, RagClient client,
            @Value("${rag.reindex.enabled:false}") boolean enabled,
            @Value("${rag.reindex.operator-ids:}") String operatorIds) {
        this.users = users;
        this.client = client;
        this.enabled = enabled;
        this.operatorIds = Arrays.stream(operatorIds.split(",")).map(String::trim)
                .filter(value -> !value.isEmpty()).map(Long::valueOf).collect(Collectors.toUnmodifiableSet());
    }

    public void check(Long userId) {
        if (userId == null || userId <= 0 || !users.existsById(userId))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효한 회원 인증이 필요합니다.");
        if (!enabled || !operatorIds.contains(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "재색인 권한이 없습니다.");
        if (!client.isEnabled())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "RAG 기능을 사용할 수 없습니다.");
    }
}
