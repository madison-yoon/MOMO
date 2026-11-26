package com.momo.backend.controller;

import com.momo.backend.entity.User;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.security.TokenProvider;
import com.momo.backend.service.ChatImageStorageService;
import com.momo.backend.service.ChatMessageService;
import com.momo.backend.service.ChatRuleViolationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Path;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 실제 인증 필터·Controller를 격리 H2와 임시 이미지로 검증하며 개발 DB·클라우드는 사용하지 않는다. */
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:chat-image-authorization;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
    "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop",
    "jwt.secret=TW9tb1Rlc3RPbmx5U2VjcmV0S2V5Rm9ySlZUVGVzdHMxMjM0NQ=="
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ChatImageAuthorizationTest {
    @TempDir static Path imageDirectory;
    @DynamicPropertySource static void images(DynamicPropertyRegistry registry) {
        registry.add("momo.storage.chat-image-dir", () -> imageDirectory.toString());
    }
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired TokenProvider tokens;
    @Autowired ChatMessageService messages;
    @Autowired ChatImageStorageService images;
    @Autowired ObjectMapper mapper;

    User member() {
        String id=UUID.randomUUID().toString().replace("-", "");
        return users.saveAndFlush(new User("i"+id.substring(0,12),"test-hash","i"+id.substring(0,8),id+"@example.test"));
    }
    MockMultipartFile png() throws Exception {
        var bytes=new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(1,1,BufferedImage.TYPE_INT_RGB),"png",bytes);
        return new MockMultipartFile("file","../../client-name.exe","image/png",bytes.toByteArray());
    }

    @Test void uploadRateLimitReturnsExistingMessageContractWithoutClearingAuthentication() throws Exception {
        User owner = member();
        String token = tokens.createToken(owner.getUserId());
        for (int i = 0; i < 10; i++) {
            var result = mvc.perform(multipart("/api/chat/images").file(png())
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk()).andReturn();
            String id = mapper.readTree(result.getResponse().getContentAsString()).path("imageId").asString();
            images.delete(id);
        }
        mvc.perform(multipart("/api/chat/images").file(png()).header("Authorization", "Bearer " + token))
                .andExpect(status().isTooManyRequests())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.message")
                        .value("이미지는 60초 동안 최대 10회 업로드할 수 있습니다. 잠시 후 다시 시도해 주세요."));
    }

    @Test void unauthenticatedAndInvalidTokensCannotUploadOrReadImages() throws Exception {
        for (String token : new String[]{"", "invalid-token", tokens.createToken(Long.MAX_VALUE)}) {
            var upload=multipart("/api/chat/images").file(png());
            var read=get("/api/chat/images/unknown");
            if(!token.isEmpty()){upload.header("Authorization","Bearer "+token);read.header("Authorization","Bearer "+token);}
            mvc.perform(upload).andExpect(status().isUnauthorized());
            mvc.perform(read).andExpect(status().isUnauthorized());
        }
        try(var files=java.nio.file.Files.list(imageDirectory)){assertEquals(0,files.count());}
    }

    @Test void liveMembersCanViewSharedImagesButOnlyUploaderCanAttach() throws Exception {
        User owner=member(), observer=member();
        String ownerToken=tokens.createToken(owner.getUserId()), otherToken=tokens.createToken(observer.getUserId());
        var result=mvc.perform(multipart("/api/chat/images").file(png()).header("Authorization","Bearer "+ownerToken))
                .andExpect(status().isOk()).andReturn();
        String id=mapper.readTree(result.getResponse().getContentAsString()).path("imageId").asString();
        mvc.perform(get("/api/chat/images/"+id).header("Authorization","Bearer "+ownerToken)).andExpect(status().isNotFound());
        assertThrows(ChatRuleViolationException.class,()->messages.sendImage(observer,id));
        messages.sendImage(owner,id);
        mvc.perform(get("/api/chat/images/"+id).header("Authorization","Bearer "+otherToken))
                .andExpect(status().isOk()).andExpect(content().contentType("image/png"));
        assertThrows(ChatRuleViolationException.class,()->messages.sendImage(owner,id));
        images.delete(id);
    }

    @Test void deletedMemberOldAccessTokenCannotUploadOrReadPreviouslyAttachedImage() throws Exception {
        User member=member();
        String token=tokens.createToken(member.getUserId());
        String id=images.store(png(),member.getUserId());
        messages.sendImage(member,id);
        users.deleteById(member.getUserId());
        mvc.perform(multipart("/api/chat/images").file(png()).header("Authorization","Bearer "+token))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/chat/images/"+id).header("Authorization","Bearer "+token))
                .andExpect(status().isUnauthorized());
        images.delete(id);
    }
}
