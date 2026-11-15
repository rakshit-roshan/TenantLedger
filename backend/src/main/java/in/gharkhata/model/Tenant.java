package in.gharkhata.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.TenantId;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
@IdClass(TenantEntityId.class)
public class Tenant {

    @Id
    @TenantId
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "organization_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID organizationId;

    @Id
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)", nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String email;

    @Column(nullable = false)
    private String phone;

    private String occupation;
    private String company;

    @Column(columnDefinition = "JSON")
    private String emergencyContactJson;

    @Column(columnDefinition = "JSON")
    private String kycJson;

    private String policeVerificationStatus = "PENDING";
    private boolean isBlacklisted = false;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)")
    private UUID currentUnitId;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)")
    private UUID currentLeaseId;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Tenant() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getEmergencyContactJson() { return emergencyContactJson; }
    public void setEmergencyContactJson(String emergencyContactJson) { this.emergencyContactJson = emergencyContactJson; }

    public String getKycJson() { return kycJson; }
    public void setKycJson(String kycJson) { this.kycJson = kycJson; }

    public String getPoliceVerificationStatus() { return policeVerificationStatus; }
    public void setPoliceVerificationStatus(String policeVerificationStatus) { this.policeVerificationStatus = policeVerificationStatus; }

    public boolean isBlacklisted() { return isBlacklisted; }
    public void setBlacklisted(boolean blacklisted) { isBlacklisted = blacklisted; }

    public UUID getCurrentUnitId() { return currentUnitId; }
    public void setCurrentUnitId(UUID currentUnitId) { this.currentUnitId = currentUnitId; }

    public UUID getCurrentLeaseId() { return currentLeaseId; }
    public void setCurrentLeaseId(UUID currentLeaseId) { this.currentLeaseId = currentLeaseId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

