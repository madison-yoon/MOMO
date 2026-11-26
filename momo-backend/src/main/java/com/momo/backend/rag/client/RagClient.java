package com.momo.backend.rag.client;
import com.momo.backend.rag.dto.RagAnswer;
import java.util.List;
import java.util.Map;
import com.momo.backend.rag.service.ReviewFingerprint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/** HTTP 및 서비스 인증만 담당한다. 이벤트·DB 트랜잭션과 자동 재시도는 담당하지 않는다. */
@Component
public class RagClient {
    private final boolean enabled;
    private final RestClient indexHttp;
    private final RestClient queryHttp;
    public RagClient(@Value("${RAG_ENABLED:false}") boolean enabled,
        @Value("${RAG_BASE_URL:http://127.0.0.1:8000}") String base,
        @Value("${RAG_SERVICE_TOKEN:}") String token,
        @Value("${RAG_CONNECT_TIMEOUT_MS:500}") int connect,
        @Value("${RAG_READ_TIMEOUT_MS:#{'${RAG_ENGINE:stub}' == 'atlas' ? 15000 : 1000}}") int read,
        @Value("${RAG_QUERY_CONNECT_TIMEOUT_MS:500}") int queryConnect,
        @Value("${RAG_QUERY_READ_TIMEOUT_MS:#{'${RAG_ENGINE:stub}' == 'atlas' ? 30000 : 10000}}") int queryRead) {
        if (enabled && token.isBlank()) throw new IllegalArgumentException("RAG 활성화에는 서비스 토큰이 필요합니다.");
        this.enabled=enabled;
        this.indexHttp=client(base,token,connect,read);
        this.queryHttp=client(base,token,queryConnect,queryRead);
    }
    private RestClient client(String base,String token,int connect,int read) {
        if(connect<=0 || read<=0) throw new IllegalArgumentException("RAG 타임아웃은 양수여야 합니다.");
        var factory=new SimpleClientHttpRequestFactory(); factory.setConnectTimeout(connect);factory.setReadTimeout(read);
        return RestClient.builder().baseUrl(base).requestFactory(factory).defaultHeader("X-Service-Token",token).build();
    }
    public boolean isEnabled() { return enabled; }
    public int index(IndexRequest request) {
        var result=indexHttp.post().uri("/index").contentType(MediaType.APPLICATION_JSON).body(request).retrieve().body(IndexResponse.class);
        if(result==null || !request.review_id().equals(result.review_id()) || result.chunks()<=0) throw new IllegalStateException("색인 응답이 올바르지 않습니다.");
        return result.chunks();
    }
    public int delete(Long id) {
        var result=indexHttp.delete().uri("/index/{id}",id).retrieve().body(DeleteResponse.class);
        if(result==null || !id.equals(result.review_id()) || result.deleted()<0) throw new IllegalStateException("삭제 응답이 올바르지 않습니다.");
        return result.deleted();
    }
    public RagAnswer query(String question,List<Long> ids,int topK) { return query(question,ids,topK,Map.of()); }
    public RagAnswer query(String question,List<Long> ids,int topK,Map<String,String> fingerprints) {
        var result=queryHttp.post().uri("/query").contentType(MediaType.APPLICATION_JSON).body(new QueryRequest(question,ids,topK,fingerprints)).retrieve().body(RagAnswer.class);
        if(result==null) throw new IllegalStateException("질의 응답이 없습니다.");
        return result;
    }
    public record IndexRequest(Long review_id,String movie_code,String title,String content,String fingerprint) {
        public IndexRequest(Long id,String movie,String title,String content) { this(id,movie,title,content,ReviewFingerprint.of(title,content,movie)); }
    }
    public record IndexResponse(Long review_id,int chunks) { }
    public record DeleteResponse(Long review_id,int deleted) { }
    private record QueryRequest(String question,List<Long> review_ids,int top_k,Map<String,String> fingerprints) { }
}
