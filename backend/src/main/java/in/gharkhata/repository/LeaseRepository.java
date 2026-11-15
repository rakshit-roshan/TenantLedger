package in.gharkhata.repository;

import in.gharkhata.model.Lease;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaseRepository extends JpaRepository<Lease, TenantEntityId> {
    List<Lease> findAllByOrganizationId(UUID organizationId);
    Optional<Lease> findByOrganizationIdAndId(UUID organizationId, UUID id);
}

