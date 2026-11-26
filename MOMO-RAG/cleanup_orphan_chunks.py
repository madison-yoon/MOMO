"""전체 MySQL 리뷰 ID 스냅샷을 기준으로 Atlas 고아 청크를 수동 정리한다.

기본은 미리보기이며 --execute를 지정해야 삭제한다. READY만 추출하지 말고
존재하는 모든 리뷰 ID를 JSON 배열로 내보낸다. 원본 생성·색인을 멈춘 유지보수
시간에 최신 스냅샷으로 실행해야 두 저장소 사이의 변경 경쟁을 피할 수 있다.
"""
import argparse
import json
from pathlib import Path

from settings import Settings


def cleanup(collection, existing_ids, *, execute=False):
    """확인한 고아 ID만 삭제하며 본문·작성자·인증정보는 출력하지 않는다."""
    orphan_ids = sorted(set(collection.distinct("reviewId")) - set(existing_ids))
    deleted = 0
    if execute and orphan_ids:
        deleted = collection.delete_many({"reviewId": {"$in": orphan_ids}}).deleted_count
    return {"dry_run": not execute, "orphan_review_ids": orphan_ids, "deleted_chunks": deleted}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("existing_ids", type=Path, help="전체 원본 리뷰 ID의 JSON 배열 파일")
    parser.add_argument("--execute", action="store_true", help="실제 삭제 실행 (기본은 확인만)")
    args = parser.parse_args()
    ids = json.loads(args.existing_ids.read_text(encoding="utf-8"))
    if not isinstance(ids, list) or any(type(i) is not int or i <= 0 for i in ids):
        parser.error("원본 ID 파일은 양의 정수 JSON 배열이어야 합니다.")
    settings = Settings()
    if not settings.mongodb_uri:
        parser.error("MONGODB_URI 설정이 필요합니다.")
    from pymongo import MongoClient
    with MongoClient(settings.mongodb_uri, timeoutMS=int(settings.mongo_timeout_seconds * 1000),
                     retryReads=False, retryWrites=False) as client:
        result = cleanup(client[settings.mongodb_db][settings.mongodb_collection], ids,
                         execute=args.execute)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as failure:
        # 드라이버 예외에는 연결 주소가 포함될 수 있어 종류만 출력한다.
        raise SystemExit(f"정리 실패: {type(failure).__name__}") from None
