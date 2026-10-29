import axios from "axios";

const HM_DOMAIN = "http://localhost:8111";

const AxiosApi = {
  // 로그인 아이디 중복 확인
  memberIdExist: async (loginId) => {
    return await axios.get(
      `${HM_DOMAIN}/api/auth/exists/id/${encodeURIComponent(loginId)}`,
    );
  },

  // 회원가입
  memberSignup: async (loginId, password, nickname, email) => {
    return await axios.post(`${HM_DOMAIN}/api/auth/signup`, {
      loginId,
      password,
      nickname,
      email,
    });
  },

  // 로그인
  memberLogin: async (loginId, password) => {
    return await axios.post(`${HM_DOMAIN}/api/auth/login`, {
      loginId,
      password,
    });
  },
};

export default AxiosApi;
