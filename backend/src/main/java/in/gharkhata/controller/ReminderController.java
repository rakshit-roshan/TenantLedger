package in.gharkhata.controller;

import in.gharkhata.model.NotificationLog;
import in.gharkhata.model.ReminderRule;
import in.gharkhata.service.ReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/reminders")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping("/rules")
    public ResponseEntity<List<ReminderRule>> getRules() {
        return ResponseEntity.ok(reminderService.getRules());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<NotificationLog>> getLogs() {
        return ResponseEntity.ok(reminderService.getLogs());
    }

    @PostMapping("/send")
    public ResponseEntity<NotificationLog> sendReminder(@RequestBody Map<String, String> body) {
        UUID unitId = UUID.fromString(body.get("unitId"));
        String channel = body.getOrDefault("channel", "WHATSAPP");
        return ResponseEntity.ok(reminderService.sendReminder(unitId, channel));
    }
}

