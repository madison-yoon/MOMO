package com.momo.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.FileVisitResult;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.time.Instant;
import java.time.Clock;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

// 채팅 이미지 파일 검증·저장·정리
@Service
@Slf4j
public class ChatImageStorageService {

    public static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    static final long MAX_DIRECTORY_BYTES = 1024L * 1024 * 1024;
    private static final int MAX_UPLOADS_PER_MINUTE = 10;
    private static final long PENDING_UPLOAD_TTL_SECONDS = 30 * 60;
    private static final int MAX_IMAGE_PIXELS = 20_000_000;

    private final Path imageDirectory;
    private final Clock clock;
    private final Map<String, StoredImage> images = new ConcurrentHashMap<>();
    private final Set<String> pendingDeletes = ConcurrentHashMap.newKeySet();
    private final Map<Long, Deque<Instant>> uploadAttempts = new HashMap<>();

    @org.springframework.beans.factory.annotation.Autowired
    public ChatImageStorageService(
            @Value("${momo.storage.chat-image-dir:${user.home}/momo-data/chat-images}") String directory) {
        this(directory, Clock.systemUTC());
    }

    ChatImageStorageService(String directory, Clock clock) {
        this.imageDirectory = Path.of(directory).toAbsolutePath().normalize();
        this.clock = clock;
    }

    // 파일 이름이나 MIME 값 대신 실제 데이터와 크기를 확인해 저장한다.
    public synchronized String store(MultipartFile file, Long ownerId) {
        enforceUploadRate(ownerId);
        purgeExpiredUploads();
        // 소유 정보를 아는 이미지의 삭제 실패만 재시도한다.
        // 이전 실행에서 남은 불명확 파일은 메모리 기록이 없다는 이유로 삭제하지 않는다.
        Set.copyOf(pendingDeletes).forEach(this::delete);
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일을 선택해 주세요.");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "이미지는 최대 5MB까지 업로드할 수 있습니다.");
        }

