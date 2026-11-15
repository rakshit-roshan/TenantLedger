package in.gharkhata.controller;

import in.gharkhata.model.AuditLog;
import in.gharkhata.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditService.getAllLogs());
    }

    @PostMapping
    public ResponseEntity<Void> logClientClick(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String action = body.getOrDefault("action", "UI_CLICK");
        String targetEntity = body.getOrDefault("targetEntity", "NAVIGATION");
        String targetId = body.getOrDefault("targetId", "APP_BAR");
        String details = body.getOrDefault("details", "User interaction recorded");
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        auditService.log(action, targetEntity, targetId, details, ip);
        return ResponseEntity.ok().build();
    }
}
