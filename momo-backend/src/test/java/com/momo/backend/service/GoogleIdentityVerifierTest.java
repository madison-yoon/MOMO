package com.momo.backend.service;
import com.google.api.client.googleapis.auth.oauth2.*;
import org.junit.jupiter.api.*;
import java.security.*;
import java.time.Instant;
import java.util.*;
import io.jsonwebtoken.Jwts;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
// 로컬 RSA 서명과 신뢰 공개키로 실제 Google 검증 경로를 실행한다. Google 서버에는 접속하지 않는다.
class GoogleIdentityVerifierTest {
 KeyPair key; GoogleIdTokenVerifier verifier; GoogleIdentityVerifier service = new GoogleIdentityVerifier();
 @BeforeEach void setup() throws Exception {
  var generator = KeyPairGenerator.getInstance("RSA");generator.initialize(2048);key=generator.generateKeyPair();
  var keys=mock(GooglePublicKeysManager.class); when(keys.getPublicKeys()).thenReturn(List.of(key.getPublic()));
  when(keys.getJsonFactory()).thenReturn(com.google.api.client.json.gson.GsonFactory.getDefaultInstance());
  verifier=new GoogleIdTokenVerifier.Builder(keys).setAudience(List.of("client-id")).setAcceptableTimeSkewSeconds(0).build();
 }
 String token(String issuer, String audience, Instant expiry, String nonce, PrivateKey signing) {
  return Jwts.builder().issuer(issuer).audience().add(audience).and().subject("verified-sub")
   .issuedAt(Date.from(Instant.now().minusSeconds(10))).expiration(Date.from(expiry)).claim("nonce",nonce)
   .claim("email","verified@example.test").claim("email_verified",true).signWith(signing,Jwts.SIG.RS256).compact();
 }
 @Test void validSignatureIssuerAudienceExpiryNonceReturnVerifiedSub() {
  var jwt=token("https://accounts.google.com","client-id",Instant.now().plusSeconds(600),"nonce",key.getPrivate());
  var info=service.verify(verifier,jwt,"client-id","nonce");assertEquals("verified-sub",info.id());assertEquals("verified@example.test",info.email());
 }
 @Test void wrongSignatureIsRejected() throws Exception {
  var other=KeyPairGenerator.getInstance("RSA");other.initialize(2048);
  var jwt=token("https://accounts.google.com","client-id",Instant.now().plusSeconds(600),"nonce",other.generateKeyPair().getPrivate());
  assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.verify(verifier,jwt,"client-id","nonce"));
 }
 @Test void wrongIssuerAudienceExpiryAndNonceAreRejected() {
  for(var jwt:List.of(token("https://attacker.test","client-id",Instant.now().plusSeconds(600),"nonce",key.getPrivate()),
   token("https://accounts.google.com","other-client",Instant.now().plusSeconds(600),"nonce",key.getPrivate()),
   token("https://accounts.google.com","client-id",Instant.now().minusSeconds(1),"nonce",key.getPrivate()),
   token("https://accounts.google.com","client-id",Instant.now().plusSeconds(600),"wrong",key.getPrivate())))
   assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.verify(verifier,jwt,"client-id","nonce"));
 }
 @Test void missingExpiryOrAzpMismatchIsRejected() {
  var noExpiry=Jwts.builder().issuer("https://accounts.google.com").audience().add("client-id").and().subject("sub")
   .issuedAt(new Date()).claim("nonce","nonce").signWith(key.getPrivate(),Jwts.SIG.RS256).compact();
  assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.verify(verifier,noExpiry,"client-id","nonce"));
  var azp=Jwts.builder().issuer("https://accounts.google.com").audience().add("client-id").and().subject("sub")
   .issuedAt(new Date()).expiration(Date.from(Instant.now().plusSeconds(600))).claim("nonce","nonce").claim("azp","other")
   .signWith(key.getPrivate(),Jwts.SIG.RS256).compact();
  assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.verify(verifier,azp,"client-id","nonce"));
 }
}
