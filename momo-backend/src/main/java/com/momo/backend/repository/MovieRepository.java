package com.momo.backend.repository;

import com.momo.backend.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

// KOBIS 영화 기본정보를 DB에서 조회하고 저장
public interface MovieRepository extends JpaRepository<Movie, String> {

}