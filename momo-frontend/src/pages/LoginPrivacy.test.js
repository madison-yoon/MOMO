jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn(), Link: ({ children }) => require("react").createElement("a", null, children) }));
jest.mock("../api/AxiosApi", () => ({ __esModule: true, default: { memberLogin: jest.fn() }, storeLoginTokens: jest.fn() }));
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Login from "./Login";
jest.mock("../components/redesign/ArchiveAuthFrame", () => ({ children }) => children);
import AxiosApi from "../api/AxiosApi";
test("login failure preserves user message while omitting request secrets from logs", async () => {
 const log = jest.spyOn(console, "error").mockImplementation(() => {});
 const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
 AxiosApi.memberLogin.mockRejectedValue({ code: "ERR_BAD_REQUEST", response: { status: 400, data: { message: "로그인 실패 안내" } }, config: { headers: { Authorization: "private-token" }, data: "private-password" } });
 try {
  render(React.createElement(Login));
  fireEvent.change(screen.getByPlaceholderText("아이디를 입력해 주세요."), { target: { value: "member" } });
  fireEvent.change(screen.getByPlaceholderText("비밀번호를 입력해 주세요."), { target: { value: "private-password" } });
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /^로그인/ })); });
  expect(alert).toHaveBeenCalledWith("로그인 실패 안내");
  expect(JSON.stringify(log.mock.calls)).not.toContain("private-token");
  expect(JSON.stringify(log.mock.calls)).not.toContain("private-password");
 } finally { log.mockRestore(); alert.mockRestore(); }
});
