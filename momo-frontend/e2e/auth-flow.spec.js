/* eslint-disable testing-library/prefer-screen-queries -- Playwright page queries are not Testing Library render queries. */
const { test, expect } = require("@playwright/test");

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
    name: "무료 회원가입하고 영화 메모하러 가기",
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
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL("http://127.0.0.1:3000/");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("accessToken")))
    .not.toBeNull();
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  await initialFavoritesSync;

  // The homepage needs an actual cinema-feature composition, not only shared colors.
  await page.goto("/");
  const homeHero = page.locator(".home-feature-section");
  await expect(homeHero).toBeVisible();
  await expect(page.locator(".home-feature-info")).toBeVisible();
  await expect(page.locator(".home-feature-visual")).toBeVisible();
  const homeHeroMaterial = await homeHero.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      columns: style.gridTemplateColumns.split(" ").length,
      background: style.backgroundImage,
      blur: style.backdropFilter,
      border: style.borderTopColor,
    };
  });
  expect(homeHeroMaterial.columns).toBe(2);
  expect(homeHeroMaterial.background).toContain("linear-gradient");
  expect(homeHeroMaterial.blur).toContain("blur(28px)");
  expect(homeHeroMaterial.border).toBe("rgba(255, 255, 255, 0.92)");
  const appMain = page.locator("main.momo-app-main");
  await expect(appMain).toBeVisible();
  const homePrimary = page.locator(".home-favorites-more").first();
  await expect(homePrimary).toBeVisible();
  const primaryGlass = await homePrimary.evaluate((element) => {
    const style = getComputedStyle(element);
    return { image: style.backgroundImage, border: style.borderColor, blur: style.backdropFilter };
  });
  expect(primaryGlass.image).toContain("linear-gradient");
  expect(primaryGlass.border).toBe("rgba(255, 255, 255, 0.94)");
  expect(primaryGlass.blur).toContain("blur(22px)");
  const headerSearch = await page.locator(".momo-app-header .momo-search-button").evaluate((element) => {
    const style = getComputedStyle(element);
    return { image: style.backgroundImage, border: style.borderColor, blur: style.backdropFilter };
  });
  expect(headerSearch.image).toContain("linear-gradient");
  expect(headerSearch.border).toBe("rgba(255, 255, 255, 0.9)");
  expect(headerSearch.blur).toContain("blur(20px)");
  const chatLauncherGlass = await page.locator(".momo-chat-launcher").evaluate((element) => {
    const style = getComputedStyle(element);
    return { image: style.backgroundImage, border: style.borderColor, blur: style.backdropFilter };
  });
  expect(chatLauncherGlass.image).toContain("linear-gradient");
  expect(chatLauncherGlass.border).toBe("rgba(255, 255, 255, 0.94)");
  expect(chatLauncherGlass.blur).toContain("blur(24px)");
  await page.screenshot({ path: "test-results/home-cinema-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileHomeColumns = await homeHero.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(mobileHomeColumns).toBe(1);
  await page.screenshot({ path: "test-results/home-cinema-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 800 });

  // Each route has a distinct low-saturation color field behind translucent surfaces.
  const brandRoutes = [
    { path: "/profile/reviews", heading: ".my-reviews-heading", surface: ".my-reviews-card" },
    { path: "/profile/liked-reviews", heading: ".liked-reviews-heading", surface: ".liked-reviews-card" },
    { path: "/profile/favorites", heading: ".favorite-page-heading", surface: ".favorite-page-card, .favorite-page-empty" },
    { path: "/reviews", heading: ".all-reviews-heading", surface: ".all-reviews-card" },
    { path: "/search?keyword=기생충", heading: ".search-page-heading", surface: ".search-page input" },
  ];

  for (const route of brandRoutes) {
    await page.goto(route.path);
    await expect(page.locator(".momo-app-header")).toBeVisible();
    await expect(page.locator(route.heading).first()).toBeVisible({ timeout: 20000 });

    const bodyCanvas = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return { image: style.backgroundImage, size: style.backgroundSize };
    });
    expect(bodyCanvas.image).toContain("linear-gradient");
    expect(bodyCanvas.size).not.toContain("34px 34px");

    const visual = await page.locator(route.heading).first().evaluate((element) => {
      const style = getComputedStyle(element);
      const title = element.querySelector("h1") || element;
      return {
        background: style.backgroundImage,
        blur: style.backdropFilter,
        border: style.borderTopColor,
        title: getComputedStyle(title).color,
      };
    });
    expect(visual.background).toContain("linear-gradient");
    expect(visual.blur).toContain("blur(26px)");
    expect(visual.border).toBe("rgba(255, 255, 255, 0.9)");
    expect(visual.title).toBe("rgb(41, 40, 32)");

    const routeSurface = page.locator(route.surface).first();
    if (await routeSurface.count()) {
      const surfaceStyle = await routeSurface.evaluate((element) => {
        const style = getComputedStyle(element);
        return { background: style.backgroundColor, border: style.borderTopColor };
      });
      expect(surfaceStyle.background).not.toBe("rgb(236, 234, 227)");
      expect(surfaceStyle.background).not.toContain("rgb(239, 243, 237)");
      expect(surfaceStyle.border).not.toBe("rgb(168, 177, 154)");
    }

    await page.screenshot({
      path: `test-results/route-${route.path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-desktop.png`,
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(route.heading).first()).toBeVisible();
    await page.screenshot({
      path: `test-results/route-${route.path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-mobile.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 1280, height: 800 });
  }


  // 마이페이지의 세 활동 카드가 실제 카드 구조와 개수 배지를 유지하는지 확인한다.
  await page.goto("/profile");
  const profileActivityCards = page.locator(".profile-activity-item");
  await expect(profileActivityCards).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    await expect(profileActivityCards.nth(index).locator("h3")).toBeVisible();
    await expect(profileActivityCards.nth(index).locator(".profile-activity-count")).toBeVisible();
    await expect(profileActivityCards.nth(index).locator(".profile-activity-icon svg")).toBeVisible();
    await expect(profileActivityCards.nth(index).locator(".profile-activity-footer p")).toBeVisible();
  }
  await expect(profileActivityCards.nth(0).locator(".profile-activity-count-row")).toBeVisible();
  await expect(profileActivityCards.nth(1).locator(".profile-activity-footer")).toBeVisible();
  await expect(profileActivityCards.nth(2).getByRole("heading", { name: "관심 영화" })).toBeVisible();

  // 마이페이지는 장식용 배경판이나 카드 안의 중첩 박스 없이 정보가 명확히 읽혀야 한다.
  const dashboardCanvas = await page.locator(".profile-dashboard").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, image: style.backgroundImage };
  });
  expect(dashboardCanvas.background).toBe("rgba(0, 0, 0, 0)");
  expect(dashboardCanvas.image).toContain("radial-gradient");
  expect(dashboardCanvas.image).not.toContain("repeating-linear-gradient");

  const overviewSurface = await page.locator(".profile-overview-card").evaluate((element) => {
    const style = getComputedStyle(element);
    const inner = getComputedStyle(element.querySelector(".profile-user"));
    return {
      radius: style.borderRadius,
      background: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      blur: style.backdropFilter,
      innerBackground: inner.backgroundColor,
      innerBorder: inner.borderTopWidth,
    };
  });
  expect(overviewSurface.radius).toBe("20px");
  expect(overviewSurface.background).toBe("rgba(0, 0, 0, 0)");
  expect(overviewSurface.backgroundImage).toContain("linear-gradient");
  expect(overviewSurface.blur).toContain("blur(26px)");
  expect(overviewSurface.innerBackground).toBe("rgba(0, 0, 0, 0)");
  expect(overviewSurface.innerBorder).toBe("0px");

  const activityGridColumns = await page.locator(".profile-activity-grid").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(activityGridColumns).toBe(3);

  const activityHeadingColor = await profileActivityCards.first().locator("h3").evaluate(
    (element) => getComputedStyle(element).color,
  );
  expect(activityHeadingColor).toBe("rgb(41, 40, 32)");

  // 활동 카드는 과한 장식 대신 은은한 유리 재질과 낮은 채도 색을 사용한다.
  const activityGlass = await profileActivityCards.first().evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      blur: style.backdropFilter,
      background: style.backgroundImage,
      radius: style.borderRadius,
      leftBorder: style.borderLeftColor,
    };
  });
  expect(activityGlass.blur).toContain("blur(24px)");
  expect(activityGlass.background).toContain("linear-gradient");
  expect(activityGlass.background).not.toContain("repeating-linear-gradient");
  expect(activityGlass.radius).toBe("15px");
  expect(activityGlass.leftBorder).toBe("rgb(214, 180, 63)");
  await expect(profileActivityCards.locator(".profile-activity-icon svg")).toHaveCount(3);

  const activityPseudo = await profileActivityCards.first().evaluate((element) => ({
    before: getComputedStyle(element, "::before").content,
    after: getComputedStyle(element, "::after").content,
  }));
  expect(activityPseudo.before).not.toBe("none");
  expect(activityPseudo.after).not.toBe("none");

  await page.screenshot({
    path: "test-results/profile-dashboard-desktop.png",
    fullPage: true,
  });

  const headerNavRadius = await page.locator("header nav a").first().evaluate(
    (element) => getComputedStyle(element).borderRadius,
  );
  const headerActionRadius = await page.getByRole("button", { name: "로그아웃" }).evaluate(
    (element) => getComputedStyle(element).borderRadius,
  );
  expect(headerNavRadius).toBe("999px");
  expect(headerActionRadius).toBe("999px");

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileActivityColumns = await page.locator(".profile-activity-grid").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(mobileActivityColumns).toBe(1);
  await expect(
    profileActivityCards.first().locator(".profile-activity-footer p"),
  ).toBeVisible();
  const mobileAccountRows = await page.locator(".profile-user-details").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(mobileAccountRows).toBe(1);
  await page.screenshot({
    path: "test-results/profile-dashboard-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 800 });


  // Logout stays visually secondary; the footer remains a clean translucent plane.
  const logoutStyle = await page.getByRole("button", { name: "로그아웃" }).evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, image: style.backgroundImage, border: style.borderColor, color: style.color, blur: style.backdropFilter };
  });
  expect(logoutStyle.image).toContain("linear-gradient");
  expect(logoutStyle.border).toBe("rgba(255, 255, 255, 0.9)");
  expect(logoutStyle.color).toBe("rgb(61, 73, 65)");
  expect(logoutStyle.blur).toContain("blur(20px)");

  const footerStyle = await page.locator("footer").evaluate((element) => {
    const style = getComputedStyle(element);
    const description = getComputedStyle(element.querySelector("p"));
    const link = getComputedStyle(element.querySelector("a"));
    const bottom = getComputedStyle(element.lastElementChild);
    return {
      background: style.backgroundImage,
      description: description.color,
      link: link.color,
      bottom: bottom.color,
    };
  });
  expect(footerStyle.background).toContain("linear-gradient");
  expect(footerStyle.description).toBe("rgb(81, 76, 64)");
  expect(footerStyle.link).toBe("rgb(81, 76, 64)");
  expect(footerStyle.bottom).toBe("rgb(81, 76, 64)");
  await page.screenshot({
    path: "test-results/profile-footer-logout-desktop.png",
    fullPage: true,
  });

  // Verify the destructive flow and its visual hierarchy without submitting deletion.
  await page.goto("/profile/delete");
  await expect(page.getByRole("heading", { level: 1, name: "회원 탈퇴" })).toBeVisible();
  const deleteButton = page.getByRole("button", { name: "탈퇴하기" });
  await expect(deleteButton).toBeDisabled();
  const disabledDeleteStyle = await deleteButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, color: style.color };
  });
  expect(disabledDeleteStyle.background).toBe("rgba(0, 0, 0, 0)");
  expect(disabledDeleteStyle.color).toBe("rgb(140, 81, 73)");
  await page.locator(".profile-delete-check input").check();
  await expect(deleteButton).toBeEnabled();
  const enabledDeleteStyle = await deleteButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { disabled: element.disabled, background: style.backgroundColor, image: style.backgroundImage, color: style.color, blur: style.backdropFilter };
  });
  expect(enabledDeleteStyle.disabled).toBe(false);
  expect(enabledDeleteStyle.background).toBe("rgba(0, 0, 0, 0)");
  expect(enabledDeleteStyle.image).toContain("linear-gradient");
  expect(enabledDeleteStyle.color).toBe("rgb(140, 81, 73)");
  expect(enabledDeleteStyle.blur).toContain("blur(20px)");
  await page.screenshot({
    path: "test-results/profile-delete-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/profile-delete-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 800 });

  // 프로필 수정 페이지의 브랜드 컬러가 실제 브라우저 스타일에 반영되는지 확인한다.
  await page.goto("/profile/edit");
  await expect(page.locator(".profile-edit-page")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "프로필 수정" })).toBeVisible();

  // 사용자 정보는 API에서 비동기로 채워진다. 이메일 응답이 비어 있으면 가입 시 사용한 이메일로 검증한다.
  await expect(page.locator("#edit-nickname")).not.toHaveValue("");
  const profileEmail = page.locator("#edit-email");
  if (!(await profileEmail.inputValue())) {
    await profileEmail.fill(email);
  }
  await expect(page.locator(".profile-edit-submit")).toBeEnabled();

  const profileEditCanvas = await page.locator(".profile-edit-page").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, image: style.backgroundImage };
  });
  expect(profileEditCanvas.background).toBe("rgba(0, 0, 0, 0)");
  expect(profileEditCanvas.image).toContain("radial-gradient");

  const brandTokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    return {
      background: root.getPropertyValue("--momo-bg").trim(),
      note: root.getPropertyValue("--momo-note").trim(),
      accent: root.getPropertyValue("--momo-accent").trim(),
      border: root.getPropertyValue("--momo-border").trim(),
      bodyBackground: body.backgroundColor,
    };
  });
  expect(brandTokens.background).toBe("#F5F2EB");
  expect(brandTokens.note).toBe("#FFFAEC");
  expect(brandTokens.accent).toBe("#FFD43B");
  expect(brandTokens.border).toBe("#E9DFC5");
  expect(brandTokens.bodyBackground).toBe("rgb(245, 242, 235)");

  await expect(page.locator(".momo-app-header")).toBeVisible();
  const profileEditHero = await page.locator(".profile-edit-heading").evaluate((element) => {
    const style = getComputedStyle(element);
    const title = getComputedStyle(element.querySelector("h1"));
    return {
      title: title.color,
      titleBackground: title.backgroundImage,
      background: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      blur: style.backdropFilter,
    };
  });
  expect(profileEditHero.title).toBe("rgb(41, 40, 32)");
  expect(profileEditHero.titleBackground).toBe("none");
  expect(profileEditHero.background).toBe("rgba(0, 0, 0, 0)");
  expect(profileEditHero.backgroundImage).toContain("linear-gradient");
  expect(profileEditHero.blur).toContain("blur(24px)");

  const photoSurface = await page.locator(".profile-edit-photo-card").evaluate((element) => {
    const style = getComputedStyle(element);
    const preview = getComputedStyle(element.querySelector(".profile-image-preview"));
    return {
      background: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      blur: style.backdropFilter,
      radius: style.borderRadius,
      previewRadius: preview.borderRadius,
      previewBorder: preview.borderColor,
    };
  });
  expect(photoSurface.background).toBe("rgba(0, 0, 0, 0)");
  expect(photoSurface.backgroundImage).toContain("linear-gradient");
  expect(photoSurface.blur).toContain("blur(24px)");
  expect(photoSurface.radius).toBe("18px");
  expect(photoSurface.previewRadius).toBe("50%");
  expect(photoSurface.previewBorder).toBe("rgb(255, 243, 197)");

  const editLayoutColumns = await page.locator(".profile-edit-layout").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(editLayoutColumns).toBe(2);
  await expect(page.locator(".profile-edit-details")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "기본 정보" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "비밀번호 변경" })).toBeVisible();

  const saveButton = await page.locator(".profile-edit-submit").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, color: style.color, radius: style.borderRadius };
  });
  expect(saveButton.background).toBe("rgba(0, 0, 0, 0)");
  expect(saveButton.color).toBe("rgb(77, 66, 31)");
  expect(saveButton.radius).toBe("10px");
  const saveGlass = await page.locator(".profile-edit-submit").evaluate((element) => getComputedStyle(element).backdropFilter);
  expect(saveGlass).toContain("blur(22px)");

  // 입력 필드에 포커스를 주며 바뀐 스크롤 위치를 초기화해 sticky nav와 제목이 겹치지 않는지 확인한다.
  await page.evaluate(() => window.scrollTo(0, 0));
  const desktopHeadingGap = await page.evaluate(() => {
    const nav = document.querySelector(".momo-app-header").getBoundingClientRect();
    const heading = document.querySelector(".profile-edit-heading").getBoundingClientRect();
    return heading.top - nav.bottom;
  });
  expect(desktopHeadingGap).toBeGreaterThanOrEqual(0);
  await expect(page.locator(".profile-edit-heading")).toBeInViewport();

  // 성공한 화면도 CI artifact로 보관해 실제 헤더 색과 형태를 확인할 수 있게 한다.
  await page.screenshot({
    path: "test-results/profile-edit-design-desktop.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const mobileHeadingGap = await page.evaluate(() => {
    const nav = document.querySelector(".momo-app-header").getBoundingClientRect();
    const heading = document.querySelector(".profile-edit-heading").getBoundingClientRect();
    return heading.top - nav.bottom;
  });
  expect(mobileHeadingGap).toBeGreaterThanOrEqual(0);
  await expect(page.locator(".profile-edit-heading")).toBeInViewport();

  const mobileEditColumns = await page.locator(".profile-form-buttons").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(mobileEditColumns).toBe(2);
  const mobileSettingsColumns = await page.locator(".profile-edit-layout").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(mobileSettingsColumns).toBe(1);
  await expect(page.locator(".profile-edit-photo-card")).toBeVisible();
  await expect(page.locator(".profile-edit-cancel")).toBeVisible();
  await page.screenshot({
    path: "test-results/profile-edit-design-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto("/");

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

  // 관심 영화 페이지는 낮은 채도의 필름 아카이브 톤과 반투명 표면을 사용한다.
  const favoriteHeroGlass = await page.locator(".favorite-page-heading").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      blur: style.backdropFilter,
      background: style.backgroundImage,
      radius: style.borderRadius,
    };
  });
  expect(favoriteHeroGlass.blur).toContain("blur(26px)");
  expect(favoriteHeroGlass.background).toContain("linear-gradient");
  expect(favoriteHeroGlass.radius).toBe("22px");
  const favoritePageBackground = await page.locator(".favorite-page").evaluate((element) => {
    const style = getComputedStyle(element);
    return { image: style.backgroundImage, color: style.backgroundColor };
  });
  expect(favoritePageBackground.image).toContain("radial-gradient");
  expect(favoritePageBackground.image).not.toContain("repeating-linear-gradient");
  const favoriteGlassCard = await page.locator(".favorite-page-card").evaluate((element) => {
    const style = getComputedStyle(element);
    return { blur: style.backdropFilter, background: style.backgroundImage };
  });
  expect(favoriteGlassCard.blur).toContain("blur(22px)");
  expect(favoriteGlassCard.background).toContain("linear-gradient");

  const favoriteCardStyle = await page.locator(".favorite-page-card").evaluate((element) => {
    const style = getComputedStyle(element);
    const title = getComputedStyle(element.querySelector(".favorite-page-movie-info h3"));
    return { background: style.backgroundColor, backgroundImage: style.backgroundImage, border: style.borderColor, title: title.color };
  });
  expect(favoriteCardStyle.background).toBe("rgba(0, 0, 0, 0)");
  expect(favoriteCardStyle.backgroundImage).toContain("linear-gradient");
  expect(favoriteCardStyle.border).toBe("rgba(255, 255, 255, 0.84)");
  expect(favoriteCardStyle.title).toBe("rgb(41, 40, 32)");
  await page.screenshot({
    path: "test-results/favorite-gallery-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/favorite-gallery-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 800 });

  // 관심 영화 화면의 버튼으로 서버 목록에서 삭제하고 빈 상태까지 반영되는지 확인한다.
  const favoriteDelete = page.waitForResponse((response) =>
    response.url().endsWith("/api/favorites/20261234") &&
    response.request().method() === "DELETE" &&
    response.ok(),
  );
  await expect(page.getByRole("button", { name: "관심 영화 해제" }).locator(".favorite-film-ticket-icon")).toBeVisible();
  const savedFilmGlass = await page.getByRole("button", { name: "관심 영화 해제" }).evaluate((element) => {
    const style = getComputedStyle(element);
    return { image: style.backgroundImage, blur: style.backdropFilter, border: style.borderColor };
  });
  expect(savedFilmGlass.image).toContain("linear-gradient");
  expect(savedFilmGlass.blur).toContain("blur(20px)");
  expect(savedFilmGlass.border).toContain("255");
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

  await page.goto("/person/director/321");
  await expect(
    page.getByRole("heading", { level: 1, name: "인물 연결 E2E" }),
  ).toBeVisible();

  const personHeroStyle = await page.locator(".movie-detail-header").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundImage, border: style.borderTopColor };
  });
  expect(personHeroStyle.background).toContain("linear-gradient");
  expect(personHeroStyle.border).toBe("rgba(255, 255, 255, 0.9)");
  await page.screenshot({ path: "test-results/route-person-detail-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "test-results/route-person-detail-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });

  // 긴 인물 소개는 세 줄 미리보기에서 펼치고 다시 접을 수 있어야 한다.
  const biography = page.locator(".person-biography");
  await expect(biography).not.toHaveClass(/is-expanded/);
  await page.getByRole("button", { name: "소개 더보기" }).click();
  await expect(biography).toHaveClass(/is-expanded/);
  await page.getByRole("button", { name: "접기" }).click();
  await expect(biography).not.toHaveClass(/is-expanded/);

  // 필모그래피는 두 열 기준 세 줄(6편)만 먼저 보여주고 더보기/접기가 가능해야 한다.
  const filmographyItems = page.locator(".filmography-list [role='button']");
  await expect(filmographyItems).toHaveCount(6);
  const filmographyColumns = await page.locator(".filmography-list").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(filmographyColumns).toBe(2);
  await page.getByRole("button", { name: "필모그래피 더보기 (6 / 8)" }).click();
  await expect(filmographyItems).toHaveCount(8);
  await page.getByRole("button", { name: "접기" }).click();
  await expect(filmographyItems).toHaveCount(6);

  await page.getByRole("button", {
    name: "필모그래피 이동 E2E 영화 상세정보 보기",
  }).click();

  await expect(page).toHaveURL(/\/movie\/20261234$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "필모그래피 이동 E2E" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "관객 평점" })).toBeVisible();
  await expect(page.locator(".rating-distribution-track")).toBeVisible();

  const movieHeroStyle = await page.locator(".movie-detail-header").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundImage, border: style.borderTopColor };
  });
  expect(movieHeroStyle.background).toContain("linear-gradient");
  expect(movieHeroStyle.border).toBe("rgba(255, 255, 255, 0.9)");
  await page.screenshot({ path: "test-results/route-movie-detail-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "test-results/route-movie-detail-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".detail-reaction-counts .rating-vote-button")).toHaveCount(2);

  // 영화 상세 헤더는 원형 광원 없이 절제된 반투명 글래스로 표현한다.
  const movieHeroGlass = await page.locator(".movie-detail-header").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      blur: style.backdropFilter,
      background: style.backgroundImage,
      radius: style.borderRadius,
      columns: style.gridTemplateColumns,
    };
  });
  expect(movieHeroGlass.blur).toContain("blur(32px)");
  expect(movieHeroGlass.background).toContain("radial-gradient");
  expect(movieHeroGlass.radius).toBe("18px");
  expect(movieHeroGlass.columns.split(" ").length).toBe(1);

  const audienceGlass = await page.locator(".movie-rating-panel").evaluate((element) => {
    const style = getComputedStyle(element);
    return { blur: style.backdropFilter, background: style.backgroundImage };
  });
  expect(audienceGlass.blur).toContain("blur(26px)");
  expect(audienceGlass.background).toContain("linear-gradient");

  const ratingVisual = await page.locator(".movie-rating-panel").evaluate((element) => {
    const panel = getComputedStyle(element);
    const title = getComputedStyle(element.querySelector(".rating-label"));
    const score = getComputedStyle(element.querySelector(".movie-score-value strong"));
    const progress = getComputedStyle(element.querySelector(".rating-distribution-track span"));
    const like = getComputedStyle(element.querySelector(".rating-vote-button.is-like"));
    const dislike = getComputedStyle(element.querySelector(".rating-vote-button.is-dislike"));
    return {
      panelBackground: panel.backgroundColor,
      panelBorder: panel.borderColor,
      title: title.color,
      score: score.color,
      progress: progress.backgroundImage,
      likeBackground: like.backgroundColor,
      likeText: like.color,
      dislikeBackground: dislike.backgroundColor,
      dislikeText: dislike.color,
      height: element.getBoundingClientRect().height,
      contentWidth: element.querySelector(".rating-panel-main").getBoundingClientRect().width,
      panelContentWidth: (() => {
        const parent = element.querySelector(".rating-panel-main").parentElement;
        const style = getComputedStyle(parent);
        return parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      })(),
    };
  });
  expect(ratingVisual.panelBackground).toBe("rgba(0, 0, 0, 0)");
  expect(ratingVisual.panelBorder).toBe("rgba(255, 255, 255, 0.9)");
  expect(ratingVisual.title).toBe("rgb(41, 40, 32)");
  expect(ratingVisual.score).toBe("rgb(41, 40, 32)");
  expect(ratingVisual.progress).toContain("linear-gradient");
  expect(ratingVisual.likeBackground).toBe("rgba(0, 0, 0, 0)");
  expect(ratingVisual.likeText).toBe("rgb(102, 81, 15)");
  expect(ratingVisual.dislikeBackground).toBe("rgba(0, 0, 0, 0)");
  expect(ratingVisual.dislikeText).toBe("rgb(132, 86, 79)");
  expect(ratingVisual.height).toBeGreaterThan(240);
  expect(ratingVisual.contentWidth).toBeGreaterThan(ratingVisual.panelContentWidth * 0.95);
  await page.screenshot({
    path: "test-results/movie-rating-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: "test-results/movie-rating-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });

  // 영화 상세의 감독·배우도 세 줄 미리보기와 펼치기/접기 동작을 제공한다.
  const directorSection = page.locator(".people-section").nth(0);
  const actorSection = page.locator(".people-section").nth(1);
  const directorItems = directorSection.locator(".people-list-compact .person-chip");
  const actorItems = actorSection.locator(".people-list-compact .person-chip");

  await expect(directorItems).toHaveCount(6);
  const peopleColumns = await directorSection.locator(".people-list-compact").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(peopleColumns).toBe(2);
  await directorSection.getByRole("button", { name: "감독 더보기 (6 / 8)" }).click();
  await expect(directorItems).toHaveCount(8);
  await directorSection.getByRole("button", { name: "감독 접기" }).click();
  await expect(directorItems).toHaveCount(6);

  await expect(actorItems).toHaveCount(6);
  await actorSection.getByRole("button", { name: "배우 더보기 (6 / 8)" }).click();
  await expect(actorItems).toHaveCount(8);
  await actorSection.getByRole("button", { name: "배우 접기" }).click();
  await expect(actorItems).toHaveCount(6);

  // 영화 상세의 TMDb 인물 ID가 이름 검색이 아닌 고유 ID 경로로 연결되는지 확인한다.
  await directorSection.getByRole("button", { name: /인물 연결 E2E/ }).click();
  await expect(page).toHaveURL(/\/person\/director\/321$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "인물 연결 E2E" }),
  ).toBeVisible();
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
