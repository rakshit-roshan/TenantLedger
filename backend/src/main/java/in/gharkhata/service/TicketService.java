package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.model.MaintenanceTicket;
import in.gharkhata.repository.MaintenanceTicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    private final MaintenanceTicketRepository ticketRepository;
    private final AuditService auditService;

    public TicketService(MaintenanceTicketRepository ticketRepository, AuditService auditService) {
        this.ticketRepository = ticketRepository;
        this.auditService = auditService;
    }

    public List<MaintenanceTicket> getTickets(UUID buildingId) {
        UUID orgId = TenantContext.getOrgId();
        if (buildingId != null) {
            return ticketRepository.findAllByOrganizationIdAndBuildingIdOrderByReportedAtDesc(orgId, buildingId);
        }
        return ticketRepository.findAllByOrganizationIdOrderByReportedAtDesc(orgId);
    }

    @Transactional
    public MaintenanceTicket createTicket(MaintenanceTicket t) {
        UUID orgId = TenantContext.getOrgId();
        t.setOrganizationId(orgId);
        if (t.getId() == null) {
            t.setId(UUID.randomUUID());
        }
        if (t.getTicketNumber() == null || t.getTicketNumber().isBlank()) {
            t.setTicketNumber("TKT-" + System.currentTimeMillis() % 1000000);
        }
        t.setReportedAt(LocalDateTime.now());
        MaintenanceTicket saved = ticketRepository.save(t);
        auditService.log("TICKET_CREATED", "MaintenanceTicket", saved.getTicketNumber(),
                "New ticket logged for Unit " + saved.getUnitNumber() + " (" + saved.getCategory() + ")", null);
        return saved;
    }

    @Transactional
    public MaintenanceTicket updateStatus(UUID ticketId, String newStatus) {
        UUID orgId = TenantContext.getOrgId();
        MaintenanceTicket ticket = ticketRepository.findByOrganizationIdAndId(orgId, ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        String oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        if ("RESOLVED".equalsIgnoreCase(newStatus) || "COMPLETED".equalsIgnoreCase(newStatus)) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        MaintenanceTicket saved = ticketRepository.save(ticket);
        auditService.log("TICKET_STATUS_UPDATED", "MaintenanceTicket", saved.getTicketNumber(),
                "Status changed from " + oldStatus + " to " + newStatus, null);
        return saved;
    }
}

