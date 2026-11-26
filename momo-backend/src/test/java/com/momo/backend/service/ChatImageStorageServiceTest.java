package com.momo.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChatImageStorageServiceTest {

    @TempDir
    Path tempDirectory;

    @Test
    void validatesActualPngDataAndAllowsOnlyUploaderToAttachIt() throws Exception {
        ChatImageStorageService service = new ChatImageStorageService(tempDirectory.toString());
        String imageId = service.store(pngFile("renamed.exe"), 7L);

        assertThrows(ChatRuleViolationException.class, () -> service.attachToMessage(imageId, 8L));
        assertThrows(ResponseStatusException.class, () -> service.read(imageId));

        service.attachToMessage(imageId, 7L);
        ChatImageStorageService.ImageContent image = service.read(imageId);
        assertEquals("image/png", image.contentType());
        assertTrue(image.bytes().length > 0);
        assertThrows(ChatRuleViolationException.class, () -> service.attachToMessage(imageId, 7L));

        service.delete(imageId);
        assertThrows(ResponseStatusException.class, () -> service.read(imageId));
    }

    @Test
    void rejectsSvgSpoofedImageAndFilesOverFiveMegabytes() throws Exception {
        ChatImageStorageService service = new ChatImageStorageService(tempDirectory.toString());
        MockMultipartFile svg = new MockMultipartFile("file", "vector.png", "image/png",
                "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>".getBytes());
        assertThrows(ResponseStatusException.class, () -> service.store(svg, 1L));

        MockMultipartFile fakePng = new MockMultipartFile("file", "fake.png", "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1});
        assertThrows(ResponseStatusException.class, () -> service.store(fakePng, 1L));

        MockMultipartFile oversized = new MockMultipartFile("file", "large.png", "image/png",
                new byte[(int) ChatImageStorageService.MAX_IMAGE_BYTES + 1]);
        assertThrows(ResponseStatusException.class, () -> service.store(oversized, 1L));
    }

    @Test
    void preservesUnknownFilesAfterRestartAndDuringLaterUploads() throws Exception {
        ChatImageStorageService service = new ChatImageStorageService(tempDirectory.toString());
        String oldId = service.store(pngFile("old.png"), 1L);
        service.attachToMessage(oldId, 1L);
        Path oldFile;
        try (var files = Files.list(tempDirectory)) {
            oldFile = files.findFirst().orElseThrow();
        }

        // 새 인스턴스로 서버 재시작 후 메모리 이력이 없는 상황을 확인한다.
        ChatImageStorageService restarted = new ChatImageStorageService(tempDirectory.toString());
        restarted.store(pngFile("new.png"), 2L);

        assertTrue(Files.exists(oldFile), "Missing memory metadata must not authorize deletion of an existing file");
    }

    @Test
    void retriesKnownFailedDeletionOnNextUploadWithoutDeletingUnknownFiles() throws Exception {
        ChatImageStorageService service = new ChatImageStorageService(tempDirectory.toString());
        MockMultipartFile png = pngFile("image.png");
        String id = service.store(png, 1L);
        service.attachToMessage(id, 1L);
        Path image;
        try (var files = Files.list(tempDirectory)) { image = files.findFirst().orElseThrow(); }
        Files.delete(image);
        Files.createDirectory(image);
        Path blocker = Files.writeString(image.resolve("blocker"), "test only");
        service.delete(id); // 비어 있지 않은 디렉터리로 만들어 파일 삭제 실패를 재현한다.
        assertThrows(ResponseStatusException.class, () -> service.read(id));
        assertTrue(Files.exists(image));
        Files.delete(blocker);
        Files.delete(image);
        Files.write(image, png.getBytes());
        Path unknown = Files.writeString(tempDirectory.resolve("untracked-existing.jpg"), "preserve");
        service.store(pngFile("next.png"), 2L);
        assertFalse(Files.exists(image), "The retained known deletion must be retried");
        assertTrue(Files.exists(unknown));
        assertThrows(ResponseStatusException.class, () -> service.read(id));
    }

    @Test
    void ignoresClientPathAndRejectsTraversalImageIdentifiers() throws Exception {
        var service = new ChatImageStorageService(tempDirectory.toString());
        String id = service.store(pngFile("../../outside.exe"), 7L);
        assertTrue(id.matches("[0-9a-f-]{36}"));
        try (var files = Files.list(tempDirectory)) {
            Path stored = files.findFirst().orElseThrow();
            assertEquals(id + ".png", stored.getFileName().toString());
        }
        assertThrows(ChatRuleViolationException.class, () -> service.attachToMessage("../../outside", 7L));
        assertThrows(ResponseStatusException.class, () -> service.read("../../outside"));
    }

    @Test
    void checksActualByteLengthEvenWhenMultipartSizeIsUnderreported() {
        var service = new ChatImageStorageService(tempDirectory.toString());
        var file = org.mockito.Mockito.spy(new MockMultipartFile("file", "image.png", "image/png",
                new byte[(int) ChatImageStorageService.MAX_IMAGE_BYTES + 1]));
        org.mockito.Mockito.when(file.getSize()).thenReturn(1L);
        ResponseStatusException error = assertThrows(ResponseStatusException.class, () -> service.store(file, 1L));
        assertEquals(413, error.getStatusCode().value());
    }

    @Test
    void expiresOnlyKnownUnsentImagesAndPreservesAttachedAndUnknownFiles() throws Exception {
        var now = new java.util.concurrent.atomic.AtomicReference<>(java.time.Instant.parse("2026-11-15T00:00:00Z"));
        var clock = org.mockito.Mockito.mock(java.time.Clock.class);
        org.mockito.Mockito.when(clock.instant()).thenAnswer(invocation -> now.get());
        var service = new ChatImageStorageService(tempDirectory.toString(), clock);
        String pending = service.store(pngFile("pending.png"), 1L);
        String attached = service.store(pngFile("attached.png"), 1L);
        service.attachToMessage(attached, 1L);
        Path unknown = Files.writeString(tempDirectory.resolve("untracked-existing.png"), "preserve");
        now.set(now.get().plusSeconds(31 * 60));
        service.store(pngFile("next.png"), 2L);
        assertThrows(ChatRuleViolationException.class, () -> service.attachToMessage(pending, 1L));
        assertFalse(Files.exists(tempDirectory.resolve(pending + ".png")));
        assertTrue(service.read(attached).bytes().length > 0);
        assertTrue(Files.exists(unknown));
    }

    @Test
    void acceptsActualJpegAndRejectsMalformedWebpContainer() throws Exception {
        var service = new ChatImageStorageService(tempDirectory.toString());
        var bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB), "jpg", bytes);
        String jpeg = service.store(new MockMultipartFile("file", "spoof.png", "image/png", bytes.toByteArray()), 1L);
        service.attachToMessage(jpeg, 1L);
        assertEquals("image/jpeg", service.read(jpeg).contentType());
        byte[] malformed = new byte[30];
        System.arraycopy("RIFF".getBytes(java.nio.charset.StandardCharsets.US_ASCII), 0, malformed, 0, 4);
        System.arraycopy("WEBP".getBytes(java.nio.charset.StandardCharsets.US_ASCII), 0, malformed, 8, 4);
        assertThrows(ResponseStatusException.class, () -> service.store(
                new MockMultipartFile("file", "fake.webp", "image/webp", malformed), 1L));
    }

    @Test
    void removesPartialTemporaryFileWhenWritingFailsAndPreservesExistingFiles() throws Exception {
        Path existing=Files.writeString(tempDirectory.resolve("existing-untracked.png"),"preserve");
        var failing=new ChatImageStorageService(tempDirectory.toString()) {
            @Override void writeTemporaryImage(Path temporary,byte[] bytes) throws java.io.IOException {
                Files.write(temporary,new byte[]{1,2,3});
                throw new java.io.IOException("simulated partial write");
            }
        };
        assertThrows(IllegalStateException.class,()->failing.store(pngFile("upload.png"),7L));
        try(var files=Files.list(tempDirectory)){assertEquals(java.util.List.of(existing),files.toList());}
        var normal=new ChatImageStorageService(tempDirectory.toString());
        String id=normal.store(pngFile("retry.png"),7L);
        normal.attachToMessage(id,7L);
        assertTrue(normal.read(id).bytes().length>0);
        assertTrue(Files.exists(existing));
    }

    @Test
    void concurrentUploadsKeepDistinctFilesAndStillEnforcePerFileSize() throws Exception {
        var service=new ChatImageStorageService(tempDirectory.toString());
        byte[] png=pngFile("image.png").getBytes();
        try(var pool=java.util.concurrent.Executors.newFixedThreadPool(4)) {
            var start=new java.util.concurrent.CountDownLatch(1);
            var futures=new java.util.ArrayList<java.util.concurrent.Future<String>>();
            for(int i=0;i<8;i++)futures.add(pool.submit(()->{start.await();return service.store(
                    new MockMultipartFile("file","same-name.png","image/png",png),7L);}));
            start.countDown();
            var ids=new java.util.HashSet<String>();
            for(var result:futures)ids.add(result.get(5,java.util.concurrent.TimeUnit.SECONDS));
            assertEquals(8,ids.size());
            for(String id:ids)assertTrue(Files.exists(tempDirectory.resolve(id+".png")));
            assertThrows(ResponseStatusException.class,()->service.store(new MockMultipartFile("file","too-large.png",
                    "image/png",new byte[(int)ChatImageStorageService.MAX_IMAGE_BYTES+1]),7L));
            try(var files=Files.list(tempDirectory)){assertEquals(8,files.count());}
        }
    }

    private MockMultipartFile pngFile(String name) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB), "png", bytes);
        return new MockMultipartFile("file", name, "image/png", bytes.toByteArray());
    }
}
