package in.gharkhata.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.TenantId;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "brokerage_deals")
@IdClass(TenantEntityId.class)
public class BrokerageDeal {

    @Id
    @TenantId
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "organization_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID organizationId;

    @Id
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)", nullable = false)
    private UUID id;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)")
    private UUID brokerOrgId;

    @Column(nullable = false)
    private String brokerName;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false)
    private String unitNumber;

    @Column(nullable = false)
    private String buildingName;

    @Column(nullable = false)
    private String dealType;

    @Column(nullable = false)
    private long commissionAmountPaise;

    @Column(nullable = false)
    private LocalDateTime dealDate;

    @Column(nullable = false)
    private LocalDateTime renewalDueDate;

    @Column(nullable = false)
    private String status = "RECEIVED";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public BrokerageDeal() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBrokerOrgId() { return brokerOrgId; }
    public void setBrokerOrgId(UUID brokerOrgId) { this.brokerOrgId = brokerOrgId; }

    public String getBrokerName() { return brokerName; }
    public void setBrokerName(String brokerName) { this.brokerName = brokerName; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getUnitNumber() { return unitNumber; }
    public void setUnitNumber(String unitNumber) { this.unitNumber = unitNumber; }

    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

    public String getDealType() { return dealType; }
    public void setDealType(String dealType) { this.dealType = dealType; }

    public long getCommissionAmountPaise() { return commissionAmountPaise; }
    public void setCommissionAmountPaise(long commissionAmountPaise) { this.commissionAmountPaise = commissionAmountPaise; }

    public LocalDateTime getDealDate() { return dealDate; }
    public void setDealDate(LocalDateTime dealDate) { this.dealDate = dealDate; }

    public LocalDateTime getRenewalDueDate() { return renewalDueDate; }
    public void setRenewalDueDate(LocalDateTime renewalDueDate) { this.renewalDueDate = renewalDueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

