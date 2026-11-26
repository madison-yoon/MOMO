package com.momo.backend.rag.enums;

// 대기와 진행을 INDEXING으로 함께 표현한다. 실제 시도 실패만 FAILED다.
public enum IndexStatus { INDEXING, READY, FAILED }
