package in.gharkhata.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class RecordPaymentRequest {
    public UUID leaseId;
    public String tenantName;
    public String unitNumber;
    public String buildingName;
    public long amountPaise;
    public String paymentMethod;
    public String referenceNumber;
    public LocalDateTime paymentDate;
    public String notes;
}