        try {
            byte[] bytes = file.getBytes();
            if (bytes.length == 0 || bytes.length > MAX_IMAGE_BYTES) {
                throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "이미지는 최대 5MB까지 업로드할 수 있습니다.");
            }
            ImageFormat format = detectAndValidate(bytes);
            String imageId = UUID.randomUUID().toString();
            Path destination = resolve(imageId, format.extension());
            checkStorageCapacity(bytes.length);
            Path temporary = Files.createTempFile(imageDirectory, "upload-", ".tmp");
            try {
                writeTemporaryImage(temporary, bytes);
                try {
                    Files.move(temporary, destination, StandardCopyOption.ATOMIC_MOVE);
                } catch (AtomicMoveNotSupportedException ignored) {
                    Files.move(temporary, destination);
                }
            } finally {
                Files.deleteIfExists(temporary);
            }
            images.put(imageId, new StoredImage(ownerId, destination, format.contentType(), clock.instant(), false));
            return imageId;
        } catch (IOException exception) {
            throw new IllegalStateException("채팅 이미지 저장에 실패했습니다.", exception);
        }
    }

    // 검증·저장 실패를 포함한 인증 회원의 업로드 시도를 최근 60초 기준으로 집계한다.
    private void enforceUploadRate(Long ownerId) {
        if (ownerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        Instant now = clock.instant();
        Instant cutoff = now.minusSeconds(60);
        uploadAttempts.values().forEach(times -> {
            while (!times.isEmpty() && !times.peekFirst().isAfter(cutoff)) times.removeFirst();
        });
        uploadAttempts.values().removeIf(Deque::isEmpty);
        Deque<Instant> times = uploadAttempts.computeIfAbsent(ownerId, ignored -> new ArrayDeque<>());
        if (times.size() >= MAX_UPLOADS_PER_MINUTE) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "이미지는 60초 동안 최대 10회 업로드할 수 있습니다. 잠시 후 다시 시도해 주세요.");
        }
        times.addLast(now);
    }

    // 같은 인스턴스의 동시 업로드가 남은 용량을 중복 사용하지 않도록 검사부터 이동까지 잠근다.
    // 재시작 후에도 실제 사용량을 반영하도록 매번 폴더를 다시 합산한다.
    private void checkStorageCapacity(long incomingBytes) {
        try {
            Files.createDirectories(imageDirectory);
            long used = directoryUsageBytes();
            if (used > MAX_DIRECTORY_BYTES - incomingBytes || usableSpaceBytes() < incomingBytes) {
                throw new ResponseStatusException(HttpStatus.INSUFFICIENT_STORAGE,
                        "채팅 이미지 저장 공간이 부족합니다. 잠시 후 다시 시도해 주세요.");
            }
        } catch (IOException | SecurityException exception) {
            // 폴더 조회 실패를 사용량 0으로 처리하면 제한을 우회할 수 있으므로 저장을 거부한다.
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "채팅 이미지 저장 공간을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    long directoryUsageBytes() throws IOException {
        if (Files.isSymbolicLink(imageDirectory)) throw new IOException("Unsupported storage link");
        long[] total = {0};
        Files.walkFileTree(imageDirectory, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attributes) throws IOException {
                if (!attributes.isRegularFile()) throw new IOException("Unsupported storage entry");
                // 하위 폴더의 불명확 파일·임시 파일·삭제 실패 파일도 사용량에 포함한다.
                total[0] = Math.min(MAX_DIRECTORY_BYTES + 1,
                        total[0] + Math.min(attributes.size(), MAX_DIRECTORY_BYTES + 1));
                return FileVisitResult.CONTINUE;
            }
        });
        return total[0];
    }

    long usableSpaceBytes() throws IOException {
        return Files.getFileStore(imageDirectory).getUsableSpace();
    }

    // 실제 부분 쓰기 실패와 정리를 검증하도록 파일 쓰기 경계를 패키지에 공개한다.
    void writeTemporaryImage(Path temporary, byte[] bytes) throws IOException {
        Files.write(temporary, bytes);
    }

    // 업로드한 회원만 이미지를 메시지에 한 번 연결할 수 있다.
    public synchronized void attachToMessage(String imageId, Long ownerId) {
        StoredImage image = images.get(imageId);
        if (image != null && !image.attached()
                && image.createdAt().isBefore(clock.instant().minusSeconds(PENDING_UPLOAD_TTL_SECONDS))) {
            delete(imageId);
            image = null;
        }
        if (image == null || pendingDeletes.contains(imageId)
                || !image.ownerId().equals(ownerId) || image.attached()) {
            throw new ChatRuleViolationException("IMAGE_UNAVAILABLE", "이미지를 사용할 수 없거나 업로드한 회원이 아닙니다.");
        }
        images.put(imageId, image.withAttached(true));
    }

    // 현재 채팅 이력에 연결된 이미지 파일을 반환한다.
    public ImageContent read(String imageId) {
        StoredImage image = images.get(imageId);
        if (image == null || pendingDeletes.contains(imageId) || !image.attached()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅 이미지를 찾을 수 없습니다.");
        }
        try {
            return new ImageContent(Files.readAllBytes(image.path()), image.contentType());
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅 이미지를 찾을 수 없습니다.");
        }
    }

    // 메시지가 삭제되거나 보관 한도를 넘으면 연결된 파일도 정리한다.
    public synchronized void delete(String imageId) {
        StoredImage image = images.get(imageId);
        if (image != null) {
            if (deleteFileQuietly(image.path())) {
                images.remove(imageId);
                pendingDeletes.remove(imageId);
            } else {
                // 다음 삭제 재시도를 위해 경로를 보존하고, 그동안 읽기와 메시지 연결을 차단한다.
                pendingDeletes.add(imageId);
            }
        }
    }

    private void purgeExpiredUploads() {
        Instant cutoff = clock.instant().minusSeconds(PENDING_UPLOAD_TTL_SECONDS);
        images.forEach((imageId, image) -> {
            if (!image.attached() && image.createdAt().isBefore(cutoff)) {
                delete(imageId);
            }
        });
    }

    private ImageFormat detectAndValidate(byte[] bytes) {
        ImageFormat format;
        if (startsWith(bytes, 0xFF, 0xD8, 0xFF)) {
            format = new ImageFormat("image/jpeg", ".jpg");
        } else if (startsWith(bytes, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            format = new ImageFormat("image/png", ".png");
        } else if (isWebp(bytes)) {
            format = new ImageFormat("image/webp", ".webp");
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.");
        }

        // 저장 전에 WebP를 포함한 모든 허용 형식을 실제로 디코딩한다.
        // 애니메이션 전체 프레임에도 기존 픽셀 합계 제한을 적용한다.
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않거나 해상도가 너무 큰 이미지입니다.");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, false, true);
                int frames = format.contentType().equals("image/webp") ? reader.getNumImages(true) : 1;
                if (frames < 1) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 이미지입니다.");
                }
                long decodedPixels = 0;
                for (int frame = 0; frame < frames; frame++) {
                    int width = reader.getWidth(frame);
                    int height = reader.getHeight(frame);
                    decodedPixels += (long) width * height;
                    if (width < 1 || height < 1 || decodedPixels > MAX_IMAGE_PIXELS) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않거나 해상도가 너무 큰 이미지입니다.");
                    }
                    var image = reader.read(frame);
                    if (image == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 이미지입니다.");
                    }
                    image.flush();
                }
            } finally {
                reader.dispose();
            }
        } catch (ResponseStatusException rejected) {
            throw rejected;
        } catch (IOException | RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 데이터를 읽을 수 없습니다.");
        }
        return format;
    }

    private boolean isWebp(byte[] bytes) {
        if (bytes.length < 20 || !ascii(bytes, 0, "RIFF") || !ascii(bytes, 8, "WEBP")) {
            return false;
        }
        long riffSize = Integer.toUnsignedLong(
                (bytes[4] & 0xFF) | ((bytes[5] & 0xFF) << 8) | ((bytes[6] & 0xFF) << 16) | (bytes[7] << 24));
        if (riffSize != bytes.length - 8L) return false;

        int offset = 12;
        int staticImages = 0, animationFrames = 0;
        boolean extended = false, animated = false, animationControl = false;
        long canvasWidth = 0, canvasHeight = 0;
        while (offset + 8 <= bytes.length) {
            long chunkSize = littleEndian32(bytes, offset + 4);
            if (chunkSize > bytes.length - offset - 8L) return false;
            if (ascii(bytes, offset, "VP8X")) {
                if (extended || staticImages != 0 || chunkSize != 10) return false;
                extended = true;
                animated = (bytes[offset + 8] & 2) != 0;
                // 메타데이터만으로 정상 이미지로 인정하지 않으며 디코딩 전에 캔버스 크기를 제한한다.
                canvasWidth = 1L + littleEndian24(bytes, offset + 12);
                canvasHeight = 1L + littleEndian24(bytes, offset + 15);
                if (canvasWidth * canvasHeight > MAX_IMAGE_PIXELS) return false;
            } else if (ascii(bytes, offset, "VP8 ") || ascii(bytes, offset, "VP8L")) {
                if (animated || ++staticImages > 1
                        || !validBitstreamSize(bytes, offset, chunkSize, canvasWidth, canvasHeight)) return false;
            } else if (ascii(bytes, offset, "ANIM")) {
                if (!animated || animationControl || chunkSize != 6) return false;
                animationControl = true;
            } else if (ascii(bytes, offset, "ANMF")) {
                if (!animated || !animationControl || chunkSize < 16) return false;
                int data = offset + 8;
                long frameWidth = 1L + littleEndian24(bytes, data + 6);
                long frameHeight = 1L + littleEndian24(bytes, data + 9);
                if (2L * littleEndian24(bytes, data) + frameWidth > canvasWidth
                        || 2L * littleEndian24(bytes, data + 3) + frameHeight > canvasHeight
                        || !hasSingleFrameBitstream(bytes, data + 16, data + (int) chunkSize, frameWidth, frameHeight)) return false;
                animationFrames++;
            }
            offset += 8 + (int) chunkSize + ((chunkSize & 1) == 1 ? 1 : 0);
        }
        return offset == bytes.length && (animated
                ? animationControl && animationFrames > 0 && staticImages == 0
                : staticImages == 1 && animationFrames == 0);
    }

    private boolean hasSingleFrameBitstream(byte[] bytes, int offset, int end, long width, long height) {
        int images = 0;
        while (offset + 8 <= end) {
            long size = littleEndian32(bytes, offset + 4);
            if (size > end - offset - 8L) return false;
            if (ascii(bytes, offset, "VP8 ") || ascii(bytes, offset, "VP8L")) {
                if (++images > 1 || !validBitstreamSize(bytes, offset, size, width, height)) return false;
            }
            offset += 8 + (int) size + (int) (size & 1);
        }
        return offset == end && images == 1;
    }

    // 작은 VP8X/ANMF 영역 정보로 큰 이미지 할당을 숨기지 못하도록
    // 디코더 진입 전에 VP8/VP8L 압축 데이터 자체의 크기를 검사한다.
    private boolean validBitstreamSize(byte[] bytes, int chunk, long size, long expectedWidth, long expectedHeight) {
        int data = chunk + 8;
        long width, height;
        if (ascii(bytes, chunk, "VP8 ")) {
            if (size < 10 || (bytes[data] & 1) != 0
                    || !startsAt(bytes, data + 3, 0x9d, 0x01, 0x2a)) return false;
            width = ((bytes[data + 6] & 0xff) | ((bytes[data + 7] & 0xff) << 8)) & 0x3fff;
            height = ((bytes[data + 8] & 0xff) | ((bytes[data + 9] & 0xff) << 8)) & 0x3fff;
        } else {
            if (size < 5 || (bytes[data] & 0xff) != 0x2f) return false;
            long bits = littleEndian32(bytes, data + 1);
            if ((bits >>> 29) != 0) return false;
            width = 1 + (bits & 0x3fff);
            height = 1 + ((bits >>> 14) & 0x3fff);
        }
        return width > 0 && height > 0 && width * height <= MAX_IMAGE_PIXELS
                && (expectedWidth == 0 || (width == expectedWidth && height == expectedHeight));
    }

    private boolean startsAt(byte[] bytes, int offset, int... signature) {
        if (offset < 0 || bytes.length - offset < signature.length) return false;
        for (int i = 0; i < signature.length; i++) if ((bytes[offset + i] & 0xff) != signature[i]) return false;
        return true;
    }

    private long littleEndian32(byte[] bytes, int offset) {
        return Integer.toUnsignedLong((bytes[offset] & 0xff) | ((bytes[offset + 1] & 0xff) << 8)
                | ((bytes[offset + 2] & 0xff) << 16) | (bytes[offset + 3] << 24));
    }

    private int littleEndian24(byte[] bytes, int offset) {
        return (bytes[offset] & 0xff) | ((bytes[offset + 1] & 0xff) << 8) | ((bytes[offset + 2] & 0xff) << 16);
    }

    private boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) return false;
        for (int index = 0; index < signature.length; index++) {
            if ((bytes[index] & 0xFF) != signature[index]) return false;
        }
        return true;
    }

    private boolean ascii(byte[] bytes, int offset, String value) {
        if (bytes.length < offset + value.length()) return false;
        for (int index = 0; index < value.length(); index++) {
            if (bytes[offset + index] != value.charAt(index)) return false;
        }
        return true;
    }

    private Path resolve(String imageId, String extension) {
        Path path = imageDirectory.resolve(imageId + extension).normalize();
        if (!path.startsWith(imageDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바르지 않은 이미지 식별자입니다.");
        }
        return path;
    }

    private boolean deleteFileQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
            return true;
        } catch (IOException exception) {
            log.warn("채팅 이미지 파일 정리에 실패했습니다.");
            return false;
        }
    }

    private record ImageFormat(String contentType, String extension) { }
    private record StoredImage(Long ownerId, Path path, String contentType, Instant createdAt, boolean attached) {
        private StoredImage withAttached(boolean value) {
            return new StoredImage(ownerId, path, contentType, createdAt, value);
        }
    }

    public record ImageContent(byte[] bytes, String contentType) { }
}
