package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.dto.RecordPaymentRequest;
import in.gharkhata.model.PaymentReceipt;
import in.gharkhata.model.TenantEntityId;
import in.gharkhata.repository.PaymentReceiptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentReceiptRepository receiptRepository;
    private final AuditService auditService;

    public PaymentService(PaymentReceiptRepository receiptRepository, AuditService auditService) {
        this.receiptRepository = receiptRepository;
        this.auditService = auditService;
    }

    public List<PaymentReceipt> getAllReceipts() {
        UUID orgId = TenantContext.getOrgId();
        return receiptRepository.findAllByOrganizationIdOrderByPaymentDateDesc(orgId);
    }

    @Transactional
    public PaymentReceipt recordPayment(RecordPaymentRequest req) {
        UUID orgId = TenantContext.getOrgId();
        long count = receiptRepository.countByOrganizationId(orgId);
        int year = Year.now().getValue();
        String nextSeq = String.format("%04d", count + 413);
        String receiptNumber = "GK/" + year + "-" + ((year + 1) % 100) + "/" + nextSeq;

        PaymentReceipt receipt = new PaymentReceipt();
        receipt.setOrganizationId(orgId);
        receipt.setId(UUID.randomUUID());
        receipt.setReceiptNumber(receiptNumber);
        receipt.setLeaseId(req.leaseId != null ? req.leaseId : UUID.randomUUID());
        receipt.setTenantName(req.tenantName);
        receipt.setUnitNumber(req.unitNumber);
        receipt.setBuildingName(req.buildingName);
        receipt.setAmountPaise(req.amountPaise);
        receipt.setPaymentMethod(req.paymentMethod != null ? req.paymentMethod : "UPI");
        receipt.setReferenceNumber(req.referenceNumber);
        receipt.setPaymentDate(req.paymentDate != null ? req.paymentDate : LocalDateTime.now());
        receipt.setStatus("COMPLETED");
        receipt.setRecordedBy("Vikram Deshmukh (Owner)");
        receipt.setNotes(req.notes);

        PaymentReceipt saved = receiptRepository.save(receipt);

        auditService.log("PAYMENT_RECORDED", "PaymentReceipt", saved.getId().toString(),
                "Issued receipt " + receiptNumber + " for amount ₹" + (req.amountPaise / 100) + " to " + req.tenantName, null);

        return saved;
    }

    @Transactional
    public PaymentReceipt reversePayment(UUID receiptId, String reason) {
        UUID orgId = TenantContext.getOrgId();
        PaymentReceipt receipt = receiptRepository.findByOrganizationIdAndId(orgId, receiptId)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found"));

        receipt.setStatus("REVERSED");
        receipt.setNotes((receipt.getNotes() != null ? receipt.getNotes() : "") + " [REVERSED: " + reason + "]");

        PaymentReceipt updated = receiptRepository.save(receipt);

        auditService.log("PAYMENT_REVERSED", "PaymentReceipt", receiptId.toString(),
                "Reversed receipt " + receipt.getReceiptNumber() + ". Reason: " + reason, null);

        return updated;
    }
}

