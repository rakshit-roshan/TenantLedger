package in.gharkhata;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import in.gharkhata.model.TenantEntityId;
import jakarta.persistence.Entity;
import jakarta.persistence.IdClass;
import org.hibernate.annotations.TenantId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;

public class TenantIsolationArchTest {

    private final JavaClasses importedClasses = new ClassFileImporter().importPackages("in.gharkhata");

    @Test
    @DisplayName("Architecture Rule: All Tenant-scoped entities must use TenantEntityId composite key")
    void tenantEntitiesMustUseTenantEntityId() {
        ArchRule rule = classes()
                .that().areAnnotatedWith(Entity.class)
                .and().haveSimpleNameNotEndingWith("User")
                .and().haveSimpleNameNotEndingWith("Organization")
                .and().haveSimpleNameNotEndingWith("Membership")
                .should().beAnnotatedWith(IdClass.class);

        rule.check(importedClasses);
    }

    @Test
    @DisplayName("Architecture Rule: Repository query methods for tenant data must enforce organization scope")
    void repositoriesMustFilterByOrganizationId() {
        ArchRule rule = methods()
                .that().areDeclaredInClassesThat().haveSimpleNameEndingWith("Repository")
                .and().areDeclaredInClassesThat().haveSimpleNameNotEndingWith("UserRepository")
                .and().areDeclaredInClassesThat().haveSimpleNameNotEndingWith("OrganizationRepository")
                .and().areDeclaredInClassesThat().haveSimpleNameNotEndingWith("MembershipRepository")
                .should().haveNameMatching(".*OrganizationId.*|save|delete|count|existsById|findById|findAll");

        rule.check(importedClasses);
    }
}

