package com.momo.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GooglePublicKeysManager;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.momo.backend.dto.auth.SocialUserInfo;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

// Google 공식 검증기로 서명·발급자·대상·만료를 검증한 후에만 sub를 회원 식별자로 사용한다.
@Component
public class GoogleIdentityVerifier {
    // 한 서비스 인스턴스가 공개키 캐시를 공유해 로그인마다 인증서 다운로드를 반복하지 않는다.
    private final GooglePublicKeysManager keys = new GooglePublicKeysManager(new NetHttpTransport(), GsonFactory.getDefaultInstance());

    public SocialUserInfo verify(String encoded, String audience, String nonce) {
        var verifier = new GoogleIdTokenVerifier.Builder(keys)
                .setAudience(List.of(audience)).setAcceptableTimeSkewSeconds(0).build();
        return verify(verifier, encoded, audience, nonce);
    }

    // 공개키 다운로드·캐시는 공식 라이브러리에 맡기며 테스트는 로컬 신뢰 키로 동일 검증 경로를 실행한다.
    SocialUserInfo verify(GoogleIdTokenVerifier verifier, String encoded, String audience, String nonce) {
        try {
            if (encoded == null || encoded.isBlank() || encoded.length() > 16384 || nonce == null || nonce.isBlank()) throw denied();
            var token = verifier.verify(encoded);
            if (token == null) throw denied();
            var p = token.getPayload();
            String actualNonce = p.get("nonce") instanceof String n ? n : "";
            Object azp = p.get("azp");
            if (p.getExpirationTimeSeconds() == null || p.getIssuedAtTimeSeconds() == null
                    || p.getIssuedAtTimeSeconds() > System.currentTimeMillis() / 1000
                    || p.getSubject() == null || p.getSubject().isBlank() || p.getSubject().length() > 255
                    || !MessageDigest.isEqual(nonce.getBytes(StandardCharsets.UTF_8), actualNonce.getBytes(StandardCharsets.UTF_8))
                    || (azp != null && !audience.equals(azp))
                    || (p.getAudienceAsList().size() > 1 && azp == null)) throw denied();
            String name = p.get("name") instanceof String n ? n : "구글회원";
            String email = Boolean.TRUE.equals(p.getEmailVerified()) ? SocialOAuthService.email(p.getEmail()) : null;
            return new SocialUserInfo(p.getSubject(), name, email);
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) { throw denied(); }
    }

    private ResponseStatusException denied() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google 사용자 신원을 확인하지 못했습니다. 다시 로그인해 주세요.");
    }
}
