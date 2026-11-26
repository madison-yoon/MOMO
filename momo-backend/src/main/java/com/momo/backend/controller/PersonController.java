package com.momo.backend.controller;

import com.momo.backend.dto.person.PersonDetailResponse;
import com.momo.backend.service.PersonService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/persons")
@RequiredArgsConstructor
public class PersonController {

    private final PersonService personService;

    @GetMapping("/filmography/{tmdbId}")
    public ResponseEntity<java.util.Map<String, String>> resolveFilmographyMovie(@PathVariable @Min(1) @Max(9999999999L) long tmdbId) {
        return ResponseEntity.ok(java.util.Map.of(
                "movieCode", personService.resolveFilmographyMovie(tmdbId)
        ));
    }

    @GetMapping("/by-id/{type}/{personId}")
    public ResponseEntity<PersonDetailResponse> getPersonDetailById(
            @PathVariable @NotBlank @Size(max = 10) String type,
            @PathVariable @Min(1) @Max(9999999999L) long personId) {
        return ResponseEntity.ok(personService.getPersonDetailById(type, personId));
    }

    @GetMapping("/{type}/{name}")
    public ResponseEntity<PersonDetailResponse> getPersonDetail(
            @PathVariable @NotBlank @Size(max = 10) String type,
            @PathVariable @NotBlank @Size(max = 100) String name
    ) {
        return ResponseEntity.ok(
                personService.getPersonDetail(type, name)
        );
    }
}