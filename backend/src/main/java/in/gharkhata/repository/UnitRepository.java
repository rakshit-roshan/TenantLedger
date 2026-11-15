package in.gharkhata.repository;

import in.gharkhata.model.TenantEntityId;
import in.gharkhata.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UnitRepository extends JpaRepository<Unit, TenantEntityId> {
    List<Unit> findAllByOrganizationId(UUID organizationId);
    List<Unit> findAllByOrganizationIdAndBuildingId(UUID organizationId, UUID buildingId);
    Optional<Unit> findByOrganizationIdAndId(UUID organizationId, UUID id);
}

