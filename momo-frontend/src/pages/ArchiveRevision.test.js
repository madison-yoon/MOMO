import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MovieDetail from "./MovieDetail";
import AllReviews from "./AllReviews";
import ProfileEdit from "./ProfileEdit";
import SignUp from "./SignUp";
import ReviewDetail from "./ReviewDetail";
import Profile from "./Profile";
import MyReviews from "./MyReviews";
import LikedReviews from "./LikedReviews";
import ProfileDelete from "./ProfileDelete";
import { archivePageForPath } from "../styles/redesign/ArchivePages.styles";
import { within, waitFor } from "@testing-library/react";
import AxiosApi from "../api/AxiosApi";
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate, useParams: () => ({ id: "20260001", reviewId: "1" }), Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a> }));
jest.mock("../components/redesign/ArchiveAuthFrame", () => ({ children }) => children);
jest.mock("../components/ProfileAvatar", () => () => <span>프로필 이미지</span>);
jest.mock("../components/common/FavoriteStar", () => () => <button aria-label="관심 영화 추가" />);
jest.mock("../api/AxiosApi", () => ({ getAuthSessionVersion: () => 1, isAuthSessionCurrent: () => true, movieDetailByIdentifier: jest.fn(), movieDetail: jest.fn(), moviePoster: jest.fn(), moviePeople: jest.fn(), movieReviews: jest.fn(), movieRating: jest.fn(), memberMe: jest.fn(), reviewCreate: jest.fn(), allReviews: jest.fn(), reviewSummaries: jest.fn(), moviePostersEnsure: jest.fn(), moviePosterStatuses: jest.fn(), memberIdExist: jest.fn(), memberSignup: jest.fn(), reviewDetail: jest.fn(), reviewComments: jest.fn(), reviewReactionCounts: jest.fn(), reviewMyReactionGet: jest.fn(), reviewUpdate: jest.fn(), reviewDelete: jest.fn(), myReviews: jest.fn(), myLikedReviews: jest.fn(), memberDelete: jest.fn() }));
jest.mock("../utils/favorites", () => ({ getFavoriteMovies: () => [], getCurrentFavoriteUserId: () => "sample-id" }));
beforeEach(() => {
  jest.clearAllMocks(); localStorage.clear();
  const movie = { movieCode: "20260001", title: "검증 영화", titleEn: "Test", releaseDate: "20260101", genre: "드라마", actors: [], director: "감독" };
  AxiosApi.movieDetailByIdentifier.mockResolvedValue({ data: movie }); AxiosApi.movieDetail.mockResolvedValue({ data: movie });
  AxiosApi.moviePoster.mockResolvedValue({ data: { posterUrl: "/posters/test.jpg" } }); AxiosApi.moviePeople.mockResolvedValue({ data: [] });
  AxiosApi.movieReviews.mockResolvedValue({ data: { content: [] } }); AxiosApi.movieRating.mockResolvedValue({ data: { likeCount: 1, dislikeCount: 0, totalCount: 1, myRating: null } });
  AxiosApi.memberMe.mockResolvedValue({ data: { userId: 1, loginId: "sample-id", nickname: "회원표본", email: "sample@example.test", profileImage: "" } });
  AxiosApi.allReviews.mockResolvedValue({ data: { content: [{ reviewId: 1, movieCode: movie.movieCode, movieTitle: movie.title, title: "검증 리뷰", nickname: "작성자", createdAt: "2026-11-18T10:00:00" }], totalPages: 2 } });
  AxiosApi.reviewSummaries.mockResolvedValue({ data: [{ reviewId: 1, likeCount: 2, dislikeCount: 1, commentCount: 3 }] });
  AxiosApi.moviePostersEnsure.mockResolvedValue({ data: [{ movieCode: movie.movieCode, status: "SUCCESS", posterUrl: "/posters/test.jpg" }] });
  AxiosApi.moviePosterStatuses.mockResolvedValue({ data: [] });
  AxiosApi.reviewDetail.mockResolvedValue({ data: { reviewId: 1, userId: 2, movieCode: movie.movieCode, title: "권한 확인 리뷰", content: "원래 리뷰 본문", nickname: "다른 작성자", createdAt: "2026-11-18T10:00:00" } });
  AxiosApi.myReviews.mockResolvedValue({ data: { content: [], totalElements: 3 } }); AxiosApi.myLikedReviews.mockResolvedValue({ data: { content: [], totalElements: 4 } });
  AxiosApi.reviewComments.mockResolvedValue({ data: { content: [], totalElements: 0 } });
  AxiosApi.reviewReactionCounts.mockResolvedValue({ data: { likeCount: 2, dislikeCount: 0 } }); AxiosApi.reviewMyReactionGet.mockResolvedValue({ data: null });
});

