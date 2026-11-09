package com.momo.backend.service;

import java.util.Locale;


// KOBIS와 외부 API의 영화 정보를 비교하여 동일 작품인지 검증
final class MovieMatchVerifier {

    private MovieMatchVerifier() {
    }

    // 제목을 우선 비교하고 개봉 연도 또는 추가 정보로 동일 영화 판단
    static boolean isSameMovie(
            String kobisTitle,
            String kobisTitleEn,
            String kobisReleaseDate,
            String kobisDirector,
            String candidateTitle,
            String candidateOriginalTitle,
            String candidateReleaseDate,
            String candidateDirector) {

        String requestedTitle = normalizeTitle(kobisTitle);
        String requestedTitleEn = normalizeTitle(kobisTitleEn);
        String foundTitle = normalizeTitle(candidateTitle);
        String foundOriginalTitle = normalizeTitle(candidateOriginalTitle);

        // 한글 제목 또는 영문 제목이 일치하는지 확인
        boolean titleMatches = matches(requestedTitle, foundTitle, foundOriginalTitle)
                || (!requestedTitleEn.isBlank()
                && matches(requestedTitleEn, foundTitle, foundOriginalTitle));

        if (!titleMatches) {
            return false;
        }

        String kobisYear = releaseYear(kobisReleaseDate);
        String candidateYear = releaseYear(candidateReleaseDate);

        // 개봉연도가 양쪽에 있으면 반드시 같은 연도여야 한다.
        if (!kobisYear.isBlank() && !candidateYear.isBlank()) {
            return kobisYear.equals(candidateYear);
        }

        // 외부 데이터에 개봉연도가 없을 때는 영문 원제 또는 감독까지 확인한다.
        // 제목만 같은 동명 영화가 잘못 연결되는 상황을 방지한다.
        boolean originalTitleMatches = !requestedTitleEn.isBlank()
                && matches(requestedTitleEn, foundTitle, foundOriginalTitle);
        boolean directorMatches = !normalizeTitle(kobisDirector).isBlank()
                && normalizeTitle(kobisDirector).equals(normalizeTitle(candidateDirector));

        return originalTitleMatches || directorMatches;
    }

    // 비교 대상 중 일치하는 문자열이 있는지 확인
    private static boolean matches(String requested, String... candidates) {
        if (requested.isBlank()) {
            return false;
        }
        for (String candidate : candidates) {
            if (requested.equals(candidate)) {
                return true;
            }
        }
        return false;
    }

    // 제목의 공백·특수문자 등을 제거하여 비교 형식 통일
    static String normalizeTitle(String title) {
        if (title == null) {
            return "";
        }
        return title
                .replace("!HS", "")
                .replace("!HE", "")
                .replaceAll("\\s+", "")
                .replaceAll("[^\\p{L}\\p{N}]", "")
                .toLowerCase(Locale.ROOT);
    }

    // 개봉일 문자열에서 연도 4자리 추출
    private static String releaseYear(String date) {
        if (date == null) {
            return "";
        }
        String digits = date.replaceAll("[^0-9]", "");
        return digits.length() >= 4 ? digits.substring(0, 4) : "";
    }
}
