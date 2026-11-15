package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.model.Expense;
import in.gharkhata.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AuditService auditService;

    public ExpenseService(ExpenseRepository expenseRepository, AuditService auditService) {
        this.expenseRepository = expenseRepository;
        this.auditService = auditService;
    }

    public List<Expense> getExpenses(UUID buildingId) {
        UUID orgId = TenantContext.getOrgId();
        if (buildingId != null) {
            return expenseRepository.findAllByOrganizationIdAndBuildingIdOrderByDateDesc(orgId, buildingId);
        }
        return expenseRepository.findAllByOrganizationIdOrderByDateDesc(orgId);
    }

    @Transactional
    public Expense createExpense(Expense expense) {
        UUID orgId = TenantContext.getOrgId();
        expense.setOrganizationId(orgId);
        if (expense.getId() == null) {
            expense.setId(UUID.randomUUID());
        }
        if (expense.getDate() == null) {
            expense.setDate(LocalDateTime.now());
        }
        Expense saved = expenseRepository.save(expense);
        auditService.log("EXPENSE_RECORDED", "Expense", saved.getId().toString(),
                "Recorded expense ₹" + (saved.getAmountPaise() / 100) + " under " + saved.getCategory(), null);
        return saved;
    }
}

