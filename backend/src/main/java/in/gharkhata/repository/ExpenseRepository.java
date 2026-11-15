package in.gharkhata.repository;

import in.gharkhata.model.Expense;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, TenantEntityId> {
    List<Expense> findAllByOrganizationIdOrderByDateDesc(UUID organizationId);
    List<Expense> findAllByOrganizationIdAndBuildingIdOrderByDateDesc(UUID organizationId, UUID buildingId);
}

