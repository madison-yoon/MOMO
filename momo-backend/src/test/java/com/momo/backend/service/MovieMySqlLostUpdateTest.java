package com.momo.backend.service;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.momo.backend.client.KobisApiClient;
import com.momo.backend.dto.movie.*;
import com.momo.backend.entity.Movie;
import com.momo.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** 제어한 동시 실행 순서에서 값 보존을 검증하며 모든 동시성 상황을 보장하지 않는다.
 * 별도로 실행한 폐기 가능한 MySQL에서만 활성화하고 개발 DB는 사용하지 않는다.
 */
@EnabledIfEnvironmentVariable(named="MOMO_M2_EPHEMERAL_SERVER", matches="true")
@EnabledIfEnvironmentVariable(named="MOMO_M2_ISOLATED_URL", matches="jdbc:mysql://127[.]0[.]0[.]1:[0-9]+/momo_m2_isolated[?]useSSL=false&allowPublicKeyRetrieval=true")
@DataJpaTest(showSql=false, properties={
 "spring.datasource.url=${MOMO_M2_ISOLATED_URL}", "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",
 "spring.datasource.username=root", "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop",
 "spring.jpa.open-in-view=false", "spring.datasource.hikari.maximum-pool-size=4"
})
@AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@Transactional(propagation=Propagation.NOT_SUPPORTED)
@Import({MoviePosterCacheService.class, MoviePosterWriter.class, MoviePersistenceWriter.class, MoviePersistenceService.class})
class MovieMySqlLostUpdateTest {
 @Autowired MovieRepository movies;
 @Autowired MoviePosterCacheRepository posterRows;
 @Autowired MoviePosterCacheService posterCache;
 @Autowired PlatformTransactionManager transactions;
 @Autowired MoviePosterWriter posterWriter;
 @Autowired MoviePersistenceService persistence;
 @MockitoBean PosterFileStorageService storage;
 final KobisApiClient kobis = mock(KobisApiClient.class);
 final KmdbService kmdb = mock(KmdbService.class);
 final TmdbService tmdb = mock(TmdbService.class);

 Movie seed(String code) {
  Movie m = new Movie(code,"movie","English","20200101","100","Drama","Director","Actor","all");
  m.updateOverview("existing overview");
  m.markKobisDetailAttempted(LocalDateTime.now());
  m.markSupplementAttempted(LocalDateTime.now());
  return movies.saveAndFlush(m);
 }
 MovieService service(MovieRepository repository) {
  return new MovieService(mock(MoviePosterAsyncService.class), kobis, kmdb, tmdb, new ObjectMapper(), repository,
   mock(MovieCacheRepository.class), posterCache, persistence, posterRows,
   mock(MovieExternalIdMappingRepository.class), storage, Caffeine.newBuilder().maximumSize(20).build());
 }
 void race(String readMethod, java.util.function.Consumer<MovieRepository> staleWriter, Runnable interveningCommit) throws Exception {
  CountDownLatch read = new CountDownLatch(1), resume = new CountDownLatch(1);
  MovieRepository controlled = mock(MovieRepository.class, org.mockito.AdditionalAnswers.delegatesTo(movies));
  java.util.concurrent.atomic.AtomicBoolean first = new java.util.concurrent.atomic.AtomicBoolean(true);
  org.mockito.stubbing.Answer<Object> answer = invocation -> {
   Object result = readMethod.equals("findById") ? movies.findById(invocation.getArgument(0)) : movies.findAllById(invocation.getArgument(0));
   if (first.compareAndSet(true, false)) {
    read.countDown();
    if (!resume.await(15, TimeUnit.SECONDS)) throw new IllegalStateException("Writer coordination timeout");
   }
   return result;
  };
  if (readMethod.equals("findById")) doAnswer(answer).when(controlled).findById(anyString());
  else doAnswer(answer).when(controlled).findAllById(any());
  try (var executor = Executors.newSingleThreadExecutor()) {
   var result = executor.submit(() -> staleWriter.accept(controlled));
   try { assertTrue(read.await(10, TimeUnit.SECONDS)); interveningCommit.run(); }
   finally { resume.countDown(); }
   result.get(15, TimeUnit.SECONDS);
  }
  verifyNoInteractions(kobis, kmdb, tmdb);
 }

