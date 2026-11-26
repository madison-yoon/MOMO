jest.mock("axios", () => jest.requireActual("axios/dist/node/axios.cjs"));
jest.mock("../components/ProfileAvatar",()=>()=>null);
const mockNavigate=jest.fn();
jest.mock("react-router-dom",()=>({useNavigate:()=>mockNavigate}));
import React from "react";
import {render,screen,fireEvent,waitFor} from "@testing-library/react";
import AxiosApi,{storeLoginTokens} from "../api/AxiosApi";
import ProfileEdit from "./ProfileEdit";
import ProfileDelete from "./ProfileDelete";
beforeEach(()=>{jest.restoreAllMocks();jest.clearAllMocks();localStorage.clear();sessionStorage.clear();localStorage.setItem("username","member");storeLoginTokens("access","refresh");jest.spyOn(window,"alert").mockImplementation(()=>{});jest.spyOn(window,"confirm").mockReturnValue(true);});
test.each(["KAKAO","NAVER","GOOGLE"])("%s 이메일 없는 소셜 회원은 비밀번호 없이 닉네임만 수정한다",async provider=>{
 jest.spyOn(AxiosApi,"memberMe").mockResolvedValue({data:{userId:1,loginId:"member",nickname:"원래이름",email:null,provider}});
 const update=jest.spyOn(AxiosApi,"memberUpdate").mockResolvedValue({data:{}});render(<ProfileEdit/>);
 await screen.findByDisplayValue("원래이름");expect(screen.queryByLabelText("현재 비밀번호")).not.toBeInTheDocument();
 expect(screen.getByLabelText("이메일")).toHaveAttribute("readonly");expect(screen.getByLabelText("이메일")).toHaveAttribute("placeholder","미등록");
 fireEvent.change(screen.getByLabelText("닉네임"),{target:{value:"새닉네임"}});fireEvent.click(screen.getByRole("button",{name:"저장",exact:true}));
 await waitFor(()=>expect(update).toHaveBeenCalledWith({nickname:"새닉네임"}));expect(mockNavigate).toHaveBeenCalledWith("/profile",{replace:true});
});
test("소셜 탈퇴는 명시적 문구와 동의가 있어야 실행하고 카카오는 비밀번호 없이 삭제한다",async()=>{
 jest.spyOn(AxiosApi,"memberMe").mockResolvedValue({data:{provider:"KAKAO"}});
 const deletion=jest.spyOn(AxiosApi,"socialMemberDelete").mockResolvedValue({status:200});render(<ProfileDelete/>);
 const confirmation=await screen.findByLabelText("탈퇴 확인 문구");expect(screen.queryByLabelText("현재 비밀번호")).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole("checkbox"));expect(screen.getByRole("button",{name:"회원 탈퇴",exact:true})).toBeDisabled();
 fireEvent.change(confirmation,{target:{value:"MOMO 회원 탈퇴"}});fireEvent.click(screen.getByRole("button",{name:"회원 탈퇴",exact:true}));
 await waitFor(()=>expect(deletion).toHaveBeenCalledWith({agreed:true,confirmation:"MOMO 회원 탈퇴"}));expect(localStorage.getItem("accessToken")).toBeNull();
});
test("Unlink 성공 후 DB 삭제 실패 응답은 세션을 보존하고 실패 안내를 표시한다",async()=>{
 jest.spyOn(AxiosApi,"memberMe").mockResolvedValue({data:{provider:"KAKAO"}});
 jest.spyOn(AxiosApi,"socialMemberDelete").mockRejectedValue({response:{status:503,data:{message:"연결 해제 후 회원 삭제를 완료하지 못했습니다."}}});jest.spyOn(console,"error").mockImplementation(()=>{});
 render(<ProfileDelete/>);fireEvent.change(await screen.findByLabelText("탈퇴 확인 문구"),{target:{value:"MOMO 회원 탈퇴"}});fireEvent.click(screen.getByRole("checkbox"));fireEvent.click(screen.getByRole("button",{name:"회원 탈퇴",exact:true}));
 await waitFor(()=>expect(window.alert).toHaveBeenCalledWith("연결 해제 후 회원 삭제를 완료하지 못했습니다."));expect(localStorage.getItem("accessToken")).toBe("access");expect(mockNavigate).not.toHaveBeenCalled();
});

