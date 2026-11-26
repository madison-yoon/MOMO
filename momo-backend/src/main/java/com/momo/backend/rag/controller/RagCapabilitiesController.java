package com.momo.backend.rag.controller;

import com.momo.backend.rag.service.ReindexAccessGuard;
import com.momo.backend.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
public class RagCapabilitiesController {
    private final ReindexAccessGuard access;
    @GetMapping("/capabilities")
    public Capabilities capabilities(Authentication authentication) {
        return new Capabilities(access.canReindex(MemberPrincipal.requireUserId(authentication)));
    }
    public record Capabilities(boolean canReindex) { }
}
