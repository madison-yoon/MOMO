package com.momo.backend.controller;
import com.momo.backend.dto.auth.*;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.service.*;
import com.momo.backend.config.SecurityConfig;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.security.TokenProvider;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import jakarta.servlet.http.Cookie;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
// 실제 Security 규칙에서 두 공개 엔드포인트만 열고 쿠키 없는 교환은 거부되는지 확인한다.
@WebMvcTest(controllers=OAuthController.class,excludeFilters=@org.springframework.context.annotation.ComponentScan.Filter(
 type=org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,classes=com.momo.backend.config.PosterResourceConfig.class))
@Import({SecurityConfig.class,OAuthStateService.class})
class SocialAuthControllerTest {
 @Autowired MockMvc mvc; @Autowired OAuthStateService states;
 @MockitoBean KakaoOAuthService kakao; @MockitoBean AccountDeletionService deletions;
 @MockitoBean SocialOAuthService social; @MockitoBean SocialLoginService logins;
 @MockitoBean TokenProvider tokens; @MockitoBean UserRepository users;
 @ParameterizedTest @ValueSource(strings={"naver","google"}) void authorizeAndSingleUseCookie(String provider)throws Exception {
  var type=AuthProvider.valueOf(provider.toUpperCase(java.util.Locale.ROOT));
  when(social.authorizationUrl(eq(type),any())).thenReturn("https://provider.test/authorize");
  mvc.perform(get("/api/auth/"+provider+"/authorize")).andExpect(status().isOk())
   .andExpect(cookie().httpOnly("momo_"+provider+"_state",true)).andExpect(header().string("Cache-Control","no-store"));
  var c=states.issue(type);var info=new SocialUserInfo("identity","표본",null);
  when(social.authenticate(eq(type),eq("code"),any())).thenReturn(info);
  when(logins.login(type,info)).thenReturn(new LoginResponse(1L,"social-member","표본",null,"momo-access","momo-refresh","Bearer",type));
  var request=post("/api/auth/"+provider).cookie(new Cookie("momo_"+provider+"_state",c.state()))
   .contentType("application/json").content("{\"code\":\"code\",\"state\":\""+c.state()+"\"}");
  mvc.perform(request).andExpect(status().isOk()).andExpect(jsonPath("$.userId").value(1)).andExpect(cookie().maxAge("momo_"+provider+"_state",0));
  mvc.perform(request).andExpect(status().isUnauthorized());verify(social,times(1)).authenticate(eq(type),eq("code"),any());
 }
 @ParameterizedTest @ValueSource(strings={"naver","google"}) void noCookieNeverCallsProvider(String provider)throws Exception {
  var c=states.issue(AuthProvider.valueOf(provider.toUpperCase(java.util.Locale.ROOT)));
  mvc.perform(post("/api/auth/"+provider).contentType("application/json").content("{\"code\":\"code\",\"state\":\""+c.state()+"\"}"))
   .andExpect(status().isUnauthorized());verifyNoInteractions(social,logins);
 }
}
