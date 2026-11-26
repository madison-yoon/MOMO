package com.momo.backend.rag.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/** RagQueryReader의 MySQL/H2와 동일한 UTF-8·문자 수 길이 접두어 규칙. */
public final class ReviewFingerprint {
    private ReviewFingerprint() { }
    public static String of(String title, String content, String movieCode) {
        String framed = frame(title) + frame(content) + frame(movieCode);
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(framed.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    private static String frame(String value) { return value.codePointCount(0,value.length()) + ":" + value; }
}
