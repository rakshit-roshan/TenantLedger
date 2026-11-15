package in.gharkhata.repository;

import in.gharkhata.model.PaymentReceipt;
import in.gharkhata.model.TenantEntityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, TenantEntityId> {
    List<PaymentReceipt> findAllByOrganizationIdOrderByPaymentDateDesc(UUID organizationId);
    Optional<PaymentReceipt> findByOrganizationIdAndId(UUID organizationId, UUID id);
    long countByOrganizationId(UUID organizationId);
}

