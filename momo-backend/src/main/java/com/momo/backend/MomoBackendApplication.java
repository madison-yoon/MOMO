package com.momo.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // 매일 정해진 시간(03:00) 특정 메서드를 자동 실행하기 위해 추가함
public class MomoBackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(MomoBackendApplication.class, args);
	}

}
