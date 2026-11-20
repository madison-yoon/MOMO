
package com.momo.backend.service;

import java.io.IOException;

import com.momo.backend.dto.auth.SignupRequest;
import com.momo.backend.dto.auth.UserResponse;
import com.momo.backend.dto.auth.UserUpdateRequest;
import com.momo.backend.entity.User;
import com.momo.backend.repository.CommentReactionRepository;
import com.momo.backend.repository.CommentRepository;
import com.momo.backend.repository.MovieRatingRepository;
import com.momo.backend.repository.FavoriteMovieRepository;
import com.momo.backend.repository.ReviewReactionRepository;
import com.momo.backend.repository.ReviewRepository;
import com.momo.backend.repository.UserRepository;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReviewRepository reviewRepository;
    private final CommentRepository commentRepository;
    private final ReviewReactionRepository reviewReactionRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final FirebaseStorageService firebaseStorageService;
    private final MovieRatingRepository movieRatingRepository;
    private final FavoriteMovieRepository favoriteMovieRepository;
    private final RefreshTokenService refreshTokenService;

    // 회원가입

    public boolean isMember(String loginId) {
        return userRepository.existsByLoginId(loginId);
    }

    public UserResponse signUp(SignupRequest dto) {
        if (userRepository.existsByLoginId(dto.getLoginId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        if (userRepository.existsByNickname(dto.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = new User(
                dto.getLoginId(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getNickname(),
                dto.getEmail());

        try {
            // 중복 사전 조회와 별도로 DB unique 제약조건을 최종 방어선으로 사용한다.
            return new UserResponse(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 사용 중인 아이디 또는 닉네임입니다.",
                    duplicate
            );
        }
    }

    // 로그인 및 회원 정보 조회

    public User login(String loginId, String password) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        // 소셜 회원의 임시 비밀번호 해시는 기존 NOT NULL 제약 보존용이며 일반 로그인에 사용하지 않는다.
        if (user.getProvider() != com.momo.backend.entity.AuthProvider.LOCAL
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public User getLoginUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
    }

    public boolean checkLoginIdExists(String loginId) {
        return userRepository.existsByLoginId(loginId);
    }

    // 회원 정보 수정

    public UserResponse updateMyInfo(Long userId, UserUpdateRequest dto) {
        // 탈퇴·프로필 이미지 변경과 회원 정보 수정을 같은 회원 행 잠금으로 직렬화한다.
        User user = userRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        // 회원 유형은 DB 값을 사용한다. 소셜 이메일은 누락·동일 값만 허용하고 공급자 저장값을 보존한다.
        boolean social = user.getProvider() != com.momo.backend.entity.AuthProvider.LOCAL;
        if (social) {
            if (dto.email() != null && !java.util.Objects.equals(dto.email(), user.getEmail())) {
                throw new IllegalArgumentException("소셜 회원의 이메일은 변경할 수 없습니다.");
            }
            if ((dto.currentPassword() != null && !dto.currentPassword().isEmpty())
                    || (dto.newPassword() != null && !dto.newPassword().isEmpty())) {
                throw new IllegalArgumentException("소셜 회원은 MOMO 비밀번호를 변경할 수 없습니다.");
            }
        } else if (dto.email() == null || dto.email().length() > 254
                || !dto.email().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$")) {
            throw new IllegalArgumentException("올바른 이메일을 입력해 주세요.");
        }

        if (!user.getNickname().equals(dto.nickname())
                && userRepository.existsByNickname(dto.nickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        boolean changePassword = (dto.currentPassword() != null && !dto.currentPassword().isEmpty())
                || (dto.newPassword() != null && !dto.newPassword().isEmpty());

        if (changePassword) {
            if (dto.currentPassword() == null || dto.currentPassword().isBlank()) {
                throw new IllegalArgumentException("현재 비밀번호를 입력해 주세요.");
            }

            if (!passwordEncoder.matches(
                    dto.currentPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
            }

            if (dto.newPassword() == null || dto.newPassword().isBlank()) {
                throw new IllegalArgumentException("새 비밀번호를 입력해 주세요.");
            }

            String passwordPattern = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$";

            if (!dto.newPassword().matches(passwordPattern)) {
                throw new IllegalArgumentException(
                        "비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자로 입력해 주세요.");
            }

            user.updatePassword(passwordEncoder.encode(dto.newPassword()));
        }

        user.updateProfile(dto.nickname(), social ? user.getEmail() : dto.email());

        try {
            // 동시 닉네임 변경 요청도 DB unique 제약조건 기준으로 충돌을 반환한다.
            userRepository.flush();
        } catch (DataIntegrityViolationException duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 사용 중인 닉네임입니다.",
                    duplicate
            );
        }

        return new UserResponse(user);
    }

    // 내가 누른 좋아요 개수

    @Transactional(readOnly = true)
    public long getMyLikeCount(Long userId) {
        User user = getLoginUser(userId);

        long reviewLikeCount = reviewReactionRepository.countByUser_UserIdAndLiked(
                user.getUserId(), true);

        long commentLikeCount = commentReactionRepository.countByUser_UserIdAndLiked(
                user.getUserId(), true);

        return reviewLikeCount + commentLikeCount;
    }

    // 회원 탈퇴

    public void deleteMyAccount(Long userId, String password) {
        // 회원 행을 잠가 다른 생성·반응 요청과 탈퇴 작업을 직렬화한다.
        User user = userRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        if (user.getProvider() != com.momo.backend.entity.AuthProvider.LOCAL || password == null || password.isBlank()
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        deleteMemberData(userId, user);
    }

    /** 외부 연결 해제를 마친 조정자만 호출한다. 새 트랜잭션에서 DB 신원을 다시 확인한다. */
    public void deleteVerifiedSocialAccount(Long userId, com.momo.backend.entity.AuthProvider provider, String providerId) {
        User user = userRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
        if (provider == null || provider == com.momo.backend.entity.AuthProvider.LOCAL || user.getProvider() != provider
                || !java.util.Objects.equals(user.getProviderId(), providerId)) {
            throw new IllegalArgumentException("탈퇴 대상 회원이 일치하지 않습니다.");
        }
        deleteMemberData(userId, user);
    }

    // 인증 수단과 관계없이 기존 연관 데이터 삭제 순서·커밋 후 이미지 정리를 공유한다.
    private void deleteMemberData(Long userId, User user) {


        // 회원 삭제 전에 Refresh Token 제거
        refreshTokenService.deleteByUserId(userId);

        // Firebase에서 삭제할 기존 프로필 이미지 경로 보관
        String profileImage = user.getProfileImage();

        // 회원이 남긴 댓글 반응과 리뷰 반응 삭제
        commentReactionRepository.deleteAuthoredByUserId(userId);
        reviewReactionRepository.deleteAuthoredByUserId(userId);

        // 회원이 작성한 댓글에 다른 회원이 남긴 반응 삭제
        commentReactionRepository.deleteForCommentsAuthoredByUser(userId);

        // 회원이 작성한 댓글 삭제
        commentRepository.deleteAuthoredByUserId(userId);

        // 회원이 작성한 리뷰에 달린 댓글 반응과 리뷰 반응을 일괄 삭제
        commentReactionRepository.deleteForReviewsAuthoredByUser(userId);
        reviewReactionRepository.deleteForReviewsAuthoredByUser(userId);

        // 회원이 작성한 리뷰에 달린 댓글 삭제 후 리뷰 일괄 삭제
        commentRepository.deleteForReviewsAuthoredByUser(userId);
        reviewRepository.deleteAuthoredByUserId(userId);

        // 회원이 남긴 영화 좋아요 및 싫어요 삭제
        movieRatingRepository.deleteAuthoredByUserId(userId);
        favoriteMovieRepository.deleteAllByUserId(userId);

        // 마지막으로 회원 정보 삭제
        userRepository.delete(user);

        // DB 트랜잭션 성공적으로 커밋된 후 Firebase 이미지 삭제
        if (profileImage != null && !profileImage.isBlank()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            try {
                                firebaseStorageService.deleteProfileImage(profileImage);
                            } catch (Exception e) {
                                log.error(
                                        "회원 탈퇴 후 Firebase 프로필 이미지 삭제에 실패했습니다.",
                                        e);
                            }
                        }
                    });
        }
    }

    @Transactional(readOnly = true)
    public boolean checkCurrentPassword(
            Long userId, String currentPassword) {

        User user = getLoginUser(userId);

        if (user.getProvider() != com.momo.backend.entity.AuthProvider.LOCAL) {
            throw new IllegalArgumentException("소셜 회원은 MOMO 비밀번호 확인을 사용하지 않습니다.");
        }

        return passwordEncoder.matches(
                currentPassword, user.getPasswordHash());
    }

    // 프로필 이미지

    public UserResponse updateProfileImage(
            Long userId, MultipartFile file) throws IOException {

        // 프로필 업로드와 회원 탈퇴가 동시에 실행되지 않도록 회원 행을 잠근다.
        User user = userRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        String oldProfileImage = user.getProfileImage();

        // 새 이미지 Firebase 업로드
        String newProfileImage = firebaseStorageService.uploadProfileImage(file);

        // 이미지 경로 DB 반영
        user.updateProfileImage(newProfileImage);

        // DB 트랜잭션 결과에 따라 Firebase 이미지 정리
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {
                        // DB 커밋 성공: 기존 이미지 삭제
                        if (oldProfileImage != null && !oldProfileImage.isBlank()) {
                            try {
                                firebaseStorageService.deleteProfileImage(
                                        oldProfileImage);
                            } catch (Exception e) {
                                log.error(
                                        "기존 프로필 이미지 삭제 실패: {}",
                                        oldProfileImage,
                                        e);
                            }
                        }
                    }

                    @Override
                    public void afterCompletion(int status) {
                        // DB 롤백: 새 이미지 삭제
                        if (status == STATUS_ROLLED_BACK) {
                            try {
                                firebaseStorageService.deleteProfileImage(
                                        newProfileImage);
                            } catch (Exception e) {
                                log.error(
                                        "롤백 후 새 프로필 이미지 삭제 실패: {}",
                                        newProfileImage,
                                        e);
                            }
                        }
                    }
                });

        return new UserResponse(user);
    }

    public UserResponse removeProfileImage(Long userId) {
        // 프로필 삭제와 회원 탈퇴가 동시에 실행되지 않도록 회원 행을 잠근다.
        User user = userRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        String oldProfileImage = user.getProfileImage();

        user.removeProfileImage();

        // DB 커밋 성공 후 기존 이미지 삭제
        if (oldProfileImage != null && !oldProfileImage.isBlank()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            try {
                                firebaseStorageService.deleteProfileImage(
                                        oldProfileImage);
                            } catch (Exception e) {
                                log.error(
                                        "프로필 이미지 삭제 실패: {}",
                                        oldProfileImage,
                                        e);
                            }
                        }
                    });
        }

        return new UserResponse(user);
    }

    @Transactional(readOnly = true)
    public byte[] getProfileImage(Long userId) {
        User user = getLoginUser(userId);

        return firebaseStorageService.getProfileImage(
                user.getProfileImage());
    }

    @Transactional(readOnly = true)
    public String getProfileImageContentType(Long userId) {
        User user = getLoginUser(userId);

        return firebaseStorageService.getProfileImageContentType(
                user.getProfileImage());
    }

    // 댓글 및 커뮤니티에서 특정 회원의 프로필 이미지 조회

    @Transactional(readOnly = true)
    public byte[] getProfileImageByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        return firebaseStorageService.getProfileImage(
                user.getProfileImage());
    }

    @Transactional(readOnly = true)
    public String getProfileImageContentTypeByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        return firebaseStorageService.getProfileImageContentType(
                user.getProfileImage());
    }
}
