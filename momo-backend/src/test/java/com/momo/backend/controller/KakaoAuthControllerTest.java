package com.momo.backend.controller;

import com.momo.backend.dto.auth.KakaoUserInfo;
import com.momo.backend.dto.auth.LoginResponse;
import com.momo.backend.service.KakaoLoginService;
import com.momo.backend.service.KakaoOAuthService;
import com.momo.backend.service.KakaoStateService;
import com.momo.backend.config.SecurityConfig;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.security.TokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import jakarta.servlet.http.Cookie;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 실제 Security 규칙과 state 쿠키를 사용하되 카카오·DB 회원 저장은 모의 처리한다.
@WebMvcTest(controllers = KakaoAuthController.class, excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,
        classes = com.momo.backend.config.PosterResourceConfig.class))
@Import({SecurityConfig.class, KakaoStateService.class})
class KakaoAuthControllerTest {
    @Autowired MockMvc mvc;
    @Autowired KakaoStateService states;
    @MockitoBean KakaoOAuthService oauth;
    @MockitoBean KakaoLoginService logins;
    @MockitoBean TokenProvider tokens;
    @MockitoBean UserRepository users;

    @Test void authorizeIsPublicAndBindsHttpOnlyCookie() throws Exception {
        when(oauth.authorizationUrl(anyString())).thenReturn("https://kauth.kakao.com/oauth/authorize?state=test");
        mvc.perform(get("/api/auth/kakao/authorize")).andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(cookie().httpOnly("momo_kakao_state", true))
                .andExpect(jsonPath("$.expiresIn").value(300));
    }

    @Test void callbackWithoutJwtSucceedsOnlyOnceAndUsesExistingLoginResponse() throws Exception {
        String state = states.issue();
        var info = new KakaoUserInfo("123", "표본회원", null);
        when(oauth.authenticate("code")).thenReturn(info);
        when(logins.login(info)).thenReturn(new LoginResponse(1L, "kakao-test", "표본회원", null, "momo-test-access", "momo-test-refresh", "Bearer"));
        var request = post("/api/auth/kakao").cookie(new Cookie("momo_kakao_state", state))
                .contentType("application/json").content("{\"code\":\"code\",\"state\":\"" + state + "\"}");
        mvc.perform(request).andExpect(status().isOk()).andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.accessToken").value("momo-test-access"))
                .andExpect(jsonPath("$.refreshToken").value("momo-test-refresh"))
                .andExpect(cookie().maxAge("momo_kakao_state", 0));
        mvc.perform(request).andExpect(status().isUnauthorized());
        verify(oauth, times(1)).authenticate("code");
    }

    @Test void missingCookieOrMalformedCodeNeverCallsProvider() throws Exception {
        String state = states.issue();
        mvc.perform(post("/api/auth/kakao").contentType("application/json")
                .content("{\"code\":\"code\",\"state\":\"" + state + "\"}")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/kakao").contentType("application/json")
                .content("{\"code\":\"\",\"state\":\"bad\"}")).andExpect(status().isBadRequest());
        verifyNoInteractions(oauth, logins);
    }
}
