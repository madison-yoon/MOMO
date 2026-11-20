package com.momo.backend.security;

import com.momo.backend.entity.User;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.service.AuthService;
import com.momo.backend.service.RefreshTokenService;
import com.momo.backend.service.FirebaseStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import java.util.Base64;
import static org.junit.jupiter.api.Assertions.*;

/** 격리 H2 메모리 DB만 사용하며 Firebase·외부 API 서비스는 로드하지 않는다. */
@DataJpaTest(showSql = false, properties = {
 "spring.datasource.url=jdbc:h2:mem:h1-identity;DB_CLOSE_DELAY=-1;MODE=MySQL",
 "spring.datasource.driver-class-name=org.h2.Driver",
 "spring.datasource.username=sa", "spring.datasource.password=",
 "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({AuthService.class, RefreshTokenService.class, H1IdentityIntegrationTest.Config.class,
 com.momo.backend.service.ReviewService.class, com.momo.backend.service.CommentService.class,
 com.momo.backend.service.ReviewReactionService.class, com.momo.backend.service.CommentReactionService.class,
 com.momo.backend.service.MovieRatingService.class, com.momo.backend.service.FavoriteMovieService.class})
class H1IdentityIntegrationTest {
 @TestConfiguration static class Config {
  @Bean TokenProvider tokenProvider() {
   byte[] bytes = new byte[32]; new java.security.SecureRandom().nextBytes(bytes);
   return new TokenProvider(Base64.getEncoder().encodeToString(bytes), 1800000L, 604800000L);
  }
  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
 }
 @Autowired UserRepository users;
 @Autowired AuthService auth;
 @Autowired RefreshTokenService refresh;
 @Autowired TokenProvider tokens;
 @Autowired PasswordEncoder passwords;
 @MockitoBean FirebaseStorageService firebase;
 @MockitoBean com.momo.backend.service.MovieService movieService;
 @Autowired com.momo.backend.service.ReviewService reviews;
 @Autowired com.momo.backend.service.CommentService comments;
 @Autowired com.momo.backend.service.ReviewReactionService reviewReactions;
 @Autowired com.momo.backend.service.CommentReactionService commentReactions;
 @Autowired com.momo.backend.service.MovieRatingService ratings;
 @Autowired com.momo.backend.service.FavoriteMovieService favorites;
 @Autowired com.momo.backend.repository.MovieRepository movies;


 @Test
 @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
 void deletedAccountTokensCannotAuthenticateReusedLoginId() throws Exception {
  User first = users.saveAndFlush(new User("same-login", passwords.encode("TestPassword1!"), "first", "first@example.com"));
  Long firstId = first.getUserId();
  String oldAccess = tokens.createToken(firstId);
  String oldRefresh = tokens.createRefreshToken(firstId);
  refresh.saveOrReplace(first, oldRefresh);
  auth.deleteMyAccount(firstId, "TestPassword1!");
  users.flush();
  User second = users.saveAndFlush(new User("same-login", passwords.encode("TestPassword2!"), "second", "second@example.com"));
  assertNotEquals(firstId, second.getUserId());
  assertFalse(users.existsById(firstId));
  assertThrows(com.momo.backend.exception.CustomException.class, () -> refresh.reissue(oldRefresh));
  assertFilteredIdentity(oldAccess, null);
  assertFilteredIdentity(tokens.createToken(second.getUserId()), second.getUserId());
  assertEquals(second.getUserId(), auth.login("same-login", "TestPassword2!").getUserId());
 }

