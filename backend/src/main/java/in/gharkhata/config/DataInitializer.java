package in.gharkhata.config;

import in.gharkhata.model.*;
import in.gharkhata.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;
    private final TenantRepository tenantRepository;
    private final LeaseRepository leaseRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           OrganizationRepository organizationRepository,
                           MembershipRepository membershipRepository,
                           BuildingRepository buildingRepository,
                           UnitRepository unitRepository,
                           TenantRepository tenantRepository,
                           LeaseRepository leaseRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.membershipRepository = membershipRepository;
        this.buildingRepository = buildingRepository;
        this.unitRepository = unitRepository;
        this.tenantRepository = tenantRepository;
        this.leaseRepository = leaseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            // -------------------------------------------------------------
            // OWNER 1: Vikram Deshmukh (Shree Ganesh Properties & Estates)
            // -------------------------------------------------------------
            UUID org1Id = UUID.fromString("11ee9999-0000-0000-0000-000000000001");
            UUID user1Id = UUID.fromString("22ee9999-0000-0000-0000-000000000001");
            TenantContext.set(org1Id, user1Id, "OWNER", java.util.List.of("ALL"));

            Organization org1 = organizationRepository.findById(org1Id).orElseGet(() -> {
                Organization o = new Organization();
                o.setId(org1Id);
                o.setName("Shree Ganesh Properties & Estates");
                o.setCode("SGP");
                o.setPan("AAACS4819M");
                o.setGstin("27AAACS4819M1Z5");
                o.setRera("P52100024891");
                o.setAddress("402, Shivajinagar Main Road");
                o.setCity("Pune");
                o.setState("Maharashtra");
                o.setPincode("411005");
                o.setBankName("HDFC Bank, FC Road");
                o.setAccountNumberMasked("XXXX-XXXX-8921");
                o.setIfscCode("HDFC0000103");
                return organizationRepository.save(o);
            });

            User user1 = userRepository.findById(user1Id).orElseGet(() -> {
                User u = new User();
                u.setId(user1Id);
                u.setFirstName("Vikram");
                u.setLastName("Deshmukh");
                u.setName("Vikram Deshmukh");
                u.setEmail("vikram@shreeganesh.in");
                u.setPhone("+91 98220 11223");
                u.setPasswordHash(passwordEncoder.encode("demo123"));
                return userRepository.save(u);
            });

            if (membershipRepository.findByUserIdAndOrganizationId(user1Id, org1Id).isEmpty()) {
                membershipRepository.save(new Membership(UUID.randomUUID(), user1Id, org1Id, "OWNER"));
            }

            UUID bld1Id = UUID.fromString("44ee9999-0000-0000-0000-000000000001");
            if (buildingRepository.findByOrganizationIdAndId(org1Id, bld1Id).isEmpty()) {
                Building b1 = new Building();
                b1.setOrganizationId(org1Id);
                b1.setId(bld1Id);
                b1.setName("Shivaji Heights");
                b1.setAddress("Plot 45, Model Colony");
                b1.setCity("Pune");
                b1.setState("Maharashtra");
                b1.setPincode("411016");
                b1.setTotalFloors(4);
                buildingRepository.save(b1);
            }

            UUID bld2Id = UUID.fromString("44ee9999-0000-0000-0000-000000000002");
            if (buildingRepository.findByOrganizationIdAndId(org1Id, bld2Id).isEmpty()) {
                Building b2 = new Building();
                b2.setOrganizationId(org1Id);
                b2.setId(bld2Id);
                b2.setName("Tulsi Commercial Chambers");
                b2.setAddress("Near Deccan Gymkhana");
                b2.setCity("Pune");
                b2.setState("Maharashtra");
                b2.setPincode("411004");
                b2.setTotalFloors(3);
                buildingRepository.save(b2);
            }

            // -------------------------------------------------------------
            // OWNER 2: Rajesh Patil (Patil Real Estate & Towers) - ISOLATED
            // -------------------------------------------------------------
            UUID org2Id = UUID.fromString("11ee9999-0000-0000-0000-000000000002");
            UUID user2Id = UUID.fromString("22ee9999-0000-0000-0000-000000000002");
            TenantContext.set(org2Id, user2Id, "OWNER", java.util.List.of("ALL"));

            Organization org2 = organizationRepository.findById(org2Id).orElseGet(() -> {
                Organization o = new Organization();
                o.setId(org2Id);
                o.setName("Patil Real Estate & Towers");
                o.setCode("PRET");
                o.setPan("AAAPL7712K");
                o.setGstin("27AAAPL7712K1Z8");
                o.setRera("P52100099412");
                o.setAddress("702, Baner High Street");
                o.setCity("Pune");
                o.setState("Maharashtra");
                o.setPincode("411045");
                o.setBankName("ICICI Bank, Baner");
                o.setAccountNumberMasked("XXXX-XXXX-4412");
                o.setIfscCode("ICIC0000412");
                return organizationRepository.save(o);
            });

            User user2 = userRepository.findById(user2Id).orElseGet(() -> {
                User u = new User();
                u.setId(user2Id);
                u.setFirstName("Rajesh");
                u.setLastName("Patil");
                u.setName("Rajesh Patil");
                u.setEmail("rajesh@patiltowers.in");
                u.setPhone("+91 98900 44556");
                u.setPasswordHash(passwordEncoder.encode("demo123"));
                return userRepository.save(u);
            });

            if (membershipRepository.findByUserIdAndOrganizationId(user2Id, org2Id).isEmpty()) {
                membershipRepository.save(new Membership(UUID.randomUUID(), user2Id, org2Id, "OWNER"));
            }

            UUID bld3Id = UUID.fromString("44ee9999-0000-0000-0000-000000000003");
            if (buildingRepository.findByOrganizationIdAndId(org2Id, bld3Id).isEmpty()) {
                Building b3 = new Building();
                b3.setOrganizationId(org2Id);
                b3.setId(bld3Id);
                b3.setName("Patil Royal Heritage");
                b3.setAddress("Lane 7, Koregaon Park");
                b3.setCity("Pune");
                b3.setState("Maharashtra");
                b3.setPincode("411001");
                b3.setTotalFloors(5);
                buildingRepository.save(b3);

                // Add Unit 101 to Patil Royal Heritage
                Unit u = new Unit();
                u.setOrganizationId(org2Id);
                u.setId(UUID.randomUUID());
                u.setBuildingId(b3.getId());
                u.setBuildingName("Patil Royal Heritage");
                u.setFloorNumber(1);
                u.setUnitNumber("101");
                u.setType("3BHK Luxury");
                u.setAreaSqft(1650);
                u.setBaseRentPaise(4800000);
                u.setMaintenancePaise(500000);
                u.setDepositPaise(15000000);
                u.setStatus("VACANT");
                u.setPaymentStatus("VACANT");
                unitRepository.save(u);
            }
        } finally {
            TenantContext.clear();
        }
    }
}
