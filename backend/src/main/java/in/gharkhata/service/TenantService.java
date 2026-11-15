package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.dto.OnboardTenantRequest;
import in.gharkhata.model.Lease;
import in.gharkhata.model.Tenant;
import in.gharkhata.model.Unit;
import in.gharkhata.repository.LeaseRepository;
import in.gharkhata.repository.TenantRepository;
import in.gharkhata.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UnitRepository unitRepository;
    private final LeaseRepository leaseRepository;
    private final AuditService auditService;

    public TenantService(TenantRepository tenantRepository, UnitRepository unitRepository, LeaseRepository leaseRepository, AuditService auditService) {
        this.tenantRepository = tenantRepository;
        this.unitRepository = unitRepository;
        this.leaseRepository = leaseRepository;
        this.auditService = auditService;
    }

    public List<Tenant> getAllTenants() {
        UUID orgId = TenantContext.getOrgId();
        return tenantRepository.findAllByOrganizationId(orgId);
    }

    @Transactional
    public Tenant onboardTenant(OnboardTenantRequest req) {
        UUID orgId = TenantContext.getOrgId();

        Unit unit = unitRepository.findByOrganizationIdAndId(orgId, req.unitId)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found"));

        UUID tenantId = UUID.randomUUID();
        UUID leaseId = UUID.randomUUID();

        // 1. Create Tenant
        Tenant tenant = new Tenant();
        tenant.setOrganizationId(orgId);
        tenant.setId(tenantId);
        tenant.setName(req.name);
        tenant.setEmail(req.email);
        tenant.setPhone(req.phone);
        tenant.setOccupation(req.occupation);
        tenant.setCompany(req.company);
        tenant.setCurrentUnitId(unit.getId());
        tenant.setCurrentLeaseId(leaseId);
        tenant.setPoliceVerificationStatus(req.policeVerification != null ? req.policeVerification : "VERIFIED");

        tenantRepository.save(tenant);

        // 2. Create Lease
        Lease lease = new Lease();
        lease.setOrganizationId(orgId);
        lease.setId(leaseId);
        lease.setBuildingId(unit.getBuildingId());
        lease.setUnitId(unit.getId());
        lease.setTenantId(tenantId);
        lease.setUnitNumber(unit.getUnitNumber());
        lease.setTenantName(req.name);
        lease.setStartDate(req.startDate != null ? req.startDate : LocalDateTime.now());
        lease.setEndDate(req.endDate != null ? req.endDate : LocalDateTime.now().plusMonths(11));
        lease.setRentPaise(req.rentPaise > 0 ? req.rentPaise : unit.getBaseRentPaise());
        lease.setMaintenancePaise(req.maintenancePaise);
        lease.setDueDay(req.dueDay > 0 ? req.dueDay : 5);
        lease.setGraceDays(req.graceDays > 0 ? req.graceDays : 5);
        lease.setYearlyIncreasePercent(BigDecimal.valueOf(req.yearlyIncreasePercent > 0 ? req.yearlyIncreasePercent : 8.0));
        lease.setDepositPaise(req.depositPaise);
        lease.setStatus("ACTIVE");

        leaseRepository.save(lease);

        // 3. Update Unit
        unit.setStatus("OCCUPIED");
        unit.setPaymentStatus("PAID");
        unit.setCurrentTenantId(tenantId);
        unit.setCurrentTenantName(req.name);
        unit.setCurrentTenantPhone(req.phone);
        unit.setCurrentLeaseId(leaseId);
        unit.setBaseRentPaise(lease.getRentPaise());
        unit.setMaintenancePaise(lease.getMaintenancePaise());
        unit.setDepositPaise(lease.getDepositPaise());

        unitRepository.save(unit);

        // 4. Audit
        auditService.log("TENANT_ONBOARDED", "Unit", unit.getId().toString(),
                "Onboarded tenant " + req.name + " to Unit " + unit.getUnitNumber() + " (" + unit.getBuildingName() + ")", null);

        return tenant;
    }
}

