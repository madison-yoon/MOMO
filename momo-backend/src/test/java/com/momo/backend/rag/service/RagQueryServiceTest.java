package com.momo.backend.rag.service;

import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.dto.RagAnswer;
import com.momo.backend.rag.dto.RagQueryRequest;
import com.momo.backend.rag.enums.QueryScope;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RagQueryServiceTest {
    private final RagClient client = mock(RagClient.class);
    private final RagQueryReader reader = mock(RagQueryReader.class);
    private final RagQueryService service = new RagQueryService(client, reader, 5, 2);
    private final LocalDateTime time = LocalDateTime.of(2026, 11, 25, 12, 0);
    private final RagQueryReader.Snapshot first = new RagQueryReader.Snapshot(1L, 7L, time, "first");
    private final RagAnswer answer = new RagAnswer("비공개가 될 수 있는 답변", false,
            List.of(new RagAnswer.Source(1L, "제목", "비공개가 될 수 있는 본문", .8, "first")),
            List.of("retrieve", "grade", "generate", "format"));

    @BeforeEach
    void enabled() {
        when(client.isEnabled()).thenReturn(true);
    }

    @Test
    void returnsValidatedAnswerAndTrimsQuestion() {
        prepare();
        assertEquals(answer, service.query(7L, new RagQueryRequest("  질문  ", QueryScope.ALL)));
        verify(client).query("질문", List.of(1L), 5, java.util.Map.of("1", "first"));
        verify(reader).readAllowed(QueryScope.ALL, 7L, 3);
        verify(reader).readReadySources(List.of(1L));
    }

    @Test
    void refusesEmptyAllowlistWithoutHttp() {
        when(reader.readAllowed(QueryScope.ALL, 7L, 3)).thenReturn(List.of());
        assertDiscarded(service.query(7L, request()));
        verify(client, never()).query(any(), any(), anyInt(), anyMap());
    }

    @Test
    void refusesOverflowWithoutTruncatingOrCallingHttp() {
        when(reader.readAllowed(QueryScope.ALL, 7L, 3)).thenReturn(List.of(first, first, first));
        assertDiscarded(service.query(7L, request()));
        verify(client, never()).query(any(), any(), anyInt(), anyMap());
    }

    @Test
    void acceptsExactlyTheAllowlistLimit() {
        when(reader.readAllowed(QueryScope.ALL, 7L, 3)).thenReturn(List.of(first,
                new RagQueryReader.Snapshot(2L, 8L, time, "other")));
        when(client.query("질문", List.of(1L, 2L), 5, java.util.Map.of("1", "first", "2", "other"))).thenReturn(answer);
        when(reader.readReadySources(List.of(1L))).thenReturn(List.of(first));
        assertFalse(service.query(7L, request()).abstained());
    }

    @Test
    void discardsEntireAnswerIfOneSourceWasNotAllowed() {
        prepare();
        when(client.query(any(), any(), anyInt(), anyMap())).thenReturn(new RagAnswer("비밀", false,
                List.of(answer.sources().getFirst(), new RagAnswer.Source(99L, "비밀", "비밀", 1)), answer.trace()));
        assertDiscarded(service.query(7L, request()));
        verify(client, times(1)).query(any(), any(), anyInt(), anyMap());
    }

    @Test
    void discardsDeletedOrNoLongerReadySource() {
        prepare();
        when(reader.readReadySources(anyList())).thenReturn(List.of());
        assertDiscarded(service.query(7L, request()));
    }

    @Test
    void detectsContentChangesEvenWithUnchangedTimestamp() {
        prepare();
        when(reader.readReadySources(anyList())).thenReturn(List.of(
                new RagQueryReader.Snapshot(1L, 7L, time, "changed-case-or-space")));
        assertDiscarded(service.query(7L, request()));
    }

    @Test
    void detectsTimestampChanges() {
        prepare();
        when(reader.readReadySources(anyList())).thenReturn(List.of(
                new RagQueryReader.Snapshot(1L, 7L, time.plusNanos(1000), "first")));
        assertDiscarded(service.query(7L, request()));
    }

    @Test
    void mineRequiresCurrentOwnerToMatchAuthenticatedNumericUserId() {
        when(reader.readAllowed(QueryScope.MINE, 7L, 3)).thenReturn(List.of(first));
        when(client.query("질문", List.of(1L), 5, java.util.Map.of("1", "first"))).thenReturn(answer);
        when(reader.readReadySources(anyList())).thenReturn(List.of(
                new RagQueryReader.Snapshot(1L, 8L, time, "first")));
        assertDiscarded(service.query(7L, new RagQueryRequest("질문", QueryScope.MINE)));
    }

    @Test
    void refusesNormalAnswerWithoutSources() {
        prepare();
        when(client.query(any(), any(), anyInt(), anyMap())).thenReturn(new RagAnswer("비밀", false, List.of(), List.of("generate")));
        assertDiscarded(service.query(7L, request()));
    }

    @Test
    void refusesUntrustedTraceEvenWhenSourcesAreValid() {
        prepare();
        when(client.query(any(), any(), anyInt(), anyMap())).thenReturn(new RagAnswer("비밀", false, answer.sources(), List.of("token=secret")));
        assertDiscarded(service.query(7L, request()));
    }

    @Test
    void preservesEvidenceShortageRewriteTrace() {
        prepare();
        RagAnswer abstained = new RagAnswer("근거 부족", true, List.of(),
                List.of("retrieve", "grade", "rewrite", "retrieve", "grade", "abstain", "format"));
        when(client.query(any(), any(), anyInt(), anyMap())).thenReturn(abstained);
        assertEquals(abstained, service.query(7L, request()));
    }

    @Test
    void disabledAndHttpFailureReturnServiceUnavailable() {
        when(client.isEnabled()).thenReturn(false);
        assertEquals(503, assertThrows(ResponseStatusException.class,
                () -> service.query(7L, request())).getStatusCode().value());
        when(client.isEnabled()).thenReturn(true);
        when(reader.readAllowed(QueryScope.ALL, 7L, 3)).thenReturn(List.of(first));
        when(client.query(any(), any(), anyInt(), anyMap())).thenThrow(new ResourceAccessException("sensitive remote failure"));
        ResponseStatusException error = assertThrows(ResponseStatusException.class, () -> service.query(7L, request()));
        assertEquals(503, error.getStatusCode().value());
        assertFalse(error.getReason().contains("sensitive"));
    }

    @Test
    void rejectsInvalidQuestionScopeAndUserBeforeAnyDatabaseOrHttpCall() {
        for (RagQueryRequest invalid : List.of(new RagQueryRequest("  ", QueryScope.ALL),
                new RagQueryRequest("가".repeat(501), QueryScope.ALL), new RagQueryRequest("질문", null))) {
            assertThrows(IllegalArgumentException.class, () -> service.query(7L, invalid));
        }
        assertEquals(401, assertThrows(ResponseStatusException.class,
                () -> service.query(null, request())).getStatusCode().value());
        verifyNoInteractions(reader);
    }

    @Test
    void remoteBudgetFailureRemains429AndReleasesConcurrentLease() {
        prepare();
        when(client.query(any(), any(), anyInt(), anyMap())).thenThrow(
                new org.springframework.web.client.HttpClientErrorException(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS));
        assertEquals(429, assertThrows(ResponseStatusException.class, () -> service.query(7L, request())).getStatusCode().value());
        doReturn(answer).when(client).query(any(), any(), anyInt(), anyMap());
        assertEquals(answer, service.query(7L, request()));
    }

    @Test
    void staleSourceFingerprintIsDiscardedEvenWhenCurrentSnapshotIsUnchanged() {
        prepare();
        when(client.query(any(), any(), anyInt(), anyMap())).thenReturn(new RagAnswer("비밀", false,
                List.of(new RagAnswer.Source(1L, "제목", "본문", .9, "old")), List.of("generate")));
        assertDiscarded(service.query(7L, request()));
    }

    @Test
    void rejectsInvalidServerConfiguration() {
        assertThrows(IllegalArgumentException.class, () -> new RagQueryService(client, reader, 0, 2));
        assertThrows(IllegalArgumentException.class, () -> new RagQueryService(client, reader, 21, 2));
        assertThrows(IllegalArgumentException.class, () -> new RagQueryService(client, reader, 5, 0));
    }

    private RagQueryRequest request() { return new RagQueryRequest("질문", QueryScope.ALL); }

    private void prepare() {
        when(reader.readAllowed(QueryScope.ALL, 7L, 3)).thenReturn(List.of(first));
        when(client.query("질문", List.of(1L), 5, java.util.Map.of("1", "first"))).thenReturn(answer);
        when(reader.readReadySources(List.of(1L))).thenReturn(List.of(first));
    }

    private void assertDiscarded(RagAnswer result) {
        assertTrue(result.abstained());
        assertTrue(result.sources().isEmpty());
        assertTrue(result.trace().isEmpty());
        assertFalse(result.answer().contains("비밀"));
        assertFalse(result.answer().contains("비공개"));
    }
}
