const SAFE_CODES = new Set([
  "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_NETWORK", "ERR_CANCELED", "ECONNABORTED", "ETIMEDOUT",
  "MOMO_AUTH_SESSION_CHANGED", "MOMO_REFRESH_TOKEN_MISSING", "MOMO_INVALID_REFRESH_RESPONSE",
]);

// 민감정보 노출을 막기 위해 메시지·설정·헤더·본문·응답 데이터와 임의 오류 코드는 제외한다.
export const safeRequestFailure = (error) => ({
  status: Number.isInteger(error?.response?.status) && error.response.status >= 100 && error.response.status <= 599
    ? error.response.status : null,
  code: SAFE_CODES.has(error?.code) ? error.code : null,
});
