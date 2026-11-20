package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(
        name = "uk_users_provider_identity", columnNames = {"provider", "provider_id"}))
@Getter
@NoArgsConstructor
public class User {

    // 회원을 구분하는 고유 번호(PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    // 로그인할 때 사용하는 아이디
    @Column(name = "login_id", nullable = false, unique = true, length = 20)
    private String loginId;

    // 암호화된 비밀번호를 저장
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    // 화면에 표시할 회원 닉네임
    @Column(nullable = false, unique = true, length = 12)
    private String nickname;

    // 일반 회원가입은 DTO에서 필수 검증하고, 이메일에 미동의한 소셜 회원만 null을 허용한다.
    @Column(name = "email", length = 254)
    private String email;

    // 기존 회원은 LOCAL로 유지하며 외부 식별자를 로그인 아이디·이메일과 분리한다.
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 20, columnDefinition = "varchar(20) default 'LOCAL'")
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id", length = 255)
    private String providerId;

    // 프로필 이미지
    @Column(name = "profile_image", length = 500)
    private String profileImage;

    // 회원 정보가 처음 저장된 날짜와 시간
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        // 회원 정보가 DB에 처음 저장될 때 현재 시간을 기록
        this.createdAt = LocalDateTime.now();
    }
    // 회원가입 시 입력받은 정보로 회원 객체를 생성
    public User(String loginId, String passwordHash,
                String nickname, String email) {
        this.loginId = loginId;
        this.passwordHash = passwordHash; // 암호화된 비밀번호 저장
        this.nickname = nickname;
        this.email = email;
    }


    // 소셜 회원도 같은 숫자 userId와 소유권 관계를 사용하되 일반 비밀번호 로그인은 허용하지 않는다.
    public static User kakao(String loginId, String passwordHash, String nickname, String email, String providerId) {
        return social(AuthProvider.KAKAO, loginId, passwordHash, nickname, email, providerId);
    }

    // 이메일이 같아도 계정을 합치지 않고 공급자와 원본 식별자 조합으로 별도 회원을 만든다.
    public static User social(AuthProvider provider, String loginId, String passwordHash, String nickname, String email, String providerId) {
        if (provider == null || provider == AuthProvider.LOCAL) throw new IllegalArgumentException("소셜 공급자가 필요합니다.");
        User user = new User(loginId, passwordHash, nickname, email);
        user.provider = provider;
        user.providerId = providerId;
        return user;
    }

    // 회원의 닉네임과 이메일 수정
    public void updateProfile(String nickname, String email) {
        this.nickname = nickname;
        this.email = email;
    }

    // 회원 비밀번호 수정
    public void updatePassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    // 프로필 이미지 URL을 저장하거나 변경합니다.
    public void updateProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    // 프로필 이미지 삭제 시 기본 아바타로 돌아갈 수 있도록 null 처리합니다.
    public void removeProfileImage() {
        this.profileImage = null;
    }
}
