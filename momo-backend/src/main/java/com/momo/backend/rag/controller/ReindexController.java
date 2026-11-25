package com.momo.backend.rag.controller;

import com.momo.backend.rag.service.ReviewIndexService;
import com.momo.backend.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag/reindex")
@RequiredArgsConstructor
public class ReindexController {
    private final ReviewIndexService service;

    // 운영자 ID는 요청 본문이 아닌 검증된 JWT principal에서만 얻는다.
    @PostMapping("/{reviewId}")
    public SingleResult reindex(@PathVariable Long reviewId, Authentication authentication) {
        return new SingleResult(reviewId, service.reindex(reviewId, MemberPrincipal.requireUserId(authentication)));
    }

    @PostMapping("/all")
    public ReviewIndexService.ReindexSummary reindexAll(Authentication authentication) {
        return service.reindexAll(MemberPrincipal.requireUserId(authentication));
    }

    public record SingleResult(Long reviewId, ReviewIndexService.Outcome result) { }
}
