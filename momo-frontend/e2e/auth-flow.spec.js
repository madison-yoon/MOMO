/* eslint-disable testing-library/prefer-screen-queries -- Playwright page queries are not Testing Library render queries. */
const { test, expect } = require("@playwright/test");


async function expectCharcoal(page) {
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(48, 48, 48)');
  await expect(page.locator('.momo-app-header')).toHaveCSS('background-color', 'rgb(34, 34, 34)');
  await expect(page.locator('.momo-app-header')).toHaveCSS('color', 'rgb(240, 236, 230)');
}

// 첫 시나리오는 CI의 일회용 MySQL에서만 실행한다. 로컬 데이터 보호 검증에서는 제외한다.
test("회원가입, 로그인, 로그아웃이 브라우저에서 이어진다", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());

  const suffix = Date.now().toString(36).slice(-7);
  const loginId = `e2e${suffix}`;
  const nickname = `M${suffix}`;
  const email = `${loginId}@example.com`;
  const password = "MomoE2e1!";

  await page.goto("/signup");

  await page.locator("#signupId").fill(loginId);
  await expect(page.getByText("사용 가능한 아이디입니다.")).toBeVisible();

  await page.locator("#signupEmail").fill(email);
  await page.locator("#signupPassword").fill(password);
  await page.locator("#signupPasswordCheck").fill(password);
  await page.locator("#signupNickname").fill(nickname);

  const signupButton = page.getByRole("button", {
    name: "회원가입", exact: true,
  });
  await expect(signupButton).toBeEnabled();
  await signupButton.click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#loginId").fill(loginId);
  await page.locator("#loginPassword").fill(password);

  const initialFavoritesSync = page.waitForResponse((response) =>
    response.url().endsWith("/api/favorites") &&
    response.request().method() === "GET" &&
    response.ok(),
  );
  await page.getByRole("button", { name: "로그인", exact: true }).click();

  await expect(page).toHaveURL("http://127.0.0.1:3000/");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("accessToken")))
    .not.toBeNull();
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  await initialFavoritesSync;
  await expectCharcoal(page);

  // 첫 로그인 동기화 후 서버에 관심 영화를 추가해 계정별 저장을 확인한다.
  const favoriteStatus = await page.evaluate(async (movie) => {
    const response = await fetch("http://127.0.0.1:8111/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(movie),
    });
    return response.status;
  }, {
    movieCode: "20261234",
    title: "관심 영화 E2E 테스트",
    releaseDate: "20261112",
    posterUrl: "",
  });
  expect(favoriteStatus).toBe(201);

  // 새로고침 후 서버의 관심 영화 목록이 화면에 복원되는지 확인한다.
  const refreshedFavoritesSync = page.waitForResponse((response) =>
    response.url().endsWith("/api/favorites") &&
    response.request().method() === "GET" &&
    response.ok(),
  );
  await page.reload();
  await refreshedFavoritesSync;
  await page.goto("/profile/favorites");
  await expect(page.getByText("관심 영화 E2E 테스트")).toBeVisible();

  // 관심 영화 화면의 버튼으로 서버 목록에서 삭제하고 빈 상태까지 반영되는지 확인한다.
  const favoriteDelete = page.waitForResponse((response) =>
    response.url().endsWith("/api/favorites/20261234") &&
    response.request().method() === "DELETE" &&
    response.ok(),
  );
  await page.getByRole("button", { name: "관심 영화 해제" }).click();
  await favoriteDelete;
  await expect(page.getByText("아직 등록한 관심 영화가 없습니다.")).toBeVisible();

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page.getByRole("link", { name: "로그인" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("accessToken")))
    .toBeNull();
  await expect(page.getByRole("button", { name: "로그아웃" })).toHaveCount(0);
});

