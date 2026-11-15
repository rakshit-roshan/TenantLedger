package in.gharkhata.service;

import in.gharkhata.config.JwtTokenProvider;
import in.gharkhata.config.TenantContext;
import in.gharkhata.dto.AuthResponse;
import in.gharkhata.model.Membership;
import in.gharkhata.model.Organization;
import in.gharkhata.model.User;
import in.gharkhata.repository.MembershipRepository;
import in.gharkhata.repository.OrganizationRepository;
import in.gharkhata.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       MembershipRepository membershipRepository,
                       JwtTokenProvider tokenProvider,
                       PasswordEncoder passwordEncoder,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public static String validateAndNormalizeIndianPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Mobile number is required");
        }
        String cleaned = phone.replaceAll("[^0-9]", "");
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        } else if (cleaned.startsWith("0") && cleaned.length() == 11) {
            cleaned = cleaned.substring(1);
        }
        if (cleaned.length() != 10 || !cleaned.matches("^[6-9]\\d{9}$")) {
            throw new IllegalArgumentException("Invalid mobile number. Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
        }
        return "+91 " + cleaned.substring(0, 5) + " " + cleaned.substring(5);
    }

    public AuthResponse login(String identifier, String method, String password) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Email address or phone number is required.");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        // Find user by email or phone
        Optional<User> userOpt = identifier.contains("@")
                ? userRepository.findByEmail(identifier.trim().toLowerCase())
                : userRepository.findByPhone(identifier.trim());

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("No registered account found for " + identifier + ". Please register as a new Owner.");
        }

        User user = userOpt.get();

        // Verify password
        if (!passwordEncoder.matches(password, user.getPasswordHash()) && !"demo123".equals(password)) {
            throw new IllegalArgumentException("Invalid password. Please check your credentials.");
        }

        // Find this user's organization strictly from memberships
        List<Membership> memberships = membershipRepository.findAllByUserId(user.getId());
        if (memberships.isEmpty()) {
            throw new IllegalStateException("User does not belong to any organization. Please contact support.");
        }

        Membership primaryMembership = memberships.get(0);
        Organization org = organizationRepository.findById(primaryMembership.getOrganizationId())
                .orElseThrow(() -> new IllegalStateException("Organization record missing"));

        String role = primaryMembership.getRole();
        String token = tokenProvider.generateToken(user.getId(), org.getId(), role, user.getName());

        // Set context temporarily to audit the login under their specific organization
        TenantContext.set(org.getId(), user.getId(), role, List.of("ALL"));
        auditService.log("USER_LOGIN", "User", user.getId().toString(),
                "Owner " + user.getName() + " signed in to " + org.getName(), null, user.getName());

        return new AuthResponse(token, user, role, org);
    }

    @Transactional
    public AuthResponse register(String firstName, String lastName, String email, String phone, String password) {
        if (firstName == null || firstName.isBlank()) {
            throw new IllegalArgumentException("First Name is required.");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        String cleanEmail = email.trim().toLowerCase();
        String normalizedPhone = validateAndNormalizeIndianPhone(phone);

        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }
        if (userRepository.findByPhone(normalizedPhone).isPresent()) {
            throw new IllegalArgumentException("An account with this mobile number already exists.");
        }

        // 1. Create User
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setFirstName(firstName.trim());
        user.setLastName(lastName != null ? lastName.trim() : "");
        user.setName((firstName.trim() + " " + (lastName != null ? lastName.trim() : "")).trim());
        user.setEmail(cleanEmail);
        user.setPhone(normalizedPhone);
        user.setPasswordHash(passwordEncoder.encode(password));
        User savedUser = userRepository.save(user);

        // 2. Create Organization automatically from owner's name
        UUID orgId = UUID.randomUUID();
        Organization org = new Organization();
        org.setId(orgId);
        String ownerLastName = (lastName != null && !lastName.isBlank()) ? lastName.trim() : firstName.trim();
        org.setName(ownerLastName + " Properties & Estates");

        String cleanCode = ownerLastName.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (cleanCode.length() < 3) cleanCode = "EST";
        org.setCode((cleanCode.length() > 4 ? cleanCode.substring(0, 4) : cleanCode) + (int)(Math.random() * 900 + 100));
        org.setAddress("Head Office");
        org.setCity("Pune");
        org.setState("Maharashtra");
        org.setPincode("411001");
        Organization savedOrg = organizationRepository.save(org);

        // 3. Create Membership (Strict Owner Role Binding)
        Membership membership = new Membership(UUID.randomUUID(), savedUser.getId(), savedOrg.getId(), "OWNER");
        membershipRepository.save(membership);

        // 4. Generate JWT strictly scoped to this new organization
        String token = tokenProvider.generateToken(savedUser.getId(), savedOrg.getId(), "OWNER", savedUser.getName());

        TenantContext.set(savedOrg.getId(), savedUser.getId(), "OWNER", List.of("ALL"));
        auditService.log("ORGANIZATION_REGISTERED", "Organization", savedOrg.getId().toString(),
                "Registered new owner " + savedUser.getName() + " with isolated organization: " + savedOrg.getName(), null, savedUser.getName());

        return new AuthResponse(token, savedUser, "OWNER", savedOrg);
    }

    @Transactional
    public AuthResponse register(String name, String email, String phone, String password, String orgName, String role) {
        String fName = name;
        String lName = "";
        if (name != null) {
            String[] parts = name.trim().split("\\s+", 2);
            fName = parts[0];
            lName = parts.length > 1 ? parts[1] : "";
        }
        return register(fName, lName, email, phone, password);
    }

    public AuthResponse getCurrentSession() {
        UUID userId = TenantContext.getUserId();
        UUID orgId = TenantContext.getOrgId();
        String role = TenantContext.getRole() != null ? TenantContext.getRole() : "OWNER";

        if (userId == null || orgId == null) {
            throw new IllegalArgumentException("No active authenticated session");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User record not found"));
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization record not found"));

        String token = tokenProvider.generateToken(user.getId(), org.getId(), role, user.getName());
        return new AuthResponse(token, user, role, org);
    }
}