 @Test
 @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
 void memberFeaturesAndTokenResponsesKeepTheirContracts() throws Exception {
  User owner = users.saveAndFlush(new User("owner-login", passwords.encode("TestPassword1!"), "owner", "owner@example.com"));
  User other = users.saveAndFlush(new User("other-login", passwords.encode("TestPassword2!"), "other", "other@example.com"));
  Long id = owner.getUserId();
  movies.saveAndFlush(new com.momo.backend.entity.Movie("20260001", "movie", "", "20250101", "", "Drama", "", "", ""));
  var request = new com.momo.backend.dto.review.ReviewCreateRequest();
  org.springframework.test.util.ReflectionTestUtils.setField(request, "movieCode", "20260001");
  org.springframework.test.util.ReflectionTestUtils.setField(request, "title", "review");
  org.springframework.test.util.ReflectionTestUtils.setField(request, "content", "content");
  var review = reviews.createReview(id, request);
  assertEquals(id, review.getUserId());
  var commentRequest = new com.momo.backend.dto.comment.CommentRequest();
  org.springframework.test.util.ReflectionTestUtils.setField(commentRequest, "content", "comment");
  var comment = comments.createComment(review.getReviewId(), id, commentRequest);
  assertEquals(id, comment.getUserId());
  reviewReactions.saveReactions(other.getUserId(), review.getReviewId(), true);
  commentReactions.saveReaction(other.getUserId(), comment.getCommentId(), true);
  ratings.saveRating(id, "20260001", true);
  assertEquals(true, ratings.getMovieRating("20260001", id).get("myRating"));
  favorites.addFavorite(id, new com.momo.backend.dto.favorite.FavoriteMovieRequest("20260001", "movie", "20250101", ""));
  assertEquals(1, favorites.getFavorites(id).size());
  assertTrue(favorites.getFavorites(other.getUserId()).isEmpty());
  var controller = new com.momo.backend.controller.AuthController(auth, refresh, new com.momo.backend.service.LoginSessionService(tokens, refresh), org.mockito.Mockito.mock(com.momo.backend.service.AccountDeletionService.class));
  var loginRequest = new com.momo.backend.dto.auth.LoginRequest();
  org.springframework.test.util.ReflectionTestUtils.setField(loginRequest, "loginId", "owner-login");
  org.springframework.test.util.ReflectionTestUtils.setField(loginRequest, "password", "TestPassword1!");
  var loginResponse = controller.login(loginRequest).getBody();
  assertNotNull(loginResponse);
  assertEquals(id, tokens.getUserId(loginResponse.accessToken()));
  var renewed = controller.reissue(new com.momo.backend.dto.auth.TokenRefreshRequest(loginResponse.refreshToken())).getBody();
  assertNotNull(renewed);
  assertEquals(id, tokens.getUserId(renewed.accessToken()));
  assertEquals(id, tokens.getUserId(renewed.refreshToken()));
  var json = new tools.jackson.databind.ObjectMapper();
  var loginJson = json.readTree(json.writeValueAsString(loginResponse));
  for (String field : java.util.List.of("userId", "loginId", "nickname", "profileImage", "accessToken", "refreshToken", "tokenType")) assertTrue(loginJson.has(field));
  assertEquals("owner-login", loginJson.path("loginId").asString());
  var refreshJson = json.readTree(json.writeValueAsString(renewed));
  for (String field : java.util.List.of("accessToken", "refreshToken", "tokenType")) assertTrue(refreshJson.has(field));
  assertEquals("Bearer", refreshJson.path("tokenType").asString());
 }

 @Test void otherMemberCannotDeleteOwnersReview() {
  User owner = users.saveAndFlush(new User("ownership", passwords.encode("TestPassword1!"), "ownership", "owner@example.com"));
  User other = users.saveAndFlush(new User("outsider", passwords.encode("TestPassword2!"), "outsider", "other@example.com"));
  var request = new com.momo.backend.dto.review.ReviewCreateRequest();
  org.springframework.test.util.ReflectionTestUtils.setField(request, "movieCode", "20260002");
  org.springframework.test.util.ReflectionTestUtils.setField(request, "title", "review");
  org.springframework.test.util.ReflectionTestUtils.setField(request, "content", "content");
  var review = reviews.createReview(owner.getUserId(), request);
  assertThrows(com.momo.backend.exception.CustomException.class, () -> reviews.deleteReview(review.getReviewId(), other.getUserId()));
 }

 @Test void memberProfileAndLogoutUsePrimaryKey() {
  User user = users.saveAndFlush(new User("profile-login", passwords.encode("TestPassword1!"), "profile", "profile@example.com"));
  Long id = user.getUserId();
  assertEquals(id, auth.getLoginUser(id).getUserId());
  var response = auth.updateMyInfo(id, new com.momo.backend.dto.auth.UserUpdateRequest("updated", "updated@example.com", "TestPassword1!", "NewPassword2!"));
  assertEquals(id, response.getUserId());
  assertTrue(auth.checkCurrentPassword(id, "NewPassword2!"));
  String token = tokens.createRefreshToken(id);
  refresh.saveOrReplace(user, token);
  refresh.deleteByUserIdWithLock(id);
  assertThrows(com.momo.backend.exception.CustomException.class, () -> refresh.reissue(token));
 }
 private void assertFilteredIdentity(String token, Long expected) throws Exception {
  SecurityContextHolder.clearContext();
  try {
   MockHttpServletRequest request = new MockHttpServletRequest();
   request.addHeader("Authorization", "Bearer " + token);
   new JwtFilter(tokens, users).doFilter(request, new MockHttpServletResponse(), (req, res) -> {
    assertEquals(expected, MemberPrincipal.optionalUserId(SecurityContextHolder.getContext().getAuthentication()));
   });
  } finally { SecurityContextHolder.clearContext(); }
 }
}
