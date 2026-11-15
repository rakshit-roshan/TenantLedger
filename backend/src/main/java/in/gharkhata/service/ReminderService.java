package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.model.NotificationLog;
import in.gharkhata.model.ReminderRule;
import in.gharkhata.model.Unit;
import in.gharkhata.repository.NotificationLogRepository;
import in.gharkhata.repository.ReminderRuleRepository;
import in.gharkhata.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReminderService {

    private final ReminderRuleRepository ruleRepository;
    private final NotificationLogRepository logRepository;
    private final UnitRepository unitRepository;
    private final AuditService auditService;

    public ReminderService(ReminderRuleRepository ruleRepository,
                           NotificationLogRepository logRepository,
                           UnitRepository unitRepository,
                           AuditService auditService) {
        this.ruleRepository = ruleRepository;
        this.logRepository = logRepository;
        this.unitRepository = unitRepository;
        this.auditService = auditService;
    }

    public List<ReminderRule> getRules() {
        UUID orgId = TenantContext.getOrgId();
        return ruleRepository.findAllByOrganizationId(orgId);
    }

    public List<NotificationLog> getLogs() {
        UUID orgId = TenantContext.getOrgId();
        return logRepository.findAllByOrganizationIdOrderBySentAtDesc(orgId);
    }

    @Transactional
    public NotificationLog sendReminder(UUID unitId, String channel) {
        UUID orgId = TenantContext.getOrgId();
        Unit unit = unitRepository.findByOrganizationIdAndId(orgId, unitId)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found"));

        NotificationLog log = new NotificationLog();
        log.setOrganizationId(orgId);
        log.setId(UUID.randomUUID());
        log.setRecipientName(unit.getCurrentTenantName() != null ? unit.getCurrentTenantName() : "Tenant");
        log.setRecipientPhoneOrEmail(unit.getCurrentTenantPhone() != null ? unit.getCurrentTenantPhone() : "+91 98000 00000");
        log.setChannel(channel != null ? channel.toUpperCase() : "WHATSAPP");
        log.setMessagePreview("Rent reminder for Unit " + unit.getUnitNumber() + ": ₹" + (unit.getBaseRentPaise() / 100) + " due. Pay via UPI: https://upi.gharkhata.in/p/" + unit.getUnitNumber());
        log.setStatus("SENT");
        log.setSentAt(LocalDateTime.now());
        log.setCostPaise(channel.equalsIgnoreCase("WHATSAPP") ? 45 : 15);

        NotificationLog saved = logRepository.save(log);

        auditService.log("REMINDER_DISPATCHED", "Notification", saved.getId().toString(),
                "Dispatched " + channel + " reminder to " + saved.getRecipientName() + " for Unit " + unit.getUnitNumber(), null);

        return saved;
    }
}

