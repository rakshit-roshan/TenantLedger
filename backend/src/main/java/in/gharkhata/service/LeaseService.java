package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.model.Lease;
import in.gharkhata.model.Unit;
import in.gharkhata.repository.LeaseRepository;
import in.gharkhata.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LeaseService {

    private final LeaseRepository leaseRepository;
    private final UnitRepository unitRepository;
    private final AuditService auditService;

    public LeaseService(LeaseRepository leaseRepository, UnitRepository unitRepository, AuditService auditService) {
        this.leaseRepository = leaseRepository;
        this.unitRepository = unitRepository;
        this.auditService = auditService;
    }

    public List<Lease> getAllLeases() {
        UUID orgId = TenantContext.getOrgId();
        return leaseRepository.findAllByOrganizationId(orgId);
    }

    @Transactional
    public Lease renewLease(UUID leaseId, long newRentPaise, LocalDateTime newEndDate) {
        UUID orgId = TenantContext.getOrgId();
        Lease lease = leaseRepository.findByOrganizationIdAndId(orgId, leaseId)
                .orElseThrow(() -> new IllegalArgumentException("Lease not found"));

        long oldRent = lease.getRentPaise();
        lease.setRentPaise(newRentPaise > 0 ? newRentPaise : Math.round(oldRent * 1.08));
        if (newEndDate != null) {
            lease.setEndDate(newEndDate);
        } else {
            lease.setEndDate(lease.getEndDate().plusYears(1));
        }

        Lease saved = leaseRepository.save(lease);

        // Update unit rent
        unitRepository.findByOrganizationIdAndId(orgId, lease.getUnitId()).ifPresent(unit -> {
            unit.setBaseRentPaise(saved.getRentPaise());
            unitRepository.save(unit);
        });

        auditService.log("LEASE_RENEWED", "Lease", saved.getId().toString(),
                "Renewed lease for " + saved.getTenantName() + " (Unit " + saved.getUnitNumber() + ") with revised rent ₹" + (saved.getRentPaise() / 100), null);

        return saved;
    }
}

