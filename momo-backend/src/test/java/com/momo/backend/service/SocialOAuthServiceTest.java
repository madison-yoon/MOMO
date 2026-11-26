package com.momo.backend.service;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.dto.auth.OAuthRequestContext;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
// 실제 외부 계정·키 없이 공급자별 HTTP 계약과 실패 처리를 확인한다.
class SocialOAuthServiceTest {
 final OAuthRequestContext context = new OAuthRequestContext("s".repeat(43), "test-nonce", "v".repeat(43));
 Map<AuthProvider, SocialOAuthService.Settings> settings() {
  return Map.of(AuthProvider.NAVER,new SocialOAuthService.Settings("naver-id","secret","http://localhost:3000/oauth/naver"),
   AuthProvider.GOOGLE,new SocialOAuthService.Settings("google-id","secret","http://localhost:3000/oauth/google"));
 }
 @Test void authorizeUsesConfiguredRedirectAndGoogleNoncePkce() {
  var service = new SocialOAuthService(RestClient.create(), new GoogleIdentityVerifier(), settings());
  var n = java.net.URI.create(service.authorizationUrl(AuthProvider.NAVER,context));
  var g = java.net.URI.create(service.authorizationUrl(AuthProvider.GOOGLE,context));
  assertEquals("nid.naver.com", n.getHost()); assertTrue(n.getQuery().contains("http://localhost:3000/oauth/naver"));
  assertEquals("accounts.google.com",g.getHost()); assertTrue(g.getQuery().contains("nonce=test-nonce"));
  assertTrue(g.getQuery().contains("code_challenge_method=S256")); assertFalse(g.getQuery().contains(context.codeVerifier()));
 }
 @Test void naverExchangesCodeStateAndPreservesCaseSensitiveIdentity() {
  var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();
  var service=new SocialOAuthService(builder.build(),new GoogleIdentityVerifier(),settings());
  server.expect(requestTo("https://nid.naver.com/oauth2.0/token")).andExpect(method(HttpMethod.POST))
   .andExpect(content().string(org.hamcrest.Matchers.containsString("state="+context.state())))
   .andRespond(withSuccess("{\"access_token\":\"provider-token\"}",MediaType.APPLICATION_JSON));
  server.expect(requestTo("https://openapi.naver.com/v1/nid/me")).andExpect(header("Authorization","Bearer provider-token"))
   .andRespond(withSuccess("{\"resultcode\":\"00\",\"response\":{\"id\":\"AbCd-ID\",\"nickname\":\"표본\",\"email\":\"user@example.test\"}}",MediaType.APPLICATION_JSON));
  var info=service.authenticate(AuthProvider.NAVER,"code",context);
  assertEquals("AbCd-ID",info.id());assertEquals("user@example.test",info.email());server.verify();
 }
 @Test void googleExchangePassesServerVerifierAndRequiresIdentityValidation() {
  var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();var verifier=mock(GoogleIdentityVerifier.class);
  var service=new SocialOAuthService(builder.build(),verifier,settings());
  server.expect(requestTo("https://oauth2.googleapis.com/token"))
   .andExpect(content().string(org.hamcrest.Matchers.containsString("code_verifier="+context.codeVerifier())))
   .andRespond(withSuccess("{\"id_token\":\"signed-identity\"}",MediaType.APPLICATION_JSON));
  when(verifier.verify("signed-identity","google-id","test-nonce")).thenReturn(new com.momo.backend.dto.auth.SocialUserInfo("subject","표본",null));
  assertEquals("subject",service.authenticate(AuthProvider.GOOGLE,"code",context).id());
  verify(verifier).verify("signed-identity","google-id","test-nonce");server.verify();
 }
 @Test void deletionPreservesPkceAndNonceValidationAndRequiresAccessToken() {
  var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();var verifier=mock(GoogleIdentityVerifier.class);
  var service=new SocialOAuthService(builder.build(),verifier,settings());
  var deletion = new com.momo.backend.dto.auth.OAuthRequestContext(context.state(),context.nonce(),context.codeVerifier(),
    com.momo.backend.dto.auth.OAuthPurpose.DELETE,AuthProvider.GOOGLE,41L);
  server.expect(requestTo("https://oauth2.googleapis.com/token"))
    .andExpect(content().string(org.hamcrest.Matchers.containsString("code_verifier="+context.codeVerifier())))
    .andRespond(withSuccess("{\"id_token\":\"signed-identity\",\"access_token\":\"ephemeral\"}",MediaType.APPLICATION_JSON));
  when(verifier.verify("signed-identity","google-id","test-nonce")).thenReturn(new com.momo.backend.dto.auth.SocialUserInfo("subject","표본",null));
  var result=service.authenticateForDeletion(AuthProvider.GOOGLE,"code",deletion);
  assertEquals("subject",result.identity().id()); assertEquals("ephemeral",result.accessToken());
  assertFalse(result.toString().contains("ephemeral"));
  assertFalse(new tools.jackson.databind.ObjectMapper().writeValueAsString(result).contains("ephemeral"));
  verify(verifier).verify("signed-identity","google-id","test-nonce");server.verify();
 }
 @Test void deletionCannotRevokeAnIdTokenWhenAccessTokenIsMissing() {
  var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();var verifier=mock(GoogleIdentityVerifier.class);
  var service=new SocialOAuthService(builder.build(),verifier,settings());
  server.expect(requestTo("https://oauth2.googleapis.com/token")).andRespond(withSuccess("{\"id_token\":\"identity\"}",MediaType.APPLICATION_JSON));
  when(verifier.verify("identity","google-id","test-nonce")).thenReturn(new com.momo.backend.dto.auth.SocialUserInfo("subject","표본",null));
  assertThrows(ResponseStatusException.class,()->service.authenticateForDeletion(AuthProvider.GOOGLE,"code",context));server.verify();
 }
 @Test void providerFailureDoesNotExposeSecretOrBody() {
  var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();
  var service=new SocialOAuthService(builder.build(),new GoogleIdentityVerifier(),settings());
  server.expect(anything()).andRespond(withStatus(HttpStatus.BAD_REQUEST).body("private-response-secret"));
  var error=assertThrows(ResponseStatusException.class,()->service.authenticate(AuthProvider.GOOGLE,"code",context));
  assertEquals(401,error.getStatusCode().value());assertFalse(error.toString().contains("private-response"));assertNull(error.getCause());
 }
 @Test void naverFailureAndMissingConfigFailClosed() {
  var builder=RestClient.builder();var server=MockRestServiceServer.bindTo(builder).build();
  var service=new SocialOAuthService(builder.build(),new GoogleIdentityVerifier(),settings());
  server.expect(anything()).andRespond(withSuccess("{\"access_token\":\"x\"}",MediaType.APPLICATION_JSON));
  server.expect(anything()).andRespond(withSuccess("{\"resultcode\":\"00\",\"response\":{}}",MediaType.APPLICATION_JSON));
  assertThrows(ResponseStatusException.class,()->service.authenticate(AuthProvider.NAVER,"code",context));
  var empty=new SocialOAuthService(RestClient.create(),new GoogleIdentityVerifier(),Map.of());
  assertEquals(503,assertThrows(ResponseStatusException.class,()->empty.authorizationUrl(AuthProvider.GOOGLE,context)).getStatusCode().value());
 }
}
