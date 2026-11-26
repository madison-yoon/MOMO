package com.momo.backend.service;
import com.momo.backend.entity.AuthProvider;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
// 공급자 혼동과 브라우저 바인딩 누락을 실제 외부 통신 없이 차단하는지 확인한다.
class SocialOAuthStateTest {
 @Test void providerBindingAndSingleConsumption() {
  var states = new OAuthStateService();
  var context = states.issue(AuthProvider.GOOGLE);
  assertEquals(43, context.state().length());
  assertEquals(43, context.codeVerifier().length());
  assertFalse(context.nonce().isBlank());
  assertThrows(ResponseStatusException.class, () -> states.consume(AuthProvider.NAVER, context.state(), context.state()));
  assertThrows(ResponseStatusException.class, () -> states.consume(AuthProvider.GOOGLE, context.state(), "other"));
  assertEquals(context, states.consume(AuthProvider.GOOGLE, context.state(), context.state()));
  assertThrows(ResponseStatusException.class, () -> states.consume(AuthProvider.GOOGLE, context.state(), context.state()));
 }
 @Test void expiredProviderContextFailsClosed() {
  var clock = new java.util.concurrent.atomic.AtomicLong();
  var states = new OAuthStateService(clock::get);
  var c = states.issue(AuthProvider.NAVER);
  clock.set(java.time.Duration.ofMinutes(6).toNanos());
  assertThrows(ResponseStatusException.class, () -> states.consume(AuthProvider.NAVER, c.state(), c.state()));
 }
}
