package com.momo.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.nio.file.Files;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import static org.junit.jupiter.api.Assertions.*;

class ChatWebpValidationTest {
    @TempDir Path directory;

    @Test void rejectsContainerWithNoImageBitstream() {
        assertRejected(chunkFile("VP8X", canvas(1,1)));
    }

    @Test void rejectsHugeCanvasBeforeAllocatingPixels() {
        assertRejected(chunkFile("VP8X", canvas(10_000,10_000)));
    }

    @Test void rejectsCorruptedImagePayloadEvenWhenChunkSizesAreCorrect() {
        assertRejected(chunkFile("VP8 ",new byte[10]));
    }

    @Test void decodesNormalLossyAndLosslessWebpDespiteMisleadingFileNameAndMime() throws Exception {
        var service=new ChatImageStorageService(directory.toString());
        for(String fixture:new String[]{"small_1x1.webp","blue_tile.webp","lossless.transparent.webp","2_webp_ll.webp"}) {
            byte[] data=fixture(fixture);
            String id=service.store(new MockMultipartFile("file","renamed.png","image/png",data),1L);
            service.attachToMessage(id,1L);
            assertEquals("image/webp",service.read(id).contentType());
            assertArrayEquals(data,service.read(id).bytes());
            assertTrue(Files.exists(directory.resolve(id+".webp")));
        }
    }

