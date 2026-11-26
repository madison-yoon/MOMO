package com.momo.backend.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FirebaseStorageServiceTest {
    private static final int FIVE_MIB = 5 * 1024 * 1024;

    @Test void rejectsOneByteOverFiveMiBBeforeReadingOrContactingFirebase() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn((long) FIVE_MIB + 1);
        // 정상 형식·서명을 사용해 크기 상수 오류가 다른 MIME 오류에 가려지지 않도록 한다.
        // 파일 크기 제한 자체가 적용되는지 확인한다.
        when(file.getContentType()).thenReturn("image/png");
        when(file.getBytes()).thenReturn(new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a});
        try (var firebase = mockStatic(StorageClient.class)) {
            assertThrows(IllegalArgumentException.class, () -> new FirebaseStorageService().uploadProfileImage(file));
            verify(file, never()).getBytes();
            firebase.verifyNoInteractions();
        }
    }

    @Test void acceptsExactFiveMiBAndUnderTheBoundaryUsingMockFirebaseOnly() throws Exception {
        StorageClient client = mock(StorageClient.class);
        Bucket bucket = mock(Bucket.class);
        Blob blob = mock(Blob.class);
        when(client.bucket()).thenReturn(bucket);
        when(bucket.create(anyString(), any(byte[].class), eq("image/png"))).thenReturn(blob);
        when(blob.getName()).thenReturn("profile-images/test.png");
        try (var firebase = mockStatic(StorageClient.class)) {
            firebase.when(StorageClient::getInstance).thenReturn(client);
            for (int size : new int[]{FIVE_MIB - 1, FIVE_MIB}) {
                byte[] bytes = new byte[size];
                byte[] signature = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
                System.arraycopy(signature, 0, bytes, 0, signature.length);
                assertEquals("profile-images/test.png", new FirebaseStorageService().uploadProfileImage(
                        new MockMultipartFile("file", "profile.png", "image/png", bytes)));
            }
            verify(bucket, times(2)).create(startsWith("profile-images/"), any(byte[].class), eq("image/png"));
        }
    }

    @Test void rejectsInvalidTypeAndSignatureWithoutContactingFirebase() {
        try (var firebase = mockStatic(StorageClient.class)) {
            var service = new FirebaseStorageService();
            assertThrows(IllegalArgumentException.class, () -> service.uploadProfileImage(
                    new MockMultipartFile("file", "image.svg", "image/svg+xml", "<svg/>".getBytes())));
            assertThrows(IllegalArgumentException.class, () -> service.uploadProfileImage(
                    new MockMultipartFile("file", "image.png", "image/png", "not png".getBytes())));
            firebase.verifyNoInteractions();
        }
    }
}
