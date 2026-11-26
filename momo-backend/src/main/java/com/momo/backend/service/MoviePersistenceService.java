package com.momo.backend.service;

import com.momo.backend.dto.movie.MovieSearchResponse;
import com.momo.backend.entity.Movie;
import org.springframework.dao.OptimisticLockingFailureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
public class MoviePersistenceService {

    private final MoviePersistenceWriter moviePersistenceWriter;

    public Movie saveDetail(MovieDetailUpdate update, boolean existing) {
        boolean requireExisting = existing;
        for (int attempt = 1; ; attempt++) {
            try {
                return moviePersistenceWriter.applyDetail(update, requireExisting);
            } catch (DataIntegrityViolationException duplicate) {
                if (requireExisting || !MovieWriteRetry.isDuplicateInsert(duplicate) || attempt == 3) throw duplicate;
                // 중복 INSERT 이후 재시도에서는 경합 중 생성된 행을 보완하고 INSERT를 반복하지 않는다.
                requireExisting = true;
            } catch (OptimisticLockingFailureException exhausted) {
                if (attempt < 3) continue;
                if (!existing) throw exhausted;
                log.warn("Movie detail enrichment not saved after 3 attempts. movieCode={}", update.movieCode());
                return moviePersistenceWriter.readCurrent(update.movieCode());
            }
        }
    }

    public void saveBoxOffice(String code, int rank, String date, boolean daily) {
        MovieWriteRetry.execute(() -> {
            moviePersistenceWriter.applyBoxOffice(code, rank, date, daily);
            return null;
        });
    }

    // 검색 결과에 포함된 영화를 코드 기준으로 중복 제거한 뒤 한 건씩 안전하게 저장한다.
    // 각 저장은 독립 트랜잭션이므로 동시 INSERT 충돌이 전체 검색 결과를 롤백시키지 않는다.
    public void saveSearchMovies(List<MovieSearchResponse> movies) {
        if (movies == null || movies.isEmpty()) {
            return;
        }

        Map<String, MovieSearchResponse> uniqueMovies = new LinkedHashMap<>();
        for (MovieSearchResponse item : movies) {
            if (item == null
                    || item.movieCode() == null
                    || item.movieCode().isBlank()
                    || item.title() == null
                    || item.title().isBlank()) {
                continue;
            }

            MovieSearchResponse previous = uniqueMovies.putIfAbsent(item.movieCode(), item);
            if (previous != null) {
                log.debug("중복 영화 검색 결과 제거. movieCode={}", item.movieCode());
            }
        }

        int savedOrUpdated = 0;
        int recoveredConflicts = 0;

        for (MovieSearchResponse item : uniqueMovies.values()) {
            if (saveSearchMovie(item)) recoveredConflicts++;
            else savedOrUpdated++;
        }

        log.info(
                "검색 영화 DB 저장 완료. 처리={}, 동시 저장 충돌 복구={}",
                savedOrUpdated + recoveredConflicts,
                recoveredConflicts
        );
    }
    private boolean saveSearchMovie(MovieSearchResponse item) {
        boolean recovery = false;
        for (int attempt = 1; ; attempt++) {
            try {
                if (recovery) moviePersistenceWriter.supplementAfterConcurrentInsert(item);
                else moviePersistenceWriter.saveOrSupplement(item);
                return recovery;
            } catch (DataIntegrityViolationException duplicate) {
                if (recovery || !MovieWriteRetry.isDuplicateInsert(duplicate) || attempt == 3) throw duplicate;
                recovery = true;
            } catch (OptimisticLockingFailureException conflict) {
                if (attempt == 3) throw conflict;
            }
        }
    }
}
