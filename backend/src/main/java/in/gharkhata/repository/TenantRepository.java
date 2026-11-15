package in.gharkhata.repository;

import in.gharkhata.model.Tenant;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, TenantEntityId> {
    List<Tenant> findAllByOrganizationId(UUID organizationId);
    Optional<Tenant> findByOrganizationIdAndId(UUID organizationId, UUID id);
}

