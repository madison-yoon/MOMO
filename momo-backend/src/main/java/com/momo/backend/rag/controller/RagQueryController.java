package com.momo.backend.rag.controller;

import com.momo.backend.exception.ErrorResponse;
import com.momo.backend.rag.dto.RagAnswer;
import com.momo.backend.rag.dto.RagQueryRequest;
import com.momo.backend.rag.service.RagQueryService;
import com.momo.backend.security.MemberPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag")
public class RagQueryController {
    private final RagQueryService service;

    public RagQueryController(RagQueryService service) { this.service = service; }

    @PostMapping("/query")
    public RagAnswer query(@Valid @RequestBody RagQueryRequest request, Authentication authentication) {
        return service.query(MemberPrincipal.requireUserId(authentication), request);
    }

    // 잘못된 enum이나 JSON 본문은 원격 서비스 호출 전에 400으로 거부한다.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> invalidBody() {
        return ResponseEntity.badRequest().body(new ErrorResponse("INVALID_REQUEST", "질문과 ALL 또는 MINE 검색 범위를 확인해 주세요."));
    }
}
