const { test } = require("@playwright/test");

// 기존 무작위 회원 생성·탈퇴 E2E는 실제 momo_db 검증용으로 사용하지 않는다.
// 실제 DB에서는 고정 계정과 검증 레코드를 유지하는 swagger-persistent.spec.js를 실행한다.
test.skip(
  "Swagger 임시 DB 검증을 대체하고 실제 momo_db 지속형 검증은 swagger-persistent.spec.js에서 수행",
  async () => {},
);
