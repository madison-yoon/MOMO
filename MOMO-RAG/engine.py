"""임베딩 없이 문자 2-gram 겹침으로 검색하는 메모리 엔진."""
import re
from dataclasses import dataclass
from threading import RLock
from langchain_text_splitters import RecursiveCharacterTextSplitter
from settings import Settings


ABSTAIN_MESSAGE = "관련 영화 리뷰에서 답변의 근거를 찾지 못했습니다. 질문을 바꾸거나 관련 리뷰를 작성해 주세요."

# 의미 추론 없이 질문의 상투적인 요청 표현만 제거하는 수업용 재작성 규칙이다.
_REWRITE_WORDS = ("알려주세요", "알려 주세요", "알려줘", "알려 줘", "궁금해요", "궁금해",
                  "어떤가요", "어때요", "어때", "인가요", "있나요", "하나요")


def body_of(text: str) -> str:
    """청크에 붙인 제목 줄을 제외한 본문을 답변과 출처 미리보기에 사용한다."""
    lines = text.split("\n", 1)
    return lines[1].strip() if len(lines) == 2 and lines[0].startswith("제목:") else text.strip()


@dataclass(frozen=True)
class Chunk:
    review_id: int
    movie_code: str
    title: str
    text: str
    score: float = 0.0


def bigrams(text: str) -> set[str]:
    """공백·기호를 제외한 연속 두 글자를 검색 단위로 만든다."""
    text = re.sub(r"[^0-9a-z가-힣]", "", text.lower())
    return {text[i:i + 2] for i in range(len(text) - 1)} if len(text) > 1 else set(text)


class StubEngine:
    """동일 ID는 통째로 교체한다. 재시작 시 모든 색인이 사라진다."""
    name = "stub"

    def __init__(self, settings: Settings):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size, chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        self.min_score = settings.stub_min_score
        self.store: dict[int, list[Chunk]] = {}
        self.lock = RLock()

    def index(self, review_id: int, movie_code: str, title: str, content: str) -> int:
        """제목을 각 청크에 붙이고 작성자 개인정보 없이 저장한다."""
        texts = self.splitter.split_text(content) or [""]
        chunks = [Chunk(review_id, movie_code, title, f"제목: {title}\n{text}") for text in texts]
        with self.lock:
            self.store[review_id] = chunks
        return len(chunks)

    def delete(self, review_id: int) -> int:
        """이미 없는 ID를 삭제하면 0을 반환한다."""
        with self.lock:
            return len(self.store.pop(review_id, []))

    def search(self, question: str, allowed_ids: list[int], k: int) -> list[Chunk]:
        """허용된 리뷰만 점수화한다. 호출자가 영화별 허용 ID를 결정해야 한다."""
        query = bigrams(question)
        if not query or not allowed_ids or k <= 0:
            return []
        with self.lock:
            candidates = [c for review_id in set(allowed_ids) for c in self.store.get(review_id, [])]
        result = []
        for c in candidates:
            score = len(query & bigrams(c.text)) / len(query)
            if score > 0 and score >= self.min_score:
                result.append(Chunk(c.review_id, c.movie_code, c.title, c.text, round(score, 3)))
        return sorted(result, key=lambda c: c.score, reverse=True)[:k]

    def rewrite(self, question: str) -> str:
        """검색 점수는 바꾸지 않고 요청 표현과 물음표만 제거한다. LLM은 호출하지 않는다."""
        query = question
        for word in _REWRITE_WORDS:
            query = query.replace(word, " ")
        return " ".join(re.sub(r"[?？]", " ", query).split()) or question

    def generate(self, question: str, chunks: list[Chunk]) -> str:
        """가장 유사한 청크의 일부를 인용한다. 여러 리뷰를 종합하거나 사실을 추론하지 않는다."""
        best = chunks[0]
        snippet = body_of(best.text).replace("\n", " ")[:150]
        return f"모의 답변 — ‘{best.title}’ 리뷰의 내용: {snippet} [리뷰 #{best.review_id}]"
