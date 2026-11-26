package com.momo.backend.controller;
import com.momo.backend.service.CommentService;
import com.momo.backend.exception.CustomException;
import com.momo.backend.exception.GlobalExceptionHandler;
import com.momo.backend.security.MemberPrincipal;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
class CommentForbiddenHttpTest {
 @Test void forbiddenUpdateAndDeleteReturn403() throws Exception {
  var service = mock(CommentService.class);
  when(service.updateComment(eq(27L), eq(9L), any())).thenThrow(new CustomException("FORBIDDEN", "권한이 없습니다."));
  doThrow(new CustomException("FORBIDDEN", "권한이 없습니다.")).when(service).deleteComment(27L, 9L);
  var mvc = MockMvcBuilders.standaloneSetup(new CommentController(service)).setControllerAdvice(new GlobalExceptionHandler()).build();
  var auth = new UsernamePasswordAuthenticationToken(new MemberPrincipal(9L), null, java.util.List.of());
  mvc.perform(put("/api/comments/27").principal(auth).contentType("application/json").content("{\"content\":\"changed\"}"))
    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("FORBIDDEN"));
  mvc.perform(delete("/api/comments/27").principal(auth)).andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("FORBIDDEN"));
 }
}
