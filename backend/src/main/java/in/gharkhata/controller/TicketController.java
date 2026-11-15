package in.gharkhata.controller;

import in.gharkhata.model.MaintenanceTicket;
import in.gharkhata.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceTicket>> getTickets(@RequestParam(required = false) UUID buildingId) {
        return ResponseEntity.ok(ticketService.getTickets(buildingId));
    }

    @PostMapping
    public ResponseEntity<MaintenanceTicket> createTicket(@RequestBody MaintenanceTicket ticket) {
        return ResponseEntity.ok(ticketService.createTicket(ticket));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MaintenanceTicket> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "IN_PROGRESS");
        return ResponseEntity.ok(ticketService.updateStatus(id, status));
    }
}

