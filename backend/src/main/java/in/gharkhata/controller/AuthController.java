package in.gharkhata.controller;

import in.gharkhata.dto.AuthResponse;
import in.gharkhata.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        if (identifier == null || identifier.isBlank()) {
            identifier = body.get("email");
        }
        String password = body.get("password");
        if (identifier == null || identifier.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email address and password are required to sign in.");
        }
        AuthResponse res = authService.login(identifier, "PASSWORD", password);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody Map<String, String> body) {
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");
        String email = body.get("email");
        String phone = body.get("phone");
        String password = body.get("password");

        if ((firstName == null || firstName.isBlank()) && body.get("name") != null) {
            String[] parts = body.get("name").trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        if (firstName == null || firstName.isBlank()) {
            throw new IllegalArgumentException("First Name is required.");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Mobile number is required.");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        AuthResponse res = authService.register(firstName, lastName, email, phone, password);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentSession());
    }
}