test.each(["naver","google"])("%s 탈퇴는 새 인가로 이동하고 로그인 JWT와 회원 삭제는 아직 변경하지 않는다",async provider=>{
 jest.spyOn(AxiosApi,"memberMe").mockResolvedValue({data:{provider:provider.toUpperCase()}});
 const base=provider==="naver"?"https://nid.naver.com/oauth2.0/authorize":"https://accounts.google.com/o/oauth2/v2/auth";
 const state="d".repeat(43);const authorize=jest.spyOn(AxiosApi,"socialDeleteAuthorize").mockResolvedValue({data:{authorizationUrl:base+"?state="+state,expiresIn:300}});
 const deletion=jest.spyOn(AxiosApi,"socialMemberDelete");const oldLocation=window.location;delete window.location;window.location={...oldLocation,assign:jest.fn()};
 try{
  render(<ProfileDelete/>);
  const confirmation = await screen.findByLabelText("탈퇴 확인 문구");
  const name = provider === "naver" ? "네이버" : "Google";
  expect(screen.getByText(/회원 탈퇴를 완료하려면 외부 계정 확인이 한 번 더 필요합니다/)).toBeInTheDocument();
  expect(screen.getByText(`탈퇴 버튼을 누르면 ${name} 로그인·계정 선택 화면으로 이동합니다. 현재 MOMO에 연결된 동일한 계정으로 인증해 주세요.`)).toBeInTheDocument();
  expect(screen.getByText("인증이 완료되면 외부 연결 해제와 MOMO 회원 탈퇴가 자동으로 진행됩니다.")).toBeInTheDocument();
  expect(screen.getByText(`${name} 계정 자체는 삭제되지 않습니다.`)).toBeInTheDocument();
  const button = screen.getByRole("button", {name:`${name} 계정 확인 후 탈퇴`});
  expect(button).toBeDisabled();
  fireEvent.change(confirmation,{target:{value:"MOMO 회원 탈퇴"}});
  expect(button).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox"));fireEvent.click(button);
  await waitFor(()=>expect(window.location.assign).toHaveBeenCalledWith(base+"?state="+state));expect(authorize).toHaveBeenCalledWith(provider,{agreed:true,confirmation:"MOMO 회원 탈퇴"});expect(deletion).not.toHaveBeenCalled();expect(localStorage.getItem("accessToken")).toBe("access");
  const stored=JSON.parse(sessionStorage.getItem(`momo-${provider}-delete-state`));expect(stored.state).toBe(state);expect(stored.identity).toContain("member");expect(JSON.stringify(stored)).not.toContain("refresh");
 }finally{window.location=oldLocation;}
});
test("일반 회원은 이메일 형식 검사와 기존 이메일·비밀번호 요청 필드를 유지한다",async()=>{
 jest.spyOn(AxiosApi,"memberMe").mockResolvedValue({data:{loginId:"member",nickname:"일반회원",email:"local@example.test",provider:"LOCAL"}});
 const update=jest.spyOn(AxiosApi,"memberUpdate").mockResolvedValue({data:{}});render(<ProfileEdit/>);await screen.findByDisplayValue("일반회원");
 expect(screen.getByLabelText("현재 비밀번호")).toHaveAttribute("type","password");expect(screen.getByLabelText("이메일")).not.toHaveAttribute("readonly");
 fireEvent.change(screen.getByLabelText("이메일"),{target:{value:""}});expect(screen.getByRole("button",{name:"저장",exact:true})).toBeDisabled();fireEvent.change(screen.getByLabelText("이메일"),{target:{value:"changed@example.test"}});fireEvent.click(screen.getByRole("button",{name:"저장",exact:true}));
 await waitFor(()=>expect(update).toHaveBeenCalledWith({nickname:"일반회원",email:"changed@example.test",currentPassword:null,newPassword:null}));
});
