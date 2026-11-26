package com.momo.backend.observability;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** 요청·작업별 계측 상태를 관리하며 토큰·URL·쿼리·회원정보를 보관하지 않는다. */
public final class ApiCallTrace {
    private static final Logger log = LoggerFactory.getLogger(ApiCallTrace.class);
    public enum Source { HTTP, SCHEDULER, ASYNC, UNSCOPED }
    private static final ThreadLocal<Context> CONTEXT = new ThreadLocal<>();
    private static final ThreadLocal<Operation> OPERATION = new ThreadLocal<>();
    private ApiCallTrace() { }

    public static final class Context {
        private final Source source;
        private final String requestId;
        private final AtomicLong catalogAttempts = new AtomicLong();
        private Context(Source source, String requestId) { this.source = source; this.requestId = requestId; }
        public Source source() { return source; }
        public String requestId() { return requestId; }
        public long catalogAttempts() { return catalogAttempts.get(); }
    }
    public static Context current() { return CONTEXT.get(); }
    public static String source() { return current() == null ? "UNSCOPED" : current().source().name(); }
    public static String requestId() { return current() == null ? "none" : current().requestId(); }
    public static Scope open(Source source) { return open(source, UUID.randomUUID().toString()); }
    private static Scope open(Source source, String id) {
        Context previous = current();
        Operation previousOperation = OPERATION.get();
        Context context = new Context(source, id);
        CONTEXT.set(context);
        OPERATION.remove();
        return new Scope(previous, previousOperation, context);
    }
    public static final class Scope implements AutoCloseable {
        private final Context previous;
        private final Operation previousOperation;
        private final Context context;
        private Scope(Context previous, Operation previousOperation, Context context) {
            this.previous = previous; this.previousOperation = previousOperation; this.context = context;
        }
        public Context context() { return context; }
        @Override public void close() {
            if (previous == null) CONTEXT.remove(); else CONTEXT.set(previous);
            if (previousOperation == null) OPERATION.remove(); else OPERATION.set(previousOperation);
        }
    }
    private record Operation(String provider, String endpoint, AtomicLong attempts) { }
    public static AutoCloseableOperation operation(String provider, String endpoint) {
        Operation previous = OPERATION.get();
        OPERATION.set(new Operation(provider, endpoint, new AtomicLong()));
        return new AutoCloseableOperation(previous);
    }
    public static final class AutoCloseableOperation implements AutoCloseable {
        private final Operation previous;
        private AutoCloseableOperation(Operation previous) { this.previous = previous; }
        @Override public void close() { if (previous == null) OPERATION.remove(); else OPERATION.set(previous); }
    }
    public static ClientHttpRequestInterceptor interceptor() {
        return (request, body, execution) -> {
            Operation operation = OPERATION.get();
            String provider = operation == null ? "UNSCOPED" : operation.provider();
            String endpoint = operation == null ? "UNSCOPED" : operation.endpoint();
            long attempt = operation == null ? 1 : operation.attempts().incrementAndGet();
            Context context = current();
            if (context != null && "KOBIS".equals(provider) && "searchCatalogMovies".equals(endpoint)) {
                context.catalogAttempts.incrementAndGet();
            }
            log.info("EXTERNAL_HTTP_ATTEMPT source={} requestId={} provider={} endpoint={} attempt={}",
                    source(), requestId(), provider, endpoint, attempt);
            return execution.execute(request, body);
        };
    }
    public static Runnable decorateAsync(Runnable task) {
        String id = current() == null ? UUID.randomUUID().toString() : current().requestId();
        return () -> {
            try (Scope scope = open(Source.ASYNC, id)) {
                try { task.run(); }
                finally {
                    if (scope.context().catalogAttempts() > 0) {
                        log.info("ASYNC_API_SUMMARY source=ASYNC requestId={} catalogHttpAttempts={}",
                                id, scope.context().catalogAttempts());
                    }
                }
            }
        };
    }
}
