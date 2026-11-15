package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.model.BrokerageDeal;
import in.gharkhata.repository.BrokerageDealRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BrokerageService {

    private final BrokerageDealRepository dealRepository;
    private final AuditService auditService;

    public BrokerageService(BrokerageDealRepository dealRepository, AuditService auditService) {
        this.dealRepository = dealRepository;
        this.auditService = auditService;
    }

    public List<BrokerageDeal> getDeals() {
        UUID orgId = TenantContext.getOrgId();
        return dealRepository.findAllByOrganizationIdOrderByDealDateDesc(orgId);
    }

    @Transactional
    public BrokerageDeal createDeal(BrokerageDeal deal) {
        UUID orgId = TenantContext.getOrgId();
        deal.setOrganizationId(orgId);
        if (deal.getId() == null) {
            deal.setId(UUID.randomUUID());
        }
        BrokerageDeal saved = dealRepository.save(deal);
        auditService.log("BROKER_DEAL_CREATED", "BrokerageDeal", saved.getId().toString(),
                "Registered deal with " + saved.getBrokerName() + " for Unit " + saved.getUnitNumber(), null);
        return saved;
    }
}

