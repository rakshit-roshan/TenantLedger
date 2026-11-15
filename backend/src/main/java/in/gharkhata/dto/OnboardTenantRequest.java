package in.gharkhata.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class OnboardTenantRequest {
    public String name;
    public String email;
    public String phone;
    public String occupation;
    public String company;
    public String emergencyName;
    public String emergencyPhone;
    public String emergencyRelation;

    public UUID unitId;
    public LocalDateTime startDate;
    public LocalDateTime endDate;
    public long rentPaise;
    public long maintenancePaise;
    public long depositPaise;
    public int dueDay;
    public int graceDays;
    public double yearlyIncreasePercent;

    public String aadhaarNumber;
    public String panNumber;
    public String policeVerification;
}

