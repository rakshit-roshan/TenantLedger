package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.model.AuditLog;
import in.gharkhata.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(String action, String targetEntity, String targetId, String details, String ipAddress) {
        log(action, targetEntity, targetId, details, ipAddress, null);
    }

    @Transactional
    public void log(String action, String targetEntity, String targetId, String details, String ipAddress, String actorName) {
        UUID orgId = TenantContext.getOrgId();
        if (orgId == null) {
            orgId = UUID.fromString("11ee9999-0000-0000-0000-000000000001");
        }

        AuditLog log = new AuditLog();
        log.setOrganizationId(orgId);
        log.setId(UUID.randomUUID());
        log.setTimestamp(LocalDateTime.now());
        log.setUserName(actorName != null ? actorName : (TenantContext.getRole() != null ? TenantContext.getRole() : "Owner"));
        log.setUserRole(TenantContext.getRole() != null ? TenantContext.getRole() : "OWNER");
        log.setAction(action);
        log.setTargetEntity(targetEntity);
        log.setTargetId(targetId);
        log.setDetails(details);
        log.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");

        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllLogs() {
        UUID orgId = TenantContext.getOrgId();
        return auditLogRepository.findAllByOrganizationIdOrderByTimestampDesc(orgId);
    }
}

