jest.mock("axios", () => jest.requireActual("axios/dist/node/axios.cjs"));
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/" }),
  Link: ({ children }) => require("react").createElement("a", null, children),
  NavLink: ({ children }) => require("react").createElement("a", null, children),
  Outlet: () => null,
}));
jest.mock("../api/AxiosApi", () => {
  const actual = jest.requireActual("../api/AxiosApi");
  return { ...actual, __esModule: true, default: { memberMe: jest.fn(), memberLogout: jest.fn(), memberDelete: jest.fn() } };
});
jest.mock("../utils/favorites", () => ({ getCurrentFavoriteUserId: () => null, syncFavoriteMoviesFromServer: jest.fn() }));
jest.mock("../components/chat/ChatPopup", () => () => null);
jest.mock("../components/common/MovieSearchAutocomplete", () => () => null);
// 세션 격리 검증은 실제 핸들러를 사용하되 JSDOM이 해석하지 못하는 테마 선택자와 분리한다.
jest.mock("../styles/legacy/Layout.styles", () => {
  const React = require("react");
  const names = ["Container", "Header", "Logo", "LogoImage", "Navigation", "UserArea", "ActionButton", "Main", "Footer", "FooterContainer", "FooterLeft", "FooterLogo", "FooterDesc", "FooterRight", "FooterColumn", "FooterBottom"];
  return Object.fromEntries(names.map((name) => [name, ({ children, onClick, disabled }) =>
    React.createElement(name === "ActionButton" ? "button" : "div", { onClick, disabled }, children)]));
});

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Layout from "./Layout";
import ProfileDelete from "./ProfileDelete";
import AxiosApi, { storeLoginTokens } from "../api/AxiosApi";

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
beforeEach(() => {
  jest.clearAllMocks(); localStorage.clear();
  localStorage.setItem("nickname", "A-name");
  storeLoginTokens("A-access", "A-refresh");
  AxiosApi.memberMe.mockImplementation(() => Promise.resolve({ data: { nickname: localStorage.getItem("nickname") || "A-name" } }));
  jest.spyOn(window, "alert").mockImplementation(() => {});
  jest.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => jest.restoreAllMocks());

async function begin(action, pending) {
  if (action === "logout") {
    AxiosApi.memberLogout.mockReturnValue(pending.promise);
    render(React.createElement(Layout));
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
  } else {
    AxiosApi.memberDelete.mockReturnValue(pending.promise);
    render(React.createElement(ProfileDelete));
    await screen.findByLabelText("현재 비밀번호");
    fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: "test-password" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "회원 탈퇴", exact: true }));
  }
}

describe.each(["logout", "delete"])("%s session isolation", action => {
  test.each(["success", "failure"])("late A %s cannot clear or redirect B", async result => {
    const pending = deferred();
    await begin(action, pending);
    await act(async () => {
      localStorage.setItem("nickname", "B-name");
      localStorage.setItem("username", "B-member");
      storeLoginTokens("B-access", "B-refresh");
      await Promise.resolve();
    });
    await act(async () => {
      if (result === "success") pending.resolve({ status: 200 });
      else pending.reject({ response: { status: 500 } });
      await Promise.resolve();
    });
    expect(localStorage.getItem("accessToken")).toBe("B-access");
    expect(localStorage.getItem("refreshToken")).toBe("B-refresh");
    expect(localStorage.getItem("nickname")).toBe("B-name");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
    if (action === "logout") {
      expect(screen.getByText(/B-name/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "로그아웃" })).not.toBeDisabled();
    }
  });

  test("current session success still clears authentication and navigates", async () => {
    const pending = deferred();
    await begin(action, pending);
    await act(async () => { pending.resolve({ status: 200 }); await Promise.resolve(); });
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith(action === "logout" ? "/" : "/login", { replace: true });
  });

  test("current session failure preserves tokens and logs only status and code", async () => {
    const pending = deferred();
    const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
    await begin(action, pending);
    await act(async () => {
      pending.reject({ response: { status: 500 }, config: { headers: { Authorization: "sensitive-test-token" }, data: "sensitive-test-password" } });
      await Promise.resolve();
    });
    expect(localStorage.getItem("accessToken")).toBe("A-access");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain("sensitive-test-token");
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain("sensitive-test-password");
  });
});
