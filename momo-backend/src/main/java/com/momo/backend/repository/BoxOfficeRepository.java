package com.momo.backend.repository;

import com.momo.backend.entity.BoxOffice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoxOfficeRepository extends JpaRepository<BoxOffice, Long> {

    // 특정 날짜의 박스오피스 순위를 조회
    List<BoxOffice> findByTargetDateOrderByRankAsc(String targetDate);
}