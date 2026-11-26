import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";
import {
  Section, SectionHeading, HomeState, ReviewsGrid, ReviewPreview,
  ReviewMovie, ReviewAuthor, ReviewReactions, SectionLink,
} from "../../styles/redesign/Home.styles";

// 메인에서는 기존 전체 리뷰 API의 최신 3건만 보여주며 작성·반응 API는 호출하지 않는다.
export default function RecentReviews() {
  const [reviews, setReviews] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadReviews = async () => {
      try {
        const response = await AxiosApi.allReviews(0, controller.signal);
        if (controller.signal.aborted) return;
        const list = (Array.isArray(response.data?.content) ? response.data.content : []).slice(0, 3);
        listLoaded = true;
        setReviews(list);
        setLoading(false);
        if (!list.length) return;
        // 집계 조회가 실패해도 메모는 유지하고, 확인하지 못한 수치를 0으로 만들지 않는다.
        const counts = await AxiosApi.reviewSummaries(list.map((review) => review.reviewId), controller.signal);
        if (!controller.signal.aborted) {
          setSummaries(Object.fromEntries((Array.isArray(counts.data) ? counts.data : []).map((item) => [item.reviewId, item])));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          // 목록 실패와 부가 집계 실패를 구분해 다른 홈 콘텐츠까지 가리지 않는다.
          setFailed((current) => current || !listLoaded);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    let listLoaded = false;
    loadReviews();
    return () => controller.abort();
  }, []);

  const dateLabel = (value) => value ? value.slice(0, 10).replace(/-/g, ". ") : "작성일 정보 없음";

  return (
    <Section aria-label="최근 영화 메모">
      <SectionHeading>
        <div><h2>방금 남긴 영화 메모</h2><p>다른 사람의 한 줄에서, 다음 영화를 만나보세요.</p></div>
        <SectionLink as={Link} to="/reviews">전체 리뷰 보기 <span aria-hidden="true">↗</span></SectionLink>
      </SectionHeading>
      {loading ? <HomeState role="status">최근 메모를 불러오는 중입니다.</HomeState>
        : failed ? <HomeState role="alert">최근 메모를 불러오지 못했습니다. 전체 리뷰에서 다시 확인해 주세요.</HomeState>
        : !reviews.length ? <HomeState>첫 영화 메모를 기다리고 있어요.</HomeState>
        : <ReviewsGrid>{reviews.map((review) => {
          const summary = summaries[review.reviewId];
          return <ReviewPreview as={Link} to={`/reviews/${review.reviewId}`} key={review.reviewId}>
            <ReviewMovie>{review.movieTitle || "영화 제목 정보 없음"}{review.movieYear ? ` · ${review.movieYear}` : ""}</ReviewMovie>
            <h3>{review.title}</h3>
            <ReviewAuthor><span>{review.nickname || "작성자 정보 없음"}</span><time dateTime={review.createdAt || undefined}>{dateLabel(review.createdAt)}</time></ReviewAuthor>
            <ReviewReactions>{summary ? <><span>공감 {summary.likeCount}</span><span>아쉬워요 {summary.dislikeCount}</span><span>댓글 {summary.commentCount}</span></> : <span>반응 정보 미확인</span>}</ReviewReactions>
          </ReviewPreview>;
        })}</ReviewsGrid>}
    </Section>
  );
}
