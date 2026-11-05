package com.momo.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
@Profile("!test")
public class FirebaseConfig {

    private static final String STORAGE_BUCKET =
            "momo-ca07b.firebasestorage.app";

    @PostConstruct
    public void initializeFirebase() throws IOException {

        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        String serviceAccountPath =
                System.getenv("FIREBASE_SERVICE_ACCOUNT_PATH");

        if (serviceAccountPath == null || serviceAccountPath.isBlank()) {
            throw new IllegalStateException(
                    "FIREBASE_SERVICE_ACCOUNT_PATH 환경변수를 설정해야 합니다."
            );
        }

        Path credentialFile = Path.of(serviceAccountPath);

        if (!Files.isRegularFile(credentialFile)) {
            throw new IllegalStateException(
                    "Firebase 서비스 계정 파일을 찾을 수 없습니다: " + credentialFile
            );
        }

        try (InputStream serviceAccount = Files.newInputStream(credentialFile)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket(STORAGE_BUCKET)
                    .build();

            FirebaseApp.initializeApp(options);
        }
    }
}
