package com.momo.backend.client;

import com.momo.backend.entity.User;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.security.TokenProvider;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.*;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;
import java.nio.file.*;
import java.net.ServerSocket;
import java.util.*;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;

/** 명시적으로 선택했을 때만 실제 FastAPI와 Spring HTTP 서버를 실행한다. 공유 DB에는 접속하지 않는다. */
@EnabledIfEnvironmentVariable(named="RAG_LIVE_TEST", matches="1")
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT, properties={
    "spring.datasource.url=jdbc:h2:mem:momo-rag-live;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
    "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop",
    "jwt.secret=TW9tb1Rlc3RPbmx5U2VjcmV0S2V5Rm9ySlZUVGVzdHMxMjM0NQ=="
})
@ActiveProfiles("test")
class RagLiveIntegrationTest {
    static Process python;
    static String baseUrl;
    static String serviceToken = UUID.randomUUID().toString();
    @LocalServerPort int port;
    @Autowired UserRepository users;
    @Autowired TokenProvider tokens;

    @DynamicPropertySource static void setup(DynamicPropertyRegistry registry) throws Exception {
        Path folder=Path.of("..").toAbsolutePath().normalize().resolve("MOMO-RAG");
        String interpreter=System.getenv("RAG_TEST_PYTHON");
        if(interpreter==null) interpreter=folder.resolve(".venv/Scripts/python.exe").toString();
        int ragPort;
        try(ServerSocket socket=new ServerSocket(0)){ragPort=socket.getLocalPort();}
        baseUrl="http://127.0.0.1:"+ragPort;
        ProcessBuilder builder=new ProcessBuilder(interpreter,"-B","-m","uvicorn","app:app",
                "--host","127.0.0.1","--port",String.valueOf(ragPort));
        builder.directory(folder.toFile());
        builder.environment().put("SERVICE_TOKEN", serviceToken);
        builder.environment().put("RAG_ENGINE", "stub");
        builder.redirectErrorStream(true).redirectOutput(Path.of("build/rag-live-fastapi.log").toFile());
        python=builder.start();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> python.destroy()));
        boolean ready=false;
        try {
            for(int i=0;i<100;i++) {
                try { RestClient.create(baseUrl).get().uri("/health").retrieve().toBodilessEntity(); ready=true; break; }
                catch(Exception notReady) { Thread.sleep(100); }
            }
            if(!ready) throw new IllegalStateException("FastAPI 기동 실패: build/rag-live-fastapi.log 확인");
        } catch(Exception failure) { python.destroy(); throw failure; }
        registry.add("RAG_ENABLED",()->"true");
        registry.add("RAG_BASE_URL",()->baseUrl);
        registry.add("RAG_SERVICE_TOKEN",()->serviceToken);
    }
    @AfterAll static void stop() throws Exception {
        if(python!=null){python.destroy();if(!python.waitFor(5,TimeUnit.SECONDS)) python.destroyForcibly();}
    }
    private void awaitStatus(RestClient spring,long reviewId,String expected) throws Exception {
        long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(8);
        while(System.nanoTime()<deadline) {
            var detail=spring.get().uri("/api/reviews/{id}",reviewId).retrieve().body(Map.class);
            if(expected.equals(detail.get("indexStatus"))) return;
            Thread.sleep(20);
        }
        fail("비동기 색인 상태 전환 시간 초과: "+expected);
    }
    @Test void realReviewCrudCommitsIndexAndSurvivesFastApiShutdown() throws Exception {
        // 계정·리뷰는 이 테스트의 H2 안에서만 생성하며 테스트 종료 시 폐기된다.
        User user=users.saveAndFlush(new User("rag_test_one","test-hash","RAG전용1","rag-one@example.test"));
        RestClient spring=RestClient.builder().baseUrl("http://127.0.0.1:"+port)
                .defaultHeader("Authorization","Bearer "+tokens.createToken(user.getUserId())).build();
        RestClient rag=RestClient.builder().baseUrl(baseUrl).defaultHeader("X-Service-Token", serviceToken).build();
        var created=spring.post().uri("/api/reviews").contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("movieCode","20990001","title","가상 우주 영화","content","우주 탐험과 음악이 좋다"))
                .retrieve().body(Map.class);
        long id=((Number)created.get("reviewId")).longValue();
        awaitStatus(spring,id,"READY");
        // 실제 Spring 질문 API가 READY 허용목록을 만들고 FastAPI 응답을 재검증한다.
        var answer=spring.post().uri("/api/rag/query").contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("question","우주 탐험","scope","MINE")).retrieve().body(Map.class);
        assertEquals(false, answer.get("abstained"));
        assertFalse(((java.util.List<?>)answer.get("sources")).isEmpty());

        assertTrue(((Number)rag.delete().uri("/index/{id}",id).retrieve().body(Map.class).get("deleted")).intValue()>0);
        spring.put().uri("/api/reviews/{id}",id).contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("title","수정 가상 리뷰","content","기차 여행 장면이 좋다")).retrieve().toBodilessEntity();
        awaitStatus(spring,id,"READY");
        assertTrue(((Number)rag.delete().uri("/index/{id}",id).retrieve().body(Map.class).get("deleted")).intValue()>0);
        // 재색인한 뒤 실제 리뷰 삭제가 Python 색인까지 제거하는지 확인한다.
        spring.put().uri("/api/reviews/{id}",id).contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("title","삭제 검증","content","가상 내용")).retrieve().toBodilessEntity();
        awaitStatus(spring,id,"READY");
        spring.delete().uri("/api/reviews/{id}",id).retrieve().toBodilessEntity();
        assertEquals(0,((Number)rag.delete().uri("/index/{id}",id).retrieve().body(Map.class).get("deleted")).intValue());
        var removed=spring.post().uri("/api/rag/query").contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("question","우주 탐험","scope","ALL")).retrieve().body(Map.class);
        assertEquals(true,removed.get("abstained"));

        python.destroy(); assertTrue(python.waitFor(5,TimeUnit.SECONDS));
        var afterStop=spring.post().uri("/api/reviews").contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("movieCode","20990002","title","장애 격리","content","서버가 꺼져도 리뷰는 저장된다"))
                .retrieve().body(Map.class);
        assertNotNull(afterStop.get("reviewId"));
        awaitStatus(spring,((Number)afterStop.get("reviewId")).longValue(),"FAILED");
        spring.put().uri("/api/reviews/{id}",afterStop.get("reviewId")).contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("title","중단 후 수정","content","정상 수정")).retrieve().toBodilessEntity();
        spring.delete().uri("/api/reviews/{id}",afterStop.get("reviewId")).retrieve().toBodilessEntity();
    }
}
