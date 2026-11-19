package com.momo.backend.service;

import com.momo.backend.dto.auth.KakaoUserInfo;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.entity.User;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.repository.RefreshTokenRepository;
import com.momo.backend.security.TokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.util.Base64;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

// 격리 H2에서 회원·토큰 저장과 동시 최초 로그인을 검증하며 로컬 MySQL에는 접속하지 않는다.
@DataJpaTest(showSql = false, properties = {
        "spring.datasource.url=jdbc:h2:mem:kakao-login;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false"})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Import({KakaoLoginService.class, RefreshTokenService.class, AuthService.class, KakaoLoginIntegrationTest.Config.class})
class KakaoLoginIntegrationTest {
    @TestConfiguration static class Config {
        @Bean TokenProvider tokenProvider() {
            byte[] secret = new byte[32]; new java.security.SecureRandom().nextBytes(secret);
            return new TokenProvider(Base64.getEncoder().encodeToString(secret), 1800000L, 604800000L);
        }
        @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    }
    @Autowired UserRepository users;
    @Autowired RefreshTokenRepository stored;
    @Autowired KakaoLoginService logins;
    @Autowired RefreshTokenService refresh;
    @Autowired TokenProvider tokens;
    @Autowired PasswordEncoder passwords;
    @Autowired AuthService auth;
    @org.springframework.test.context.bean.override.mockito.MockitoBean FirebaseStorageService firebase;

    @BeforeEach void clearIsolatedDatabase() { stored.deleteAll(); users.deleteAll(); }

    @Test void firstLoginAndReloginKeepOneIdentityAndRotateUsingExistingPolicy() {
        var info = new KakaoUserInfo("12345", "일반 회원과 중복될 이름", null);
        var first = logins.login(info);
        var again = logins.login(info);
        assertEquals(first.userId(), again.userId());
        assertEquals(1, users.count()); assertEquals(1, stored.count());
        assertTrue(tokens.validateToken(again.accessToken()));
        assertTrue(tokens.validateRefreshToken(again.refreshToken()));
        assertEquals(again.userId(), tokens.getUserId(again.accessToken()));
        assertFalse(tokens.validateToken(again.refreshToken()));
        assertThrows(com.momo.backend.exception.CustomException.class, () -> refresh.reissue(first.refreshToken()));
        assertEquals(1, stored.count());
        var rotated = refresh.reissue(again.refreshToken());
        assertNotEquals(rotated.refreshToken(), again.refreshToken());
        refresh.deleteByUserIdWithLock(again.userId());
        assertEquals(0, stored.count());
        assertThrows(com.momo.backend.exception.CustomException.class, () -> refresh.reissue(rotated.refreshToken()));
    }

    @Test void sameEmailDoesNotLinkToLocalAccountAndMissingEmailRemainsNull() {
        var local = users.saveAndFlush(new User("local-member", passwords.encode("LocalTest1!"), "일반회원", "same@example.test"));
        var social = logins.login(new KakaoUserInfo("42", "일반회원", "same@example.test"));
        assertNotEquals(local.getUserId(), social.userId());
        assertEquals(2, users.count());
        var third = logins.login(new KakaoUserInfo("43", "일반회원", null));
        var row = users.findById(third.userId()).orElseThrow();
        assertNull(row.getEmail()); assertEquals(AuthProvider.KAKAO, row.getProvider());
        assertTrue(row.getLoginId().length() <= 20); assertTrue(row.getNickname().length() <= 12);
        assertNotNull(row.getPasswordHash());
        assertNotEquals("일반회원", row.getNickname());
    }

    @Test void simultaneousFirstLoginDoesNotCreateTwoMembers() throws Exception {
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(2);
        try {
            Callable<Long> task = () -> { start.await(); return logins.login(new KakaoUserInfo("777", "동시로그인", null)).userId(); };
            var a = pool.submit(task); var b = pool.submit(task); start.countDown();
            assertEquals(a.get(15, TimeUnit.SECONDS), b.get(15, TimeUnit.SECONDS));
            assertEquals(1, users.count()); assertEquals(1, stored.count());
        } finally { pool.shutdownNow(); }
    }

    @Test void localPasswordLoginStillWorksAndSocialPasswordLoginIsDenied() {
        var local = users.saveAndFlush(new User("local-login", passwords.encode("LocalTest1!"), "일반로그인", "local@example.test"));
        assertEquals(local.getUserId(), auth.login("local-login", "LocalTest1!").getUserId());
        var social = logins.login(new KakaoUserInfo("99", "소셜로그인", null));
        assertThrows(IllegalArgumentException.class, () -> auth.login(social.loginId(), "LocalTest1!"));
    }
    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.EnumSource(value = AuthProvider.class, names = {"NAVER", "GOOGLE"})
    void newProvidersReuseMemberAndRefreshPolicy(AuthProvider provider) {
        var info = new com.momo.backend.dto.auth.SocialUserInfo("AbCd-subject", "표본", "same@example.test");
        var first = logins.login(provider, info);
        var second = logins.login(provider, info);
        assertEquals(first.userId(), second.userId()); assertEquals(1, users.count());
        assertEquals(first.userId(), tokens.getUserId(second.accessToken()));
        assertTrue(tokens.validateRefreshToken(second.refreshToken()));
        assertThrows(com.momo.backend.exception.CustomException.class, () -> refresh.reissue(first.refreshToken()));
        assertNotNull(refresh.reissue(second.refreshToken()));
        assertThrows(IllegalArgumentException.class, () -> auth.login(second.loginId(), "unused-password"));
        var other = logins.login(provider == AuthProvider.NAVER ? AuthProvider.GOOGLE : AuthProvider.NAVER, info);
        assertNotEquals(first.userId(), other.userId());
        var differentCase = logins.login(provider, new com.momo.backend.dto.auth.SocialUserInfo("abcd-subject", "표본", null));
        assertNotEquals(first.userId(), differentCase.userId());
        assertEquals(3, users.count());
    }
}
