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
jest.mock("../api/AxiosApi", () => ({ movieDetailByIdentifier: jest.fn(), movieDetail: jest.fn(), moviePoster: jest.fn(), moviePeople: jest.fn(), movieReviews: jest.fn(), movieRating: jest.fn(), memberMe: jest.fn(), reviewCreate: jest.fn(), allReviews: jest.fn(), reviewSummaries: jest.fn(), moviePostersEnsure: jest.fn(), moviePosterStatuses: jest.fn(), memberIdExist: jest.fn(), memberSignup: jest.fn(), reviewDetail: jest.fn(), reviewComments: jest.fn(), reviewReactionCounts: jest.fn(), reviewMyReactionGet: jest.fn(), reviewUpdate: jest.fn(), reviewDelete: jest.fn(), myReviews: jest.fn(), myLikedReviews: jest.fn(), memberDelete: jest.fn() }));
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

// 실제 저장 없이 확정된 두 화면 배치와 승인된 최소 표시 기능을 검증한다.
test("D-03 다섯 영역은 기본정보·인물·반응·나의메모·리뷰 순서다", async () => {
 const {container}=render(<MovieDetail />);await screen.findByRole('heading',{name:'검증 영화'});
 expect([...container.querySelectorAll('[data-detail-region]')].map(e=>e.dataset.detailRegion)).toEqual(['basic','people','reactions','memo','reviews']);
});
test("D-03 기본정보에는 감독·출연·줄거리와 기존 관심 버튼을 모은다", async () => {
 AxiosApi.movieDetailByIdentifier.mockResolvedValue({data:{movieCode:'20260001',title:'기본 정보 영화',director:'테스트 감독',actors:'테스트 배우',overview:'원본 줄거리'}});
 const {container}=render(<MovieDetail />);await screen.findByRole('heading',{name:'기본 정보 영화'});
 const basic=container.querySelector('[data-detail-region="basic"]');expect(basic).not.toBeNull();
 expect(within(basic).getByText('테스트 감독')).toBeInTheDocument();expect(within(basic).getByText('테스트 배우')).toBeInTheDocument();
 expect(within(basic).getByText('원본 줄거리')).toBeInTheDocument();expect(within(basic).getByRole('button',{name:'관심 영화 추가'})).toBeInTheDocument();
});
test("줄거리 더보기·접기는 기존 원문을 변경하지 않는다", async () => {
 const overview='기존 줄거리 원문을 유지합니다. '.repeat(50);
 AxiosApi.movieDetailByIdentifier.mockResolvedValue({data:{movieCode:'20260001',title:'줄거리 영화',overview}});
 render(<MovieDetail />);const more=await screen.findByRole('button',{name:'더보기',exact:true});expect(more).toHaveAttribute('aria-expanded','false');
 fireEvent.click(more);expect(screen.getByRole('button',{name:'접기',exact:true})).toHaveAttribute('aria-expanded','true');expect(document.getElementById('movie-overview').textContent).toBe(overview);
 fireEvent.click(screen.getByRole('button',{name:'접기',exact:true}));expect(screen.getByRole('button',{name:'더보기',exact:true})).toHaveAttribute('aria-expanded','false');expect(document.getElementById('movie-overview').textContent).toBe(overview);
});
test("공유는 현재 상세 URL만 복사하고 성공을 알린다", async () => {
 const writeText=jest.fn().mockResolvedValue();Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}});window.history.replaceState({},'', '/movie/20260001');
 render(<MovieDetail />);fireEvent.click(await screen.findByRole('button',{name:'공유',exact:true}));
 expect(await screen.findByRole('status')).toHaveTextContent('영화 주소를 복사했습니다.');expect(writeText).toHaveBeenCalledWith(window.location.href);expect(AxiosApi.reviewCreate).not.toHaveBeenCalled();
});
test("공유 복사가 거절되면 실패를 안내한다", async () => {
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:jest.fn().mockRejectedValue(new Error('denied'))}});
 render(<MovieDetail />);fireEvent.click(await screen.findByRole('button',{name:'공유',exact:true}));expect(await screen.findByRole('status')).toHaveTextContent('주소를 복사하지 못했습니다.');
});
test("M-04 카드의 별도 정보 행과 안전한 이메일 대체를 유지한다", async () => {
 AxiosApi.memberMe.mockResolvedValue({data:{userId:1,loginId:'sample-id',nickname:'회원표본'}});
 const {container}=render(<Profile />);await screen.findByText('sample-id');expect(screen.getAllByText('회원표본')).toHaveLength(1);
 const card=container.querySelector('.compact-profile-card');expect(card).not.toBeNull();expect(within(card).getByRole('link',{name:'프로필 수정'})).toHaveAttribute('href','/profile/edit');
 expect(within(card).getByText('이메일 조회 정보 없음')).toBeInTheDocument();expect(card.querySelectorAll('.compact-profile-fields > div')).toHaveLength(2);
});
