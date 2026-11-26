package com.momo.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChatImageStorageQuotaTest {
    @TempDir Path directory;

    MockMultipartFile png() throws IOException {
        var bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB), "png", bytes);
        return new MockMultipartFile("file", "image.png", "image/png", bytes.toByteArray());
    }

    void status(int expected, org.junit.jupiter.api.function.Executable action) {
        assertEquals(expected, assertThrows(ResponseStatusException.class, action).getStatusCode().value());
    }

    @Test void rollingWindowAllowsTenAndExpiresAtExactlySixtySecondsPerMember() throws Exception {
        var now = new AtomicReference<>(Instant.parse("2026-11-15T00:00:00Z"));
        Clock clock = mock(Clock.class);
        when(clock.instant()).thenAnswer(invocation -> now.get());
        var service = new ChatImageStorageService(directory.toString(), clock);
        for (int i = 0; i < 10; i++) service.store(png(), 1L);
        status(429, () -> service.store(png(), 1L));
        service.store(png(), 2L);
        now.set(now.get().plusSeconds(59));
        status(429, () -> service.store(png(), 1L));
        now.set(now.get().plusSeconds(1));
        service.store(png(), 1L);
    }

    @Test void failedValidationAndWritesConsumeAttemptsButDoNotConsumeFileCapacity() throws Exception {
        var service = new ChatImageStorageService(directory.toString()) {
            @Override void writeTemporaryImage(Path temporary, byte[] bytes) throws IOException {
                Files.write(temporary, new byte[]{1});
                throw new IOException("test write failure");
            }
        };
        for (int i = 0; i < 5; i++) status(400, () -> service.store(null, 1L));
        for (int i = 0; i < 5; i++) assertThrows(IllegalStateException.class, () -> service.store(png(), 1L));
        status(429, () -> service.store(png(), 1L));
        assertEquals(0, service.directoryUsageBytes());
    }

    @Test void concurrentSameMemberRequestsCannotBypassTenAttempts() throws Exception {
        var service = new ChatImageStorageService(directory.toString());
        assertEquals(10, parallelUploads(service, 16, true));
        try (var files = Files.list(directory)) { assertEquals(10, files.count()); }
    }

    @Test void concurrentDifferentMembersCannotConsumeTheSameRemainingCapacity() throws Exception {
        int size = png().getBytes().length;
        // 실제 파일을 합산하되 사용량에 보정값을 더해 디스크를 채우지 않고 한도 경쟁을 검증한다.
        var service = new ChatImageStorageService(directory.toString()) {
            @Override long directoryUsageBytes() throws IOException {
                return MAX_DIRECTORY_BYTES - size + super.directoryUsageBytes();
            }
            @Override long usableSpaceBytes() { return Long.MAX_VALUE; }
        };
        assertEquals(1, parallelUploads(service, 8, false));
        try (var files = Files.list(directory)) { assertEquals(1, files.count()); }
    }

    int parallelUploads(ChatImageStorageService service, int count, boolean sameMember) throws Exception {
        var start = new java.util.concurrent.CountDownLatch(1);
        try (var pool = java.util.concurrent.Executors.newFixedThreadPool(8)) {
            var results = new java.util.ArrayList<java.util.concurrent.Future<Boolean>>();
            for (int i = 0; i < count; i++) {
                long owner = sameMember ? 1L : i + 1L;
                results.add(pool.submit(() -> {
                    start.await();
                    try { service.store(png(), owner); return true; }
                    catch (ResponseStatusException error) {
                        assertEquals(sameMember ? 429 : 507, error.getStatusCode().value());
                        return false;
                    }
                }));
            }
            start.countDown();
            int successes = 0;
            for (var result : results) if (result.get(10, java.util.concurrent.TimeUnit.SECONDS)) successes++;
            return successes;
        }
    }

    @Test void directoryLimitAllowsExactBoundaryAndRejectsOneByteOver() throws Exception {
        int size = png().getBytes().length;
        var used = new java.util.concurrent.atomic.AtomicLong(ChatImageStorageService.MAX_DIRECTORY_BYTES - size);
        var service = new ChatImageStorageService(directory.toString()) {
            @Override long directoryUsageBytes() { return used.get(); }
            @Override long usableSpaceBytes() { return Long.MAX_VALUE; }
        };
        service.store(png(), 1L);
        used.incrementAndGet();
        status(507, () -> service.store(png(), 2L));
    }

    @Test void restartInventoriesUnknownNestedTemporaryAndOldAttachedFilesWithoutDeletingThem() throws Exception {
        var first = new ChatImageStorageService(directory.toString());
        String id = first.store(png(), 1L);
        first.attachToMessage(id, 1L);
        Files.write(directory.resolve("unknown.png"), new byte[13]);
        Files.write(Files.createDirectory(directory.resolve("old")).resolve("upload-leftover.tmp"), new byte[17]);
        var restarted = new ChatImageStorageService(directory.toString());
        assertEquals(png().getSize() + 30, restarted.directoryUsageBytes());
        restarted.store(png(), 2L);
        assertEquals(2 * png().getSize() + 30, restarted.directoryUsageBytes());
        assertTrue(Files.exists(directory.resolve(id + ".png")));
        assertTrue(Files.exists(directory.resolve("unknown.png")));
    }

    @Test void failedDeletionStillCountsUntilTheFileIsActuallyRemoved() throws Exception {
        var service = new ChatImageStorageService(directory.toString());
        String id = service.store(png(), 1L);
        Path file = directory.resolve(id + ".png");
        Files.delete(file);
        Files.createDirectory(file);
        Path blocker = Files.write(file.resolve("blocker"), new byte[19]);
        service.delete(id);
        assertEquals(19, service.directoryUsageBytes());
        // 삭제 실패를 성공으로 간주해 용량을 반환하지 않고 남은 파일을 계속 합산하는지 확인한다.
        Files.delete(blocker);
        Files.delete(file);
        Files.write(file, png().getBytes());
        service.store(png(), 2L);
        assertFalse(Files.exists(file));
        assertEquals(png().getSize(), service.directoryUsageBytes());
    }

    @Test void insufficientDiskAndDiskProbeFailureRejectWithoutCreatingImageFiles() throws Exception {
        var space = new java.util.concurrent.atomic.AtomicLong(png().getSize() - 1);
        var service = new ChatImageStorageService(directory.toString()) {
            @Override long usableSpaceBytes() throws IOException {
                if (space.get() < 0) throw new IOException("test probe failure");
                return space.get();
            }
        };
        status(507, () -> service.store(png(), 1L));
        space.set(-1);
        status(503, () -> service.store(png(), 1L));
        assertEquals(0, service.directoryUsageBytes());
        space.set(png().getSize());
        service.store(png(), 1L);
    }

    @Test void unreadableInventoryFailsClosedAndPreservesExistingFiles() throws Exception {
        Path existing = Files.write(directory.resolve("unknown"), new byte[11]);
        var service = new ChatImageStorageService(directory.toString()) {
            @Override long directoryUsageBytes() throws IOException { throw new IOException("test inventory failure"); }
        };
        status(503, () -> service.store(png(), 1L));
        assertEquals(11, Files.size(existing));
        try (var files = Files.list(directory)) { assertEquals(1, files.count()); }
    }
}