    @Test void pngWithWebpExtensionIsStillServedAsPng() throws Exception {
        var encoded=new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(1,1,BufferedImage.TYPE_INT_RGB),"png",encoded);
        var service=new ChatImageStorageService(directory.toString());
        String id=service.store(new MockMultipartFile("file","renamed.webp","image/webp",encoded.toByteArray()),1L);
        service.attachToMessage(id,1L);
        assertEquals("image/png",service.read(id).contentType());
    }

    @Test void rejectsTruncatedRealBitstreamWithRepairedContainerLengths() throws Exception {
        byte[] image=firstImageChunk(fixture("small_1x1.webp"));
        assertRejected(chunkFile("VP8 ",Arrays.copyOfRange(image,8,18)));
    }

    @Test void decodesAllFramesOfNormalAnimationAndRejectsDamagedLaterFrame() throws Exception {
        byte[] frame=firstImageChunk(fixture("small_1x1.webp"));
        byte[] valid=animation(frame,frame);
        var service=new ChatImageStorageService(directory.toString());
        String id=service.store(new MockMultipartFile("file","animation.webp","image/webp",valid),1L);
        service.attachToMessage(id,1L);
        assertEquals("image/webp",service.read(id).contentType());
        // 정상 프레임 헤더를 유지해 뒤쪽 압축 데이터를 디코딩해야 손상을 발견하도록 구성한다.
        byte[] broken=chunk("VP8 ",Arrays.copyOfRange(frame,8,18));
        assertRejected(animation(frame,broken));
    }

    @Test void rejectsDamagedRiffLengthAndHugeCanvasEvenWithARealBitstream() throws Exception {
        byte[] image=fixture("small_1x1.webp");
        image[4]++;
        assertRejected(image);
        assertRejected(riff(chunk("VP8X",canvas(10_000,10_000)),firstImageChunk(fixture("small_1x1.webp"))));
    }

    @Test void rejectsOversizedSimpleLossyAndLosslessHeadersWithoutAllocatingTheirImages() throws Exception {
        for(String name:new String[]{"small_1x1.webp","2_webp_ll.webp"}) {
            byte[] image=firstImageChunk(fixture(name));
            String type=new String(image,0,4,StandardCharsets.US_ASCII);
            byte[] payload=Arrays.copyOfRange(image,8,8+ByteBuffer.wrap(image,4,4).order(ByteOrder.LITTLE_ENDIAN).getInt());
            if(type.equals("VP8 ")) {
                ByteBuffer.wrap(payload).order(ByteOrder.LITTLE_ENDIAN).putShort(6,(short)10_000).putShort(8,(short)10_000);
            } else {
                int flags=ByteBuffer.wrap(payload,1,4).order(ByteOrder.LITTLE_ENDIAN).getInt()&0xf0000000;
                ByteBuffer.wrap(payload).order(ByteOrder.LITTLE_ENDIAN).putInt(1,flags|9_999|(9_999<<14));
            }
            assertRejected(chunkFile(type,payload));
        }
    }

    @Test void rejectsAnimationWhoseTotalDecodedPixelsExceedTheExistingBudget() throws Exception {
        byte[] bitstream=firstImageChunk(fixture("blue_tile.webp"));
        byte[] extended=canvas(256,256);extended[0]=2;
        var chunks=new ByteArrayOutputStream();chunks.write(chunk("VP8X",extended));chunks.write(chunk("ANIM",new byte[6]));
        for(int i=0;i<306;i++) {
            byte[] header=new byte[16];header[6]=(byte)255;header[9]=(byte)255;header[12]=100;
            var frame=new ByteArrayOutputStream();frame.write(header);frame.write(bitstream);
            chunks.write(chunk("ANMF",frame.toByteArray()));
        }
        assertRejected(riff(chunks.toByteArray()));
    }

    @Test void rejectsSmallCanvasWhoseActualBitstreamDimensionsDisagree() throws Exception {
        assertRejected(riff(chunk("VP8X",canvas(1,1)),firstImageChunk(fixture("blue_tile.webp"))));
    }

    @Test void rejectsAnimationWithSmallFrameMetadataHidingAnOversizedBitstream() throws Exception {
        byte[] image=firstImageChunk(fixture("small_1x1.webp"));
        ByteBuffer.wrap(image).order(ByteOrder.LITTLE_ENDIAN).putShort(14,(short)10_000).putShort(16,(short)10_000);
        assertRejected(animation(image));
    }

    byte[] fixture(String name) throws Exception {
        try(var in=getClass().getResourceAsStream("/chat-webp/"+name)) {
            assertNotNull(in);return in.readAllBytes();
        }
    }

    static byte[] firstImageChunk(byte[] file) {
        for(int i=12;i+8<=file.length;) {
            String type=new String(file,i,4,StandardCharsets.US_ASCII);
            int size=ByteBuffer.wrap(file,i+4,4).order(ByteOrder.LITTLE_ENDIAN).getInt();
            int end=i+8+size+(size&1);
            if(type.equals("VP8 ")||type.equals("VP8L"))return Arrays.copyOfRange(file,i,end);
            i=end;
        }
        throw new AssertionError("No fixture bitstream");
    }

    static byte[] animation(byte[]... images) throws Exception {
        byte[] extended=canvas(1,1);extended[0]=2;
        var chunks=new ByteArrayOutputStream();
        chunks.write(chunk("VP8X",extended));chunks.write(chunk("ANIM",new byte[6]));
        for(byte[] image:images){var frame=new ByteArrayOutputStream();byte[] header=new byte[16];header[12]=100;frame.write(header);frame.write(image);chunks.write(chunk("ANMF",frame.toByteArray()));}
        return riff(chunks.toByteArray());
    }

    static byte[] chunk(String type,byte[] data) {
        return Arrays.copyOfRange(chunkFile(type,data),12,20+data.length+(data.length&1));
    }

    static byte[] riff(byte[]... chunks) throws Exception {
        var body=new ByteArrayOutputStream();for(byte[] c:chunks)body.write(c);
        byte[] data=body.toByteArray();
        var out=ByteBuffer.allocate(12+data.length).order(ByteOrder.LITTLE_ENDIAN);
        out.put("RIFF".getBytes(StandardCharsets.US_ASCII)).putInt(out.capacity()-8)
                .put("WEBP".getBytes(StandardCharsets.US_ASCII)).put(data);
        return out.array();
    }

    void assertRejected(byte[] data) {
        var service=new ChatImageStorageService(directory.toString());
        long before=fileCount();
        ResponseStatusException error=assertThrows(ResponseStatusException.class,()->service.store(
                new MockMultipartFile("file","spoof.png","image/png",data),1L));
        assertEquals(400,error.getStatusCode().value());
        assertEquals(before,fileCount(),"Rejected input must not leave a stored/partial file");
    }

    long fileCount() {
        try(var files=Files.list(directory)){return files.count();}
        catch(java.io.IOException error){throw new AssertionError(error);}
    }

    static byte[] chunkFile(String type,byte[] data) {
        var out=ByteBuffer.allocate(20+data.length+(data.length&1)).order(ByteOrder.LITTLE_ENDIAN);
        out.put("RIFF".getBytes(StandardCharsets.US_ASCII)).putInt(out.capacity()-8)
                .put("WEBP".getBytes(StandardCharsets.US_ASCII))
                .put(type.getBytes(StandardCharsets.US_ASCII)).putInt(data.length).put(data);
        return out.array();
    }

    static byte[] canvas(int width,int height) {
        byte[] result=new byte[10];
        for(int i=0;i<3;i++){result[4+i]=(byte)((width-1) >>> (8*i));result[7+i]=(byte)((height-1) >>> (8*i));}
        return result;
    }
}