test("인물 ID와 필모그래피 영화 ID가 통합 영화 상세로 정확히 연결된다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/persons/by-id/director/321", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        personInfo: {
          tmdbId: 321,
          name: "인물 연결 E2E",
          profileUrl: "",
          birthday: null,
          deathday: null,
          placeOfBirth: null,
          biography: "이 인물은 영화 제작과 연출 분야에서 오랜 기간 활동해 왔으며 다양한 장르의 작품을 통해 관객과 만났습니다. 작품의 서사와 인물의 감정을 세밀하게 다루는 연출을 선보이며 동료 창작자들과 협업했습니다. 이 소개 문장은 모바일과 데스크톱에서 세 줄 이후 접히는지 확인하기 위한 브라우저 테스트 문구입니다. 소개 더보기 버튼으로 전체 내용을 확인하고 다시 접을 수 있어야 합니다.",
          knownForDepartment: "Directing",
        },
        filmography: [
          {
            tmdbId: 888,
            title: "필모그래피 이동 E2E",
            releaseDate: "2026-11-12",
            posterUrl: "",
            role: "Director",
          },
          ...Array.from({ length: 7 }, (_, index) => ({
            tmdbId: 889 + index,
            title: `필모그래피 테스트 ${index + 2}`,
            releaseDate: "2026-11-12",
            posterUrl: "",
            role: "Director",
          })),
        ],
      }),
    }),
  );

  await page.route("**/api/persons/filmography/888", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ movieCode: "20261234" }),
    }),
  );

  await page.route("**/api/movies/resolve/20261234", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        tmdbId: 888,
        movieCode: "20261234",
        title: "필모그래피 이동 E2E",
        titleEn: "Filmography Navigation E2E",
        releaseDate: "20261112",
        runningTime: "100",
        genre: "드라마",
        director: "인물 연결 E2E",
        actors: [],
        watchGrade: "전체 관람가",
        overview: "영화 상세 이동 확인",
        posterUrl: "",
        people: [
          {
            personId: 321,
            name: "인물 연결 E2E",
            originalName: "Person Navigation E2E",
            profileUrl: "",
            department: "director",
          },
          ...Array.from({ length: 7 }, (_, index) => ({
            personId: 322 + index,
            name: `감독 미리보기 ${index + 2}`,
            originalName: "",
            profileUrl: "",
            department: "director",
          })),
          ...Array.from({ length: 8 }, (_, index) => ({
            personId: 400 + index,
            name: `배우 미리보기 ${index + 1}`,
            originalName: "",
            profileUrl: "",
            department: "actor",
            role: `배역 ${index + 1}`,
          })),
        ],
      }),
    }),
  );

  await page.route("**/api/movies/20261234/poster", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ movieCode: "20261234", posterUrl: "" }),
    }),
  );

  await page.route("**/api/reviews/movie/20261234**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ content: [], totalElements: 0, totalPages: 0 }),
    }),
  );

  await page.route("**/api/movies/20261234/rating", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        likeCount: 0,
        dislikeCount: 0,
        totalCount: 0,
        positiveRate: null,
        myRating: null,
      }),
    }),
  );

  await page.goto('/person/director/321');
  await expect(page.getByRole('heading', { level: 1, name: '인물 연결 E2E' })).toBeVisible();
  await expectCharcoal(page);
  const biography = page.locator('.person-biography');
  await expect(biography).not.toHaveClass(/is-expanded/);
  await page.getByRole('button', { name: '소개 더보기' }).click();
  await expect(biography).toHaveClass(/is-expanded/);
  await page.getByRole('button', { name: '접기', exact: true }).click();
  await expect(biography).not.toHaveClass(/is-expanded/);
  const films = page.locator('.filmography-list [role="button"]');
  await expect(films).toHaveCount(6);
  await page.getByRole('button', { name: '필모그래피 더보기 (6 / 8)' }).click();
  await expect(films).toHaveCount(8);
  await page.getByRole('button', { name: '접기', exact: true }).click();
  await expect(films).toHaveCount(6);
  await page.getByRole('button', { name: '필모그래피 이동 E2E 영화 상세정보 보기' }).click();
  await expect(page).toHaveURL(/\/movie\/20261234$/);
  await expect(page.getByRole('heading', { level: 1, name: '필모그래피 이동 E2E' })).toBeVisible();
  await expect(page.locator('.rating-positive-summary')).toContainText('아직 등록된 관객 평가가 없습니다.');
  const directors=page.locator('section').filter({has:page.getByRole('heading',{name:'감독',exact:true})});
  const actors=page.locator('section').filter({has:page.getByRole('heading',{name:'출연 배우',exact:true})});
  for(const [section,label] of [[directors,'감독'],[actors,'배우']]) {
    await expect(section.locator('.person-chip')).toHaveCount(6);
    await section.getByRole('button',{name:label+' 더보기 (6 / 8)'}).click();
    await expect(section.locator('.person-chip')).toHaveCount(8);
    await section.getByRole('button',{name:label+' 접기'}).click();
    await expect(section.locator('.person-chip')).toHaveCount(6);
  }
  await directors.getByRole('button',{name:/인물 연결 E2E/}).click();
  await expect(page).toHaveURL(/\/person\/director\/321$/);
});

test("KOBIS 영화 코드가 없는 영화에도 관객 평점 영역이 안내 상태로 표시된다", async ({ page }) => {
  await page.route("**/api/movies/resolve/555", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        tmdbId: 555,
        movieCode: null,
        title: "평점 안내 상태 E2E",
        titleEn: "Rating Availability E2E",
        releaseDate: "2026-11-12",
        runningTime: "105",
        genre: "드라마",
        director: "테스트 감독",
        actors: ["테스트 배우"],
        watchGrade: "전체 관람가",
        overview: "관객 평가 데이터 연결이 아직 없는 영화입니다.",
        posterUrl: "",
      }),
    }),
  );

  await page.goto("/movie/555");

  await expect(
    page.getByRole("heading", { level: 1, name: "평점 안내 상태 E2E" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "관객 평점" })).toBeVisible();
  await expect(page.locator(".movie-score-value strong")).toHaveText("—");
  await expect(page.locator(".rating-unavailable")).toContainText(
    "관객 평가 기능과 아직 연결되지 않았습니다.",
  );
  await expect(page.locator(".detail-reaction-counts")).toHaveCount(0);
});
