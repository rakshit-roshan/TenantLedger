package in.gharkhata.repository;

import in.gharkhata.model.NotificationLog;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, TenantEntityId> {
    List<NotificationLog> findAllByOrganizationIdOrderBySentAtDesc(UUID organizationId);
}

