package in.gharkhata.repository;

import in.gharkhata.model.ReminderRule;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReminderRuleRepository extends JpaRepository<ReminderRule, TenantEntityId> {
    List<ReminderRule> findAllByOrganizationId(UUID organizationId);
}

