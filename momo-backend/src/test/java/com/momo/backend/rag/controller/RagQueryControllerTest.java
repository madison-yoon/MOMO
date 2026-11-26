package com.momo.backend.rag.controller;

import com.momo.backend.config.SecurityConfig;
import com.momo.backend.config.PosterResourceConfig;
import com.momo.backend.exception.GlobalExceptionHandler;
import com.momo.backend.rag.dto.RagAnswer;
import com.momo.backend.rag.dto.RagQueryRequest;
import com.momo.backend.rag.enums.QueryScope;
import com.momo.backend.rag.service.RagQueryService;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.security.TokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 실제 JWT 필터와 요청 JSON 계약을 검증하며 외부 HTTP와 DB는 사용하지 않는다. */
@WebMvcTest(controllers = {RagQueryController.class, RagCapabilitiesController.class, ReindexController.class},
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = PosterResourceConfig.class),
        properties = {
        "jwt.secret=TW9tb1Rlc3RPbmx5U2VjcmV0S2V5Rm9ySlZUVGVzdHMxMjM0NQ=="})
@Import({SecurityConfig.class, TokenProvider.class, GlobalExceptionHandler.class})
class RagQueryControllerTest {
    @Autowired MockMvc mvc;
    @Autowired TokenProvider tokens;
    @MockitoBean RagQueryService service;
    @MockitoBean UserRepository users;
    @MockitoBean com.momo.backend.rag.service.ReindexAccessGuard access;
    @MockitoBean com.momo.backend.rag.service.ReviewIndexService indexing;

    @Test
    void capabilityExposesOnlyBooleanAndDetailsUseAuthenticatedOperatorId() throws Exception {
        when(users.existsById(7L)).thenReturn(true);
        when(access.canReindex(7L)).thenReturn(true);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/rag/capabilities")
                        .header("Authorization", "Bearer " + tokens.createToken(7L)))
                .andExpect(status().isOk()).andExpect(content().json("{\"canReindex\":true}"));
        when(indexing.indexError(1L,7L)).thenReturn("HTTP_503");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/rag/reindex/1/status")
                        .header("Authorization", "Bearer " + tokens.createToken(7L)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.indexError").value("HTTP_503"));
        verify(indexing).indexError(1L,7L);
    }

    @Test
    void authenticatedQueryUsesNumericJwtIdAndIgnoresClientSuppliedIds() throws Exception {
        when(users.existsById(7L)).thenReturn(true);
        when(service.query(eq(7L), any())).thenReturn(RagAnswer.hold());
        mvc.perform(post("/api/rag/query").header("Authorization", "Bearer " + tokens.createToken(7L))
                        .contentType("application/json")
                        .content("{\"question\":\"  질문  \",\"scope\":\"MINE\",\"userId\":99,\"review_ids\":[99]}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.abstained").value(true));
        verify(service).query(7L, new RagQueryRequest("질문", QueryScope.MINE));
    }

    @Test
    void anonymousInvalidAndDeletedMemberTokensAreBlocked() throws Exception {
        for (String token : new String[]{"", "invalid", tokens.createToken(99L)}) {
            mvc.perform(post("/api/rag/query").header("Authorization", "Bearer " + token)
                            .contentType("application/json").content("{\"question\":\"질문\",\"scope\":\"ALL\"}"))
                    .andExpect(status().isUnauthorized());
        }
        verifyNoInteractions(service);
    }

    @Test
    void unknownScopeAndMalformedJsonReturn400() throws Exception {
        when(users.existsById(7L)).thenReturn(true);
        for (String body : new String[]{"{\"question\":\"질문\",\"scope\":\"OTHER\"}", "{"}) {
            mvc.perform(post("/api/rag/query").header("Authorization", "Bearer " + tokens.createToken(7L))
                            .contentType("application/json").content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
        }
        verifyNoInteractions(service);
    }

    @Test
    void blankOverlongAndMissingScopeAreRejectedBeforeService() throws Exception {
        when(users.existsById(7L)).thenReturn(true);
        for (String body : new String[]{"{\"question\":\"  \",\"scope\":\"ALL\"}",
                "{\"question\":\"" + "가".repeat(501) + "\",\"scope\":\"ALL\"}", "{\"question\":\"질문\"}"}) {
            mvc.perform(post("/api/rag/query").header("Authorization", "Bearer " + tokens.createToken(7L))
                            .contentType("application/json").content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
        verifyNoInteractions(service);
    }

    @Test
    void boundaryQuestionIsTrimmedBeforeLengthValidation() throws Exception {
        when(users.existsById(7L)).thenReturn(true);
        when(service.query(anyLong(), any())).thenReturn(RagAnswer.hold());
        mvc.perform(post("/api/rag/query").header("Authorization", "Bearer " + tokens.createToken(7L))
                        .contentType("application/json")
                        .content("{\"question\":\"  " + "가".repeat(500) + "  \",\"scope\":\"ALL\"}"))
                .andExpect(status().isOk());
        verify(service).query(7L, new RagQueryRequest("가".repeat(500), QueryScope.ALL));
    }
}
