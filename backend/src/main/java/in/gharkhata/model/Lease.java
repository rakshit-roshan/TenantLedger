package in.gharkhata.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.TenantId;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leases")
@IdClass(TenantEntityId.class)
public class Lease {

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
    @Column(columnDefinition = "BINARY(16)", nullable = false)
    private UUID buildingId;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)", nullable = false)
    private UUID unitId;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String unitNumber;

    @Column(nullable = false)
    private String tenantName;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    private long rentPaise;
    private long maintenancePaise = 0;
    private int dueDay = 5;
    private int graceDays = 5;
    private BigDecimal lateFeePercent = BigDecimal.valueOf(2.0);
    private BigDecimal yearlyIncreasePercent = BigDecimal.valueOf(8.0);
    private long depositPaise = 0;

    @Column(nullable = false)
    private String status = "ACTIVE";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Lease() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBuildingId() { return buildingId; }
    public void setBuildingId(UUID buildingId) { this.buildingId = buildingId; }

    public UUID getUnitId() { return unitId; }
    public void setUnitId(UUID unitId) { this.unitId = unitId; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getUnitNumber() { return unitNumber; }
    public void setUnitNumber(String unitNumber) { this.unitNumber = unitNumber; }

    public String getTenantName() { return tenantName; }
    public void setTenantName(String tenantName) { this.tenantName = tenantName; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public long getRentPaise() { return rentPaise; }
    public void setRentPaise(long rentPaise) { this.rentPaise = rentPaise; }

    public long getMaintenancePaise() { return maintenancePaise; }
    public void setMaintenancePaise(long maintenancePaise) { this.maintenancePaise = maintenancePaise; }

    public int getDueDay() { return dueDay; }
    public void setDueDay(int dueDay) { this.dueDay = dueDay; }

    public int getGraceDays() { return graceDays; }
    public void setGraceDays(int graceDays) { this.graceDays = graceDays; }

    public BigDecimal getLateFeePercent() { return lateFeePercent; }
    public void setLateFeePercent(BigDecimal lateFeePercent) { this.lateFeePercent = lateFeePercent; }

    public BigDecimal getYearlyIncreasePercent() { return yearlyIncreasePercent; }
    public void setYearlyIncreasePercent(BigDecimal yearlyIncreasePercent) { this.yearlyIncreasePercent = yearlyIncreasePercent; }

    public long getDepositPaise() { return depositPaise; }
    public void setDepositPaise(long depositPaise) { this.depositPaise = depositPaise; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

