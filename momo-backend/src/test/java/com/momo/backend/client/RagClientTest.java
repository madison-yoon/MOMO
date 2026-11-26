package com.momo.backend.client;
import com.momo.backend.rag.client.RagClient;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;
/** 로컬 HTTP로 통신 계약만 검증하며 실제 DB·외부 서비스는 호출하지 않는다. */
class RagClientTest {
    HttpServer server; String base; AtomicInteger status=new AtomicInteger(200);
    @BeforeEach void start() throws Exception {
        server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        server.createContext("/", e->{
            assertEquals("test-only",e.getRequestHeaders().getFirst("X-Service-Token"));
            String request=new String(e.getRequestBody().readAllBytes(),StandardCharsets.UTF_8);
            String response=e.getRequestURI().getPath().equals("/query")
                ? "{\"answer\":\"mock\",\"abstained\":false,\"sources\":[{\"review_id\":91,\"title\":\"title\",\"snippet\":\"part\",\"score\":1}],\"trace\":[\"retrieve\"]}"
                : e.getRequestMethod().equals("DELETE")?"{\"review_id\":91,\"deleted\":1}":"{\"review_id\":91,\"chunks\":2}";
            if(e.getRequestMethod().equals("POST")) assertTrue(request.contains("review_id"));
            byte[] bytes=response.getBytes(StandardCharsets.UTF_8);
            e.getResponseHeaders().set("Content-Type","application/json");e.sendResponseHeaders(status.get(),bytes.length);e.getResponseBody().write(bytes);e.close();
        });server.start();base="http://127.0.0.1:"+server.getAddress().getPort();
    }
    RagClient client(){return new RagClient(true,base,"test-only",200,200,200,1000);}
    @AfterEach void stop(){server.stop(0);}
    @Test void indexContract(){assertEquals(2,client().index(new RagClient.IndexRequest(91L,"20990001","title","body")));}
    @Test void deleteContract(){assertEquals(1,client().delete(91L));}
    @Test void queryContract(){var answer=client().query("question",List.of(91L),5);assertFalse(answer.abstained());assertEquals(91L,answer.sources().getFirst().review_id());}
    @Test void httpFailurePropagatesToOrchestrator(){status.set(503);assertThrows(Exception.class,()->client().delete(91L));}
    @Test void enabledNeedsToken(){assertThrows(IllegalArgumentException.class,()->new RagClient(true,base,"",1,1,1,1));}
    @Test void timeoutsMustBePositive(){assertThrows(IllegalArgumentException.class,()->new RagClient(false,base,"",1,1,1,0));}
}
