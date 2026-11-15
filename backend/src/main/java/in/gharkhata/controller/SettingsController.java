package in.gharkhata.controller;

import in.gharkhata.model.Organization;
import in.gharkhata.model.User;
import in.gharkhata.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        return ResponseEntity.ok(settingsService.getCurrentUserProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String phone = body.get("phone");
        String avatarUrl = body.get("avatarUrl");
        return ResponseEntity.ok(settingsService.updateProfile(name, email, phone, avatarUrl));
    }

    @GetMapping("/organization")
    public ResponseEntity<Organization> getOrganization() {
        return ResponseEntity.ok(settingsService.getCurrentOrganization());
    }

    @PutMapping("/organization")
    public ResponseEntity<Organization> updateOrganization(@RequestBody Organization org) {
        return ResponseEntity.ok(settingsService.updateOrganization(org));
    }
}

