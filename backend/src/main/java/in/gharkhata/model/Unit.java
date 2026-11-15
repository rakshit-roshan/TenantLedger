package in.gharkhata.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.TenantId;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "units")
@IdClass(TenantEntityId.class)
public class Unit {

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
    @Column(name = "building_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID buildingId;

    private String buildingName;
    private int floorNumber;

    @Column(nullable = false)
    private String unitNumber;

    @Column(nullable = false)
    private String type;

    private int areaSqft = 500;
    private long baseRentPaise = 0;
    private long maintenancePaise = 0;
    private long depositPaise = 0;

    @Column(nullable = false)
    private String status = "VACANT";

    @Column(nullable = false)
    private String paymentStatus = "VACANT";

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)")
    private UUID currentTenantId;

    private String currentTenantName;
    private String currentTenantPhone;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)")
    private UUID currentLeaseId;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Unit() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBuildingId() { return buildingId; }
    public void setBuildingId(UUID buildingId) { this.buildingId = buildingId; }

    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

    public int getFloorNumber() { return floorNumber; }
    public void setFloorNumber(int floorNumber) { this.floorNumber = floorNumber; }

    public String getUnitNumber() { return unitNumber; }
    public void setUnitNumber(String unitNumber) { this.unitNumber = unitNumber; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getAreaSqft() { return areaSqft; }
    public void setAreaSqft(int areaSqft) { this.areaSqft = areaSqft; }

    public long getBaseRentPaise() { return baseRentPaise; }
    public void setBaseRentPaise(long baseRentPaise) { this.baseRentPaise = baseRentPaise; }

    public long getMaintenancePaise() { return maintenancePaise; }
    public void setMaintenancePaise(long maintenancePaise) { this.maintenancePaise = maintenancePaise; }

    public long getDepositPaise() { return depositPaise; }
    public void setDepositPaise(long depositPaise) { this.depositPaise = depositPaise; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public UUID getCurrentTenantId() { return currentTenantId; }
    public void setCurrentTenantId(UUID currentTenantId) { this.currentTenantId = currentTenantId; }

    public String getCurrentTenantName() { return currentTenantName; }
    public void setCurrentTenantName(String currentTenantName) { this.currentTenantName = currentTenantName; }

    public String getCurrentTenantPhone() { return currentTenantPhone; }
    public void setCurrentTenantPhone(String currentTenantPhone) { this.currentTenantPhone = currentTenantPhone; }

    public UUID getCurrentLeaseId() { return currentLeaseId; }
    public void setCurrentLeaseId(UUID currentLeaseId) { this.currentLeaseId = currentLeaseId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

