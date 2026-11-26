package com.momo.backend.rag.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class RagPurgeExecutorConfig {
    // 탈퇴 요청 스레드에서 원격 삭제가 실행되지 않도록 전용 단일 스레드·유한 큐·AbortPolicy를 사용한다.
    @Bean("ragPurgeExecutor")
    public ThreadPoolTaskExecutor ragPurgeExecutor(@Value("${rag.purge.queue-capacity:100}") int capacity) {
        if (capacity < 1) throw new IllegalArgumentException("Purge queue capacity must be positive");
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(1);
        executor.setQueueCapacity(capacity);
        executor.setThreadNamePrefix("rag-purge-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(5);
        return executor;
    }
}
