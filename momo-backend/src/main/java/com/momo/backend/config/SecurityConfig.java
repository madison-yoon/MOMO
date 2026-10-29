package com.momo.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer; // [추가]
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration; // [추가]
import org.springframework.web.cors.CorsConfigurationSource; // [추가]
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // [추가]

import java.util.List; // [추가]

@Configuration
public class SecurityConfig {

        // 회원 비밀번호를 BCrypt 방식으로 암호화
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http)
                        throws Exception {
                http
                                // [추가] CORS 설정 활성화
                                .cors(Customizer.withDefaults())

                                // 개발 단계에서 Postman API 테스트를 위해 CSRF 보호 기능 임시 비활성화
                                .csrf(csrf -> csrf.disable())

                                // 로그인 인증 정보를 자동 저장하지 않고 Controller에서 직접 세션에 저장
                                .securityContext(context -> context.requireExplicitSave(true))

                                // API 주소별로 로그인 여부에 따른 접근 권한 설정
                                .authorizeHttpRequests(auth -> auth

                                                // 회원가입과 로그인은 로그인하지 않은 사용자도 접근 가능
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/auth/signup",
                                                                "/api/auth/login")
                                                .permitAll()
                                                // 아이디 중복 확인은 로그인하지 않은 사용자도 접근 가능
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/auth/exists/id/**")
                                                .permitAll()

                                                // 로그아웃은 로그인한 사용자만 요청 가능
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/auth/logout")
                                                .authenticated()

                                                // 영화 검색과 상세정보, 박스오피스 조회는 로그인 없이 접근 가능
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/movies/**",
                                                                "/api/boxoffice/**")
                                                .permitAll()

                                                // 위에서 허용한 API를 제외한 나머지는 로그인 필요
                                                .anyRequest().authenticated())

                                // 로그인하지 않은 사용자가 인증이 필요한 API에 접근했을 때 처리
                                .exceptionHandling(exception -> exception

                                                // 인증 정보가 없으면 HTTP 401 상태 코드 반환
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                                                }));
                return http.build();
        }

        // [추가] CORS 정책을 설정하는 Bean 정의
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // 프론트엔드(React) 주소 허용
                configuration.setAllowedOrigins(List.of("http://localhost:3000"));
                // 허용할 HTTP 메서드 설정
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                // 모든 헤더 허용
                configuration.setAllowedHeaders(List.of("*"));
                // 자격 증명(쿠키, Authorization 헤더 등)을 포함한 요청 허용
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
