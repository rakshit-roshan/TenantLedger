package in.gharkhata.controller;

import in.gharkhata.model.Lease;
import in.gharkhata.service.LeaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/leases")
public class LeaseController {

    private final LeaseService leaseService;

    public LeaseController(LeaseService leaseService) {
        this.leaseService = leaseService;
    }

    @GetMapping
    public ResponseEntity<List<Lease>> getLeases() {
        return ResponseEntity.ok(leaseService.getAllLeases());
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<Lease> renewLease(@PathVariable UUID id, @RequestBody(required = false) Map<String, Object> body) {
        long newRentPaise = 0;
        LocalDateTime newEndDate = null;
        if (body != null) {
            if (body.containsKey("newRentPaise")) {
                newRentPaise = Long.parseLong(body.get("newRentPaise").toString());
            }
            if (body.containsKey("newEndDate")) {
                newEndDate = LocalDateTime.parse(body.get("newEndDate").toString());
            }
        }
        return ResponseEntity.ok(leaseService.renewLease(id, newRentPaise, newEndDate));
    }
}

