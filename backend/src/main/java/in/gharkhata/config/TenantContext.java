package in.gharkhata.config;

import java.util.List;
import java.util.UUID;

public class TenantContext {
    private static final ThreadLocal<UUID> currentOrg = new ThreadLocal<>();
    private static final ThreadLocal<UUID> currentUser = new ThreadLocal<>();
    private static final ThreadLocal<String> currentRole = new ThreadLocal<>();
    private static final ThreadLocal<List<String>> buildingScope = new ThreadLocal<>();

    public static void set(UUID orgId, UUID userId, String role, List<String> scope) {
        currentOrg.set(orgId);
        currentUser.set(userId);
        currentRole.set(role);
        buildingScope.set(scope);
    }

    public static UUID getOrgId() {
        return currentOrg.get();
    }

    public static UUID getUserId() {
        return currentUser.get();
    }

    public static String getRole() {
        return currentRole.get();
    }

    public static List<String> getBuildingScope() {
        return buildingScope.get();
    }

    public static void clear() {
        currentOrg.remove();
        currentUser.remove();
        currentRole.remove();
        buildingScope.remove();
    }
}

