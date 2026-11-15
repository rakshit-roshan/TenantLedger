package in.gharkhata.controller;

import in.gharkhata.dto.OnboardTenantRequest;
import in.gharkhata.model.Tenant;
import in.gharkhata.service.TenantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    public ResponseEntity<List<Tenant>> getTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @PostMapping("/onboard")
    public ResponseEntity<Tenant> onboardTenant(@RequestBody OnboardTenantRequest req) {
        return ResponseEntity.ok(tenantService.onboardTenant(req));
    }
}