// 사용자 검토에서 확정한 배치와 입력 유지 규칙을 서버 쓰기 없이 검증한다.
test("프로필 카드에서 닉네임은 한 번만 표시하고 아이디·이메일을 구분한다", async () => {
 render(<Profile />);
 expect(await screen.findByText("sample@example.test")).toBeInTheDocument();
 expect(screen.getAllByText("회원표본")).toHaveLength(1);
 expect(screen.getByText("sample-id")).toBeInTheDocument();
 for(const path of ["/profile/reviews","/profile/liked-reviews","/profile/favorites","/profile/delete"])expect(screen.getByRole("link",{name: path.endsWith('delete')?'회원 탈퇴':path.endsWith('favorites')?/관심 영화 보기/:path.endsWith('liked-reviews')?/좋아요한 리뷰 보기/:/작성한 리뷰 보기/})).toHaveAttribute('href',path);
});
test("활동·탈퇴 기존 경로에도 현재 디자인을 적용한다", () => {
 for(const path of ["/profile/reviews","/profile/liked-reviews","/profile/favorites","/profile/delete"])expect(archivePageForPath(path)).not.toBeNull();
 expect(archivePageForPath('/')).toBeNull();expect(archivePageForPath('/person/actor/1')).toBeNull();
});
test("글쓴이 배지는 로그인 회원이 아닌 리뷰 원작성자 ID로 판별한다", async () => {
 AxiosApi.memberMe.mockResolvedValue({data:{userId:3}});
 AxiosApi.reviewDetail.mockResolvedValue({data:{reviewId:1,userId:2,title:'원글',content:'본문',nickname:'원작성자'}});
 AxiosApi.reviewComments.mockResolvedValue({data:{content:[{commentId:1,userId:'2',nickname:'원작성자',content:'작성자 댓글'},{commentId:2,userId:3,nickname:'로그인 회원',content:'일반 댓글'}],totalElements:2}});
 render(<ReviewDetail />);
 const comment=await screen.findByText('작성자 댓글');
 expect(within(comment.closest('article')).getByText('글쓴이')).toBeInTheDocument();
 expect(within(screen.getByText('일반 댓글').closest('article')).queryByText('글쓴이')).not.toBeInTheDocument();
});
test("작성자 ID가 없으면 잘못된 글쓴이 배지를 표시하지 않는다", async () => {
 AxiosApi.reviewDetail.mockResolvedValue({data:{reviewId:1,title:'원글',content:'본문'}});
 AxiosApi.reviewComments.mockResolvedValue({data:{content:[{commentId:1,nickname:'익명',content:'ID 없는 댓글'}],totalElements:1}});
 render(<ReviewDetail />);await screen.findByText('ID 없는 댓글');expect(screen.queryByText('글쓴이')).not.toBeInTheDocument();
});
test("리뷰 본문을 읽은 다음 반응 영역이 나온다", async () => {
 render(<ReviewDetail />);
 const body=await screen.findByText('원래 리뷰 본문');const reaction=screen.getByRole('button',{name:/^좋아요/});
 expect(body.compareDocumentPosition(reaction)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
test("본인 리뷰 수정·삭제는 작성자 정보와 같은 행에 포함한다", async () => {
 AxiosApi.reviewDetail.mockResolvedValue({data:{reviewId:1,userId:1,title:'내 리뷰',content:'내용',nickname:'회원표본'}});
 render(<ReviewDetail />);const edit=await screen.findByRole('button',{name:'수정',exact:true});
 expect(edit.closest('.review-detail-byline')).not.toBeNull();
 expect(within(edit.closest('.review-detail-byline')).getByText('회원표본')).toBeInTheDocument();
});
test("A+ 메모는 반복 클릭으로 접히지 않고 입력을 유지한다", async () => {
 render(<MovieDetail />);const toggle=await screen.findByRole('button',{name:/영화 메모 작성하기/});
 fireEvent.click(toggle);fireEvent.change(screen.getByLabelText('메모 제목'),{target:{value:'유지할 초안'}});fireEvent.click(toggle);
 expect(screen.getByLabelText('메모 제목')).toHaveValue('유지할 초안');
 expect(screen.queryByRole('button',{name:'취소',exact:true})).not.toBeInTheDocument();
});
test("메모 등록 성공 시에만 축소하고 새 리뷰의 상세 링크를 제공한다", async () => {
 AxiosApi.reviewCreate.mockResolvedValue({data:{reviewId:9,title:'등록할 제목',content:'등록할 본문',nickname:'회원표본'}});
 render(<MovieDetail />);fireEvent.click(await screen.findByRole('button',{name:/영화 메모 작성하기/}));
 fireEvent.change(screen.getByLabelText('메모 제목'),{target:{value:'등록할 제목'}});fireEvent.change(screen.getByLabelText('영화 메모'),{target:{value:'등록할 본문'}});
 fireEvent.click(screen.getByRole('button',{name:/기록하기/}));
 await waitFor(()=>expect(screen.queryByLabelText('메모 제목')).not.toBeInTheDocument());
 expect(screen.getByRole('link',{name:'등록할 제목'})).toHaveAttribute('href','/reviews/9');
 expect(AxiosApi.reviewCreate).toHaveBeenCalledWith('20260001','등록할 제목','등록할 본문');
});
test("리뷰 없는 영화는 첫 기록 안내와 입력 진입을 제공한다", async () => {
 render(<MovieDetail />);await screen.findByRole('heading',{name:'검증 영화'});
 expect(await screen.findByRole('img',{name:'메모 없음'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'첫 메모 남기기'}));expect(screen.getByLabelText('메모 제목')).toBeInTheDocument();
 expect(AxiosApi.reviewCreate).not.toHaveBeenCalled();
});
test("활동 목록은 기존 로그인 회원별 API와 상세 링크를 사용한다", async () => {
 AxiosApi.myReviews.mockResolvedValue({data:{content:[{reviewId:1,title:'내 작성 리뷰',content:'본문'}],totalPages:1}});
 const {unmount}=render(<MyReviews />);expect(await screen.findByRole('link',{name:/내 작성 리뷰/})).toHaveAttribute('href','/reviews/1');expect(AxiosApi.myReviews).toHaveBeenCalled();unmount();
 AxiosApi.myLikedReviews.mockResolvedValue({data:{content:[{reviewId:2,title:'내가 좋아요한 글',content:'다른 작성자의 글',nickname:'다른 회원'}],totalElements:1,totalPages:1}});
 render(<LikedReviews />);expect(await screen.findByRole('link',{name:'내가 좋아요한 글'})).toHaveAttribute('href','/reviews/2');expect(AxiosApi.myLikedReviews).toHaveBeenCalled();
});
test("탈퇴 안내와 취소는 서버 탈퇴를 호출하지 않는다", async () => {
 render(<ProfileDelete />);expect(screen.getByRole('button',{name:'회원 탈퇴',exact:true})).toBeDisabled();expect(await screen.findByLabelText('현재 비밀번호')).toHaveAttribute('type','password');
 fireEvent.click(screen.getByRole('button',{name:'취소',exact:true}));expect(mockNavigate).toHaveBeenCalledWith('/profile');expect(AxiosApi.memberDelete).not.toHaveBeenCalled();
});

test("등록 실패 시 메모 입력과 확장 상태를 보존한다", async () => {
 const log=jest.spyOn(console,'error').mockImplementation(()=>{});
 try {
  AxiosApi.reviewCreate.mockRejectedValue({response:{status:409}});
  render(<MovieDetail />);fireEvent.click(await screen.findByRole('button',{name:/영화 메모 작성하기/}));
  fireEvent.change(screen.getByLabelText('메모 제목'),{target:{value:'실패해도 유지'}});fireEvent.change(screen.getByLabelText('영화 메모'),{target:{value:'작성한 본문'}});
  fireEvent.click(screen.getByRole('button',{name:/기록하기/}));await screen.findByText('이미 해당 영화에 리뷰를 작성했습니다.');
  expect(screen.getByLabelText('메모 제목')).toHaveValue('실패해도 유지');expect(screen.getByLabelText('영화 메모')).toHaveValue('작성한 본문');
 } finally {log.mockRestore();}
});

test("서버 이메일이 없으면 다른 계정일 수 있는 공용 로컬 이메일을 표시하지 않는다", async () => {
 localStorage.setItem('email','another-account@example.test');
 AxiosApi.memberMe.mockResolvedValue({data:{userId:1,loginId:'sample-id',nickname:'회원표본'}});
 render(<Profile />);await screen.findByText('sample-id');
 expect(screen.queryByText('another-account@example.test')).not.toBeInTheDocument();expect(screen.getByText('이메일 조회 정보 없음')).toBeInTheDocument();
});
test("빈 메모 진입 버튼은 새 입력창으로 포커스를 이동한다", async () => {
 render(<MovieDetail />);const first=await screen.findByRole('button',{name:'첫 메모 남기기'});fireEvent.click(first);
 expect(screen.getByLabelText('메모 제목')).toHaveFocus();
});

test("소셜 프로필은 공급자 이메일이 없으면 미등록으로 표시한다", async () => {
 AxiosApi.memberMe.mockResolvedValue({data:{userId:1,loginId:"social-member",nickname:"소셜회원",email:null,provider:"GOOGLE"}});
 render(<Profile/>);expect(await screen.findByText("소셜회원")).toBeInTheDocument();expect(screen.getByText("미등록")).toBeInTheDocument();
});
