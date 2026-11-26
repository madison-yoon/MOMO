package com.momo.backend.controller;

import com.momo.backend.config.SecurityConfig;
import com.momo.backend.dto.auth.*;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.security.*;
import com.momo.backend.service.*;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

/** 실제 Security와 state를 사용해 공개 로그인과 인증된 탈퇴의 경계를 확인한다. */
@WebMvcTest(controllers = OAuthController.class, excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, classes = com.momo.backend.config.PosterResourceConfig.class))
@Import({SecurityConfig.class, OAuthStateService.class})
class OAuthDeletionControllerTest {
    @Autowired MockMvc mvc;
    @Autowired OAuthStateService states;
    @MockitoBean KakaoOAuthService kakao;
    @MockitoBean SocialOAuthService social;
    @MockitoBean SocialLoginService logins;
    @MockitoBean AccountDeletionService deletions;
    @MockitoBean TokenProvider tokens;
    @MockitoBean UserRepository users;
    final String consent = "\"agreed\":true,\"confirmation\":\"MOMO 회원 탈퇴\"";

    private org.springframework.test.web.servlet.request.RequestPostProcessor member(long id) {
        return authentication(new UsernamePasswordAuthenticationToken(new MemberPrincipal(id), null, java.util.List.of()));
    }
    @Test void deletionEndpointsRequireJwtBeforeConsumingAnything() throws Exception {
        mvc.perform(post("/api/auth/google/delete/authorize").contentType("application/json").content("{" + consent + "}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/google/delete/complete").contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(social, deletions, logins);
    }
    @Test void loginAndOtherMemberCannotConsumeDeleteAndSuccessfulDeleteDoesNotLogin() throws Exception {
        var context = states.issue(AuthProvider.GOOGLE, OAuthPurpose.DELETE, 41L);
        var body = "{\"code\":\"code\",\"state\":\"" + context.state() + "\"," + consent + "}";
        var cookie = new Cookie("momo_google_delete_state", context.state());
        mvc.perform(post("/api/auth/google").cookie(cookie).contentType("application/json").content(body))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/google/delete/complete").with(member(42L)).cookie(cookie).contentType("application/json").content(body))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/google/delete/complete").with(member(41L)).cookie(cookie).contentType("application/json").content(body))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(cookie().maxAge("momo_google_delete_state", 0));
        mvc.perform(post("/api/auth/google/delete/complete").with(member(41L)).cookie(cookie).contentType("application/json").content(body))
                .andExpect(status().isForbidden());
        verify(deletions).complete(eq(41L), eq(AuthProvider.GOOGLE), eq(context), any());
        verify(social, never()).authenticate(any(), any(), any());
        verify(social, never()).authenticateForDeletion(any(), any(), any());
        verifyNoInteractions(logins);
    }
    @Test void authorizeUsesDeleteCookieOnly() throws Exception {
        when(social.authorizationUrl(eq(AuthProvider.NAVER), any())).thenReturn("https://nid.naver.com/oauth2.0/authorize");
        mvc.perform(post("/api/auth/naver/delete/authorize").with(member(41L)).contentType("application/json").content("{" + consent + "}"))
                .andExpect(status().isOk()).andExpect(cookie().httpOnly("momo_naver_delete_state", true))
                .andExpect(cookie().doesNotExist("momo_naver_state"));
        verify(deletions).validateStart(41L, AuthProvider.NAVER, true, "MOMO 회원 탈퇴");
    }
}
