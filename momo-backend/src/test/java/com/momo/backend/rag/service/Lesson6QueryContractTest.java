package com.momo.backend.rag.service;
import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.dto.*;
import com.momo.backend.rag.enums.QueryScope;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class Lesson6QueryContractTest {
 @Test void sourceWithoutFingerprintCannotBecomeAnAnswer() {
  var client=mock(RagClient.class); var reader=mock(RagQueryReader.class);
  var row=new RagQueryReader.Snapshot(1L,7L,LocalDateTime.now(),"current-hash");
  when(client.isEnabled()).thenReturn(true);
  when(reader.readAllowed(any(),anyLong(),anyInt())).thenReturn(List.of(row));
  when(reader.readReadySources(anyList())).thenReturn(List.of(row));
  when(client.query(any(),any(),anyInt(),anyMap())).thenReturn(new RagAnswer("unsafe",false,List.of(new RagAnswer.Source(1L,"title","text",.9)),List.of("generate")));
  assertTrue(new RagQueryService(client,reader,5,2).query(7L,new RagQueryRequest("question",QueryScope.ALL)).abstained());
 }
 @Test void sixthQuestionInOneMinuteIsRejectedEvenWithEmptyEvidence() {
  var client=mock(RagClient.class); var reader=mock(RagQueryReader.class);
  when(client.isEnabled()).thenReturn(true); when(reader.readAllowed(any(),anyLong(),anyInt())).thenReturn(List.of());
  var service=new RagQueryService(client,reader,5,2); var request=new RagQueryRequest("question",QueryScope.ALL);
  for(int i=0;i<5;i++) service.query(7L,request);
  assertEquals(429,assertThrows(ResponseStatusException.class,()->service.query(7L,request)).getStatusCode().value());
 }
 @Test void topKCannotExceedFive() {assertThrows(IllegalArgumentException.class,()->new RagQueryService(mock(RagClient.class),mock(RagQueryReader.class),6,2));}
}
