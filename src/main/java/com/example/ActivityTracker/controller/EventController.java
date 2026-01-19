package com.example.ActivityTracker.controller;

import com.example.ActivityTracker.dto.EventResponseDto;
import com.example.ActivityTracker.model.Event;
import com.example.ActivityTracker.service.EventService;
import com.example.ActivityTracker.mapper.EventMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;
    private final EventMapper eventMapper;

    public EventController(EventService eventService, EventMapper eventMapper) {
        this.eventService = eventService;
        this.eventMapper = eventMapper;
    }

    @GetMapping
    public List<EventResponseDto> getAllEvents() {
        return eventService.getAllEvents()
                .stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDto> getEvent(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(eventMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EventResponseDto> createEvent(@RequestBody @Valid EventResponseDto dto) {
        Event event = eventMapper.toEntity(dto);
        Event savedEvent = eventService.createEvent(event);
        return ResponseEntity.ok(eventMapper.toDto(savedEvent));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDto> updateEvent(@PathVariable Long id,
                                                        @RequestBody @Valid EventRequestDto dto) {
        Event event = eventMapper.toEntity(dto);
        Event updateEvent = eventService.updateEvent(id, event);
        return ResponseEntity.ok(eventMapper.toDto(updateEvent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
