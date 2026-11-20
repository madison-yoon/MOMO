package com.momo.backend.service;

import com.momo.backend.dto.auth.*;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.*;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.web.server.ResponseStatusException;
import java.sql.SQLException;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

/** 외부 해제와 내부 삭제의 경계를 조정한다. HTTP 호출 중 DB 트랜잭션·회원 잠금을 유지하지 않는다. */
@Service
@Slf4j
public class AccountDeletionService {
    public static final String CONFIRMATION = "MOMO 회원 탈퇴";
    private final AuthService auth;
    private final KakaoOAuthService kakao;
    private final SocialOAuthService social;
    private final PlatformTransactionManager transactions;
    // 고정 개수 잠금으로 동일 프로세스의 동시 탈퇴를 막고 회원별 잠금 객체가 무한 증가하지 않게 한다.
    private final ReentrantLock[] locks = new ReentrantLock[64];

    public AccountDeletionService(AuthService auth, KakaoOAuthService kakao, SocialOAuthService social, PlatformTransactionManager transactions) {
        this.auth = auth; this.kakao = kakao; this.social = social; this.transactions = transactions;
        for (int i = 0; i < locks.length; i++) locks[i] = new ReentrantLock();
    }

    /** LOCAL은 기존 비밀번호 탈퇴, KAKAO는 서버 대상 ID와 Admin Key를 사용한다. */
    public void delete(Long userId, UserDeleteRequest request) {
        var lock = acquire(userId);
        try {
            User user = auth.getLoginUser(userId);
            if (user.getProvider() == AuthProvider.LOCAL) {
                auth.deleteMyAccount(userId, request.password());
                return;
            }
            requireConsent(request.agreed(), request.confirmation());
            if (user.getProvider() != AuthProvider.KAKAO) throw rejected("공급자 인증을 완료한 뒤 탈퇴해 주세요.");
            String providerId = user.getProviderId();
            kakao.unlink(providerId);
            deleteAfterUnlink(userId, AuthProvider.KAKAO, providerId);
        } finally { lock.unlock(); }
    }

    /** 인가 시작 전에 DB 공급자와 동의를 검증하며 대상 ID는 인증된 MOMO 회원만 사용한다. */
    public void validateStart(Long userId, AuthProvider provider, Boolean agreed, String confirmation) {
        requireConsent(agreed, confirmation);
        requireMember(userId, provider);
    }

    /** DELETE 인증 결과는 회원 생성·JWT 발급으로 보내지 않고 ID 일치 후 해제·삭제한다. */
    public void complete(Long userId, AuthProvider provider, OAuthRequestContext context, OAuthDeleteRequest request) {
        var lock = acquire(userId);
        try {
            requireConsent(request.agreed(), request.confirmation());
            if (context.purpose() != OAuthPurpose.DELETE || context.provider() != provider
                    || !Objects.equals(context.targetUserId(), userId)) throw rejected("탈퇴 인증 대상이 일치하지 않습니다.");
            requireMember(userId, provider);
            OAuthAuthenticationResult result;
            try { result = social.authenticateForDeletion(provider, request.code(), context); }
            catch (ResponseStatusException error) {
                // 공급자 인증 오류를 MOMO JWT 만료로 오해해 소비한 code를 재전송하지 않도록 구분한다.
                if (error.getStatusCode().value() == 401) throw rejected("외부 계정을 확인하지 못했습니다. 탈퇴 인증을 다시 시작해 주세요.");
                throw error;
            }
            User current = requireMember(userId, provider);
            if (!Objects.equals(current.getProviderId(), result.identity().id())) throw rejected("현재 MOMO 회원에 연결된 외부 계정으로 인증해 주세요.");
            String providerId = current.getProviderId();
            social.unlink(provider, result.accessToken());
            deleteAfterUnlink(userId, provider, providerId);
        } finally { lock.unlock(); }
    }

