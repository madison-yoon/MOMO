package com.momo.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

/** 공급자 통신의 시간 제한과 비밀값을 포함하지 않는 오류 응답을 공유한다. */
final class OAuthHttpSupport {
    private OAuthHttpSupport() {}

    static RestClient client() {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); factory.setReadTimeout(10000);
        return RestClient.builder().requestFactory(factory).build();
    }

    // 외부 예외 원문에는 토큰·요청 주소가 들어갈 수 있어 원인 예외를 연결하지 않는다.
    static ResponseStatusException unlinkFailure(RestClientException error) {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, error instanceof RestClientResponseException
                ? "외부 계정 연결 해제에 실패했습니다. MOMO 탈퇴는 완료되지 않았습니다."
                : "외부 연결 해제 결과를 확인할 수 없습니다. MOMO 탈퇴는 완료되지 않았으며 자동 재시도하지 않습니다.");
    }

    static ResponseStatusException authenticationFailure(RestClientException error) {
        if (error instanceof RestClientResponseException response && !response.getStatusCode().is5xxServerError()
                && response.getStatusCode().value() != 429) {
            return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "소셜 인증에 실패했습니다. 인증을 다시 시작해 주세요.");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "소셜 인증 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
}
