import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const MyPageContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  box-sizing: border-box;
`;

const Section = styled.section`
  background-color: #ffffff;
  border: 1px solid #e8e5df;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #292929;
`;

const UserInfoBox = styled.div`
  font-size: 15px;
  color: #444;
  line-height: 1.6;
`;

const ReviewItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #f0efeb;

  &:last-child {
    border-bottom: none;
  }
`;

function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ nickname: "", email: "" });
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 로컬스토리지나 토큰에서 유저 정보 가져오기 (또는 회원정보 API 호출)
    const savedUsername = localStorage.getItem("username") || "사용자";
    setUserInfo({ nickname: savedUsername });

    // 2. 내가 작성한 리뷰 목록이나 프로필 데이터를 백엔드 API에서 가져오기
    // 예시: fetch('/api/users/me/reviews') 등 필요에 따라 엔드포인트 연결
    const fetchMyData = async () => {
      try {
        // const response = await fetch('/api/reviews/mine', { ... });
        // const data = await response.json();
        // setMyReviews(data);
      } catch (error) {
        console.error("마이페이지 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, []);

  return (
    <MyPageContainer>
      {/* 1. 회원 정보 영역 */}
      <Section>
        <Title>내 프로필 정보</Title>
        <UserInfoBox>
          <p>
            <strong>닉네임:</strong> {userInfo.nickname}
          </p>
          {/* 필요한 경우 비밀번호 변경, 회원탈퇴 버튼 등 배치 */}
        </UserInfoBox>
      </Section>

      {/* 2. 내가 쓴 리뷰 / 기록 목록 영역 */}
      <Section>
        <Title>내가 작성한 영화 리뷰</Title>
        {loading ? (
          <p>불러오는 중...</p>
        ) : myReviews.length === 0 ? (
          <p style={{ color: "#888", fontSize: "14px" }}>
            아직 작성한 리뷰가 없습니다.
          </p>
        ) : (
          myReviews.map((review, index) => (
            <ReviewItem key={index}>
              {/* 리뷰 내용 렌더링 */}
              <h4>{review.movieTitle}</h4>
              <p>{review.content}</p>
            </ReviewItem>
          ))
        )}
      </Section>
    </MyPageContainer>
  );
}

export default MyPage;
