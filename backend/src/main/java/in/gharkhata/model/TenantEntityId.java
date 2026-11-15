package in.gharkhata.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class TenantEntityId implements Serializable {
    private UUID organizationId;
    private UUID id;

    public TenantEntityId() {}

    public TenantEntityId(UUID organizationId, UUID id) {
        this.organizationId = organizationId;
        this.id = id;
    }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TenantEntityId that = (TenantEntityId) o;
        return Objects.equals(organizationId, that.organizationId) && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizationId, id);
    }
}

