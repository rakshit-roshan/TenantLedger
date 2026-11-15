package in.gharkhata.repository;

import in.gharkhata.model.MaintenanceTicket;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, TenantEntityId> {
    List<MaintenanceTicket> findAllByOrganizationIdOrderByReportedAtDesc(UUID organizationId);
    List<MaintenanceTicket> findAllByOrganizationIdAndBuildingIdOrderByReportedAtDesc(UUID organizationId, UUID buildingId);
    Optional<MaintenanceTicket> findByOrganizationIdAndId(UUID organizationId, UUID id);
}