    private User requireMember(Long userId, AuthProvider provider) {
        User user = auth.getLoginUser(userId);
        if ((provider != AuthProvider.NAVER && provider != AuthProvider.GOOGLE) || user.getProvider() != provider
                || user.getProviderId() == null || user.getProviderId().isBlank()) throw rejected("탈퇴 공급자가 회원 정보와 일치하지 않습니다.");
        return user;
    }

    private void requireConsent(Boolean agreed, String confirmation) {
        if (!Boolean.TRUE.equals(agreed) || !CONFIRMATION.equals(confirmation)) throw rejected("탈퇴 안내에 동의하고 확인 문구를 정확히 입력해 주세요.");
    }

    private ReentrantLock acquire(Long userId) {
        var lock = locks[Math.floorMod(userId.hashCode(), locks.length)];
        if (!lock.tryLock()) throw new ResponseStatusException(HttpStatus.CONFLICT, "탈퇴 처리가 진행 중입니다. 결과를 기다려 주세요.");
        return lock;
    }

    /** 외부 성공은 반복하지 않고, 롤백이 확인된 쓰기 단계의 MySQL 잠금 오류만 최대 두 번 더 시도한다. */
    private void deleteAfterUnlink(Long userId, AuthProvider provider, String providerId) {
        String trace = UUID.randomUUID().toString();
        var definition = new DefaultTransactionDefinition(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        for (int attempt = 1; attempt <= 3; attempt++) {
            TransactionStatus status = null;
            boolean committing = false;
            try {
                status = transactions.getTransaction(definition);
                auth.deleteVerifiedSocialAccount(userId, provider, providerId);
                // commit 호출 이후의 예외는 결과가 불명확할 수 있으므로 자동 재시도하지 않는다.
                committing = true;
                transactions.commit(status);
                return;
            } catch (RuntimeException error) {
                boolean rolledBack = false;
                if (!committing && status != null && !status.isCompleted()) {
                    try { transactions.rollback(status); rolledBack = true; }
                    catch (RuntimeException rollbackError) {
                        log.error("탈퇴 롤백 확인 실패 trace={} provider={} userId={} type={}", trace, provider, userId, rollbackError.getClass().getSimpleName());
                    }
                }
                var sql = sqlCause(error);
                String sqlState = sql != null && sql.getSQLState() != null && sql.getSQLState().matches("[A-Za-z0-9]{5}") ? sql.getSQLState() : "UNKNOWN";
                // SQL 원문·인자·예외 메시지는 남기지 않고 고정 형식 코드만 기록한다.
                log.error("외부 해제 후 MOMO 삭제 실패 trace={} provider={} userId={} attempt={} phase={} type={} sqlState={} vendorCode={}",
                        trace, provider, userId, attempt, committing ? "COMMIT" : "WRITE", error.getClass().getSimpleName(), sqlState, sql == null ? 0 : sql.getErrorCode());
                if (attempt < 3 && rolledBack && retryableLock(error)) continue;
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "외부 연결은 해제되었으나 MOMO 회원 삭제를 완료하지 못했거나 결과를 확인할 수 없습니다. 문의 시 확인 번호: " + trace);
            }
        }
    }

    private boolean retryableLock(RuntimeException error) {
        if (!(error instanceof PessimisticLockingFailureException)) return false;
        var sql = sqlCause(error);
        return sql != null && ((sql.getErrorCode() == 1213 && "40001".equals(sql.getSQLState()))
                || (sql.getErrorCode() == 1205 && ("HY000".equals(sql.getSQLState()) || "41000".equals(sql.getSQLState()))));
    }

    private SQLException sqlCause(Throwable error) {
        for (int depth = 0; error != null && depth < 32; depth++, error = error.getCause())
            if (error instanceof SQLException sql) return sql;
        return null;
    }

    private ResponseStatusException rejected(String message) { return new ResponseStatusException(HttpStatus.FORBIDDEN, message); }
}
