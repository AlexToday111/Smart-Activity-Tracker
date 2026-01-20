package com.example.ActivityTracker.mapper;


import com.example.ActivityTracker.dto.EventRequestDto;
import com.example.ActivityTracker.dto.EventResponseDto;
import com.example.ActivityTracker.model.Event;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    // DTO to Entity
    public Event toEntity(EventRequestDto dto) {

        if (dto == null) {
            return null;
        }

        Event event = new Event();
        event.setUserId(dto.getUserId());
        event.setEventType(dto.getEventType());
        event.setMetadata(dto.getMetadata());
        event.setEventTime(dto.getEventTime());

        return event;
    }

    // Entity to DTO
    public EventResponseDto toDto(Event event) {
        if (event == null) {
            return null;
        }
        EventResponseDto dto = new EventResponseDto();
        dto.setId(event.getId());
        dto.setUserId(event.getUserId());
        dto.setEventType(event.getEventType());
        dto.setMetadata(event.getMetadata());
        dto.setEventTime(event.getEventTime());

        return dto;
    }
}
