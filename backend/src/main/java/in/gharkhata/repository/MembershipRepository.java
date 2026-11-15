package in.gharkhata.repository;

import in.gharkhata.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    List<Membership> findAllByUserId(UUID userId);
    Optional<Membership> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);
    Optional<Membership> findFirstByUserId(UUID userId);
    List<Membership> findAllByOrganizationId(UUID organizationId);
}