 @Test void detailEnrichmentPreservesCommittedPosterAndCache() throws Exception {
  String code="20991001"; seed(code);
  posterCache.createCache(code,"movie","20200101");
  String claim=posterCache.tryMarkAsProcessing(code);
  assertNotNull(claim);
  when(storage.downloadAndSave(eq(code),anyString())).thenReturn("/posters/new.jpg");
  var writer = new MoviePosterPersistenceService(posterRows,movies,storage,posterWriter);
  race("findById", repo -> service(repo).getMovieDetail(code), () -> {
   assertTrue(writer.saveSuccess(code,claim,"https://image.tmdb.org/test.jpg"));
   assertEquals("/posters/new.jpg",movies.findById(code).orElseThrow().getPosterUrl());
  });
  assertEquals("/posters/new.jpg",movies.findById(code).orElseThrow().getPosterUrl());
  assertEquals("/posters/new.jpg",posterRows.findById(code).orElseThrow().getPosterUrl());
 }

 @Test void weeklyWritePreservesNewerDailyHistoryAfterVersionConflict() throws Exception {
  String code="20991002"; seed(code);
  var weekly = List.of(new BoxOfficeResponse(7,code,"movie","20200101","0","0",""));
  var daily = List.of(new BoxOfficeResponse(1,code,"movie","20200101","0","0",""));
  race("findById", repo -> coordinator(repo).saveBoxOffice(code,7,"20261108",false), () -> {
   persistence.saveBoxOffice(code,1,"20261113",true);
   assertEquals("20261113",movies.findById(code).orElseThrow().getLastBoxOfficeDate());
  });
  Movie result=movies.findById(code).orElseThrow();
  assertEquals("20261113",result.getLastBoxOfficeDate());
  assertEquals(1,result.getBestBoxOfficeRank());
  assertEquals(1,result.getLastBoxOfficeRank());
 }

 @Test void noOpMetadataSupplementPreservesConcurrentCommittedValue() throws Exception {
  String code="20991003";
  movies.saveAndFlush(new Movie(code,"movie","","20200101","100","Drama","Director","Actor","all"));
  race("findById", repo -> coordinator(repo).saveSearchMovies(List.of(new MovieSearchResponse(code,"movie","20200101","Drama","Director"))), () -> {
   Movie current=movies.findById(code).orElseThrow();
   current.supplementMissingDetails("Committed English","","","","","","","TEST");
   movies.saveAndFlush(current);
   assertEquals("Committed English",movies.findById(code).orElseThrow().getTitleEn());
  });
  // 오래된 writer가 필드를 변경하지 않는 경로에서도 다른 작업이 저장한 값이 유지돼야 한다.
  assertEquals("Committed English",movies.findById(code).orElseThrow().getTitleEn());
 }

 @Test void detailEnrichmentCannotResurrectConditionallyClearedPoster() throws Exception {
  String code="20991004"; Movie m=seed(code); m.updatePosterUrl("/posters/old.jpg"); movies.saveAndFlush(m);
  posterCache.createCache(code,"movie","20200101");
  race("findById", repo -> service(repo).getMovieDetail(code), () -> {
   assertTrue(posterCache.repairMissingPosterFile(code,"movie","20200101","/posters/old.jpg"));
   assertNull(movies.findById(code).orElseThrow().getPosterUrl());
  });
  assertNull(movies.findById(code).orElseThrow().getPosterUrl());
 }

 @Test void dirtyMetadataSupplementPreservesAnotherCommittedFieldAfterRetry() throws Exception {
  String code="20991005";
  movies.saveAndFlush(new Movie(code,"movie","","20200101","100","","Director","Actor","all"));
  race("findById", repo -> coordinator(repo).saveSearchMovies(List.of(new MovieSearchResponse(code,"movie","20200101","Drama","Director"))), () -> {
   Movie current=movies.findById(code).orElseThrow();
   current.supplementMissingDetails("Committed English","","","","","","","TEST");
   movies.saveAndFlush(current);
   assertEquals("Committed English",movies.findById(code).orElseThrow().getTitleEn());
  });
  Movie result=movies.findById(code).orElseThrow();
  assertEquals("Drama",result.getGenre());
  assertEquals("Committed English",result.getTitleEn());
 }

