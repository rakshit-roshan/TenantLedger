package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.model.Organization;
import in.gharkhata.model.User;
import in.gharkhata.repository.OrganizationRepository;
import in.gharkhata.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SettingsService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    public SettingsService(UserRepository userRepository, OrganizationRepository organizationRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.auditService = auditService;
    }

    public User getCurrentUserProfile() {
        UUID userId = TenantContext.getUserId();
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().orElseThrow());
        }
        return userRepository.findAll().stream().findFirst().orElseThrow();
    }

    @Transactional
    public User updateProfile(String name, String email, String phone, String avatarUrl) {
        User user = getCurrentUserProfile();
        if (name != null && !name.isBlank()) user.setName(name);
        if (email != null && !email.isBlank()) user.setEmail(email);
        if (phone != null && !phone.isBlank()) user.setPhone(phone);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);

        User saved = userRepository.save(user);
        auditService.log("PROFILE_UPDATED", "User", saved.getId().toString(),
                "Updated profile details for " + saved.getName(), null);
        return saved;
    }

    public Organization getCurrentOrganization() {
        UUID orgId = TenantContext.getOrgId();
        if (orgId != null) {
            return organizationRepository.findById(orgId)
                    .orElseGet(() -> organizationRepository.findAll().stream().findFirst().orElseThrow());
        }
        return organizationRepository.findAll().stream().findFirst().orElseThrow();
    }

    @Transactional
    public Organization updateOrganization(Organization updated) {
        Organization org = getCurrentOrganization();
        if (updated.getName() != null) org.setName(updated.getName());
        if (updated.getPan() != null) org.setPan(updated.getPan());
        if (updated.getGstin() != null) org.setGstin(updated.getGstin());
        if (updated.getRera() != null) org.setRera(updated.getRera());
        if (updated.getAddress() != null) org.setAddress(updated.getAddress());
        if (updated.getCity() != null) org.setCity(updated.getCity());
        if (updated.getState() != null) org.setState(updated.getState());
        if (updated.getPincode() != null) org.setPincode(updated.getPincode());
        if (updated.getBankName() != null) org.setBankName(updated.getBankName());
        if (updated.getAccountNumberMasked() != null) org.setAccountNumberMasked(updated.getAccountNumberMasked());
        if (updated.getIfscCode() != null) org.setIfscCode(updated.getIfscCode());

        Organization saved = organizationRepository.save(org);
        auditService.log("ORG_SETTINGS_UPDATED", "Organization", saved.getId().toString(),
                "Updated organization details for " + saved.getName(), null);
        return saved;
    }
}

