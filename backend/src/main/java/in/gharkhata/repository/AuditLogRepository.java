package in.gharkhata.repository;

import in.gharkhata.model.AuditLog;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, TenantEntityId> {
    List<AuditLog> findAllByOrganizationIdOrderByTimestampDesc(UUID organizationId);
}