 MoviePersistenceService coordinator(MovieRepository repository) {
  var factory = new org.springframework.aop.framework.ProxyFactory(new MoviePersistenceWriter(repository));
  factory.setProxyTargetClass(true);
  var interceptor = new org.springframework.transaction.interceptor.TransactionInterceptor();
  interceptor.setTransactionManager(transactions);
  interceptor.setTransactionAttributeSource(new org.springframework.transaction.annotation.AnnotationTransactionAttributeSource());
  factory.addAdvice(interceptor);
  return new MoviePersistenceService((MoviePersistenceWriter) factory.getProxy());
 }

 @Test void staleDetachedEntityFailsAndDirectClearIncrementsVersion() {
  String code="20991101";
  Movie old=seed(code);
  old.updatePosterUrl("/posters/old.jpg");
  old=movies.saveAndFlush(old);
  long version=old.getRowVersion();
  assertEquals(0,movies.clearPosterUrlIfMatches(code,"/posters/different.jpg"));
  assertEquals(version,movies.findById(code).orElseThrow().getRowVersion());
  assertEquals(1,movies.clearPosterUrlIfMatches(code,"/posters/old.jpg"));
  assertEquals(version+1,movies.findById(code).orElseThrow().getRowVersion());
  old.updateOverview("stale overview");
  old.markSupplementAttempted(LocalDateTime.now().plusHours(1));
  Movie stale=old;
  assertThrows(org.springframework.dao.OptimisticLockingFailureException.class, () -> movies.saveAndFlush(stale));
  assertNull(movies.findById(code).orElseThrow().getPosterUrl());
 }

 @Test void invalidClaimRollsBackMovieAndKeepsCache() {
  String code="20991102"; Movie m=seed(code); m.updatePosterUrl("/posters/valid.jpg"); movies.saveAndFlush(m);
  posterCache.createCache(code,"movie","20200101");
  String claim=posterCache.tryMarkAsProcessing(code);
  long version=movies.findById(code).orElseThrow().getRowVersion();
  assertThrows(MoviePosterWriter.Rejected.class, () -> posterWriter.complete(code,"wrong","/posters/rejected.jpg"));
  assertEquals("/posters/valid.jpg",movies.findById(code).orElseThrow().getPosterUrl());
  assertEquals(version,movies.findById(code).orElseThrow().getRowVersion());
  assertEquals(claim,posterRows.findById(code).orElseThrow().getClaimToken());
  posterWriter.complete(code,claim,"/posters/winner.jpg");
  assertEquals("/posters/winner.jpg",movies.findById(code).orElseThrow().getPosterUrl());
  assertEquals("/posters/winner.jpg",posterRows.findById(code).orElseThrow().getPosterUrl());
  assertTrue(posterWriter.isReferenced("/posters/winner.jpg"));
  assertFalse(posterWriter.isReferenced("/posters/rejected.jpg"));
 }

 @Test void migrationChecksOriginalPathAtCommitAndCannotReplaceNewerPoster() {
  String code="20991103"; Movie m=seed(code); m.updatePosterUrl("https://example.org/old.jpg"); movies.saveAndFlush(m);
  posterWriter.markMigration(code,"https://example.org/old.jpg",LocalDateTime.now());
  Movie now=movies.findById(code).orElseThrow(); now.updatePosterUrl("/posters/newer.jpg"); movies.saveAndFlush(now);
  assertThrows(MoviePosterWriter.Rejected.class, () -> posterWriter.migrate(code,"https://example.org/old.jpg","/posters/migrated.jpg"));
  assertEquals("/posters/newer.jpg",movies.findById(code).orElseThrow().getPosterUrl());
 }

