package in.gharkhata.repository;

import in.gharkhata.model.Building;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BuildingRepository extends JpaRepository<Building, TenantEntityId> {
    List<Building> findAllByOrganizationId(UUID organizationId);
    Optional<Building> findByOrganizationIdAndId(UUID organizationId, UUID id);
}

