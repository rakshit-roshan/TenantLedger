package in.gharkhata.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.TenantId;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_logs")
@IdClass(TenantEntityId.class)
public class NotificationLog {

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
    private String recipientName;

    @Column(nullable = false)
    private String recipientPhoneOrEmail;

    @Column(nullable = false)
    private String channel;

    @Column(columnDefinition = "TEXT")
    private String messagePreview;

    @Column(nullable = false)
    private String status = "SENT";

    private LocalDateTime sentAt = LocalDateTime.now();

    private int costPaise = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    public NotificationLog() {}

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientPhoneOrEmail() { return recipientPhoneOrEmail; }
    public void setRecipientPhoneOrEmail(String recipientPhoneOrEmail) { this.recipientPhoneOrEmail = recipientPhoneOrEmail; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getMessagePreview() { return messagePreview; }
    public void setMessagePreview(String messagePreview) { this.messagePreview = messagePreview; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public int getCostPaise() { return costPaise; }
    public void setCostPaise(int costPaise) { this.costPaise = costPaise; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