 @Test void assignedIdWithNullableVersionInsertsAndConcurrentInsertRecovers() throws Exception {
  String code="20991104";
  var item=new MovieSearchResponse(code,"movie","20200101","Drama","Director");
  race("findById", repo -> coordinator(repo).saveSearchMovies(List.of(item)), () -> persistence.saveSearchMovies(List.of(item)));
  Movie result=movies.findById(code).orElseThrow();
  assertNotNull(result.getRowVersion());
  assertEquals("Drama",result.getGenre());
  assertEquals(1,movies.findAllById(List.of(code)).size());
 }

 @Test void bothDailyWeeklyCommitOrdersPreserveDailyForSameDateAndBestRank() {
  String a="20991105", b="20991106"; seed(a); seed(b);
  persistence.saveBoxOffice(a,7,"20261113",false);
  persistence.saveBoxOffice(a,2,"20261113",true);
  persistence.saveBoxOffice(b,2,"20261113",true);
  persistence.saveBoxOffice(b,7,"20261113",false);
  for(String code: List.of(a,b)) {
   assertEquals(2,movies.findById(code).orElseThrow().getLastBoxOfficeRank());
   assertEquals(2,movies.findById(code).orElseThrow().getBestBoxOfficeRank());
  }
 }

 @Test void concurrentDetailInsertRecoversWithFreshExistingRowAndPreservesItsPoster() throws Exception {
  String code="20991108";
  Movie proposed=new Movie(code,"movie","English","20200101","100","Drama","Director","Actor","all");
  proposed.updateOverview("overview");
  var update=MovieDetailUpdate.from(proposed);
  race("findById", repo -> coordinator(repo).saveDetail(update,false), () -> {
   persistence.saveDetail(update,false);
   Movie winner=movies.findById(code).orElseThrow();
   winner.updatePosterUrl("/posters/insert-winner.jpg");
   movies.saveAndFlush(winner);
  });
  Movie result=movies.findById(code).orElseThrow();
  assertEquals("English",result.getTitleEn());
  assertEquals("/posters/insert-winner.jpg",result.getPosterUrl());
 }

 @Test void detailRetryExhaustionReadsFreshDatabaseAfterThreeRealConflicts() {
  String code="20991107"; seed(code);
  Movie candidate=movies.findById(code).orElseThrow();
  candidate.markOverviewAttempted(LocalDateTime.now().plusHours(2));
  var update=MovieDetailUpdate.from(candidate);
  var controlled=mock(MovieRepository.class,org.mockito.AdditionalAnswers.delegatesTo(movies));
  java.util.concurrent.atomic.AtomicInteger reads=new java.util.concurrent.atomic.AtomicInteger();
  doAnswer(inv -> {
   Movie loaded=movies.findById(code).orElseThrow();
   int n=reads.incrementAndGet();
   if(n<=3) {
    var tx=new TransactionTemplate(transactions); tx.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    tx.executeWithoutResult(status -> {
     Movie competing=movies.findById(code).orElseThrow();
     competing.updatePosterUrl("/posters/current-"+n+".jpg");
     movies.saveAndFlush(competing);
    });
   }
   return java.util.Optional.of(loaded);
  }).when(controlled).findById(code);
  Movie returned=coordinator(controlled).saveDetail(update,true);
  assertEquals(4,reads.get(),"3 failed writes followed by new read transaction");
  assertEquals("/posters/current-3.jpg",returned.getPosterUrl());
  assertNull(returned.getOverviewAttemptedAt(),"failed intent must not appear saved");
  verifyNoInteractions(kobis,kmdb,tmdb);
 }

 @Test void callerManagedMovieIsNotDirtiedByExternalEnrichment() {
  String code="20991109";
  movies.saveAndFlush(new Movie(code,"movie","English","20200101","100","Drama","Director","Actor","all"));
  when(tmdb.findMovieOverview("movie","20200101")).thenReturn(java.util.Optional.of("new overview"));
  new TransactionTemplate(transactions).executeWithoutResult(status -> {
   Movie callerManaged=movies.findById(code).orElseThrow();
   service(movies).getMovieDetail(code);
   assertNull(callerManaged.getOverview(),"external enrichment must operate on a copy, not caller persistence context");
  });
  assertEquals("new overview",movies.findById(code).orElseThrow().getOverview());
  verify(tmdb).findMovieOverview("movie","20200101");
  verifyNoInteractions(kobis,kmdb);
 }
}
