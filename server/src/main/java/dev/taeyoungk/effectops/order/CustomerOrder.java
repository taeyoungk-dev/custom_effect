package dev.taeyoungk.effectops.order;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
public class CustomerOrder {

    @Id
    private String id;

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private String idempotencyKey;

    private String email;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private BigDecimal total;

    @Column(name = "created_at")
    private Instant createdAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_lines", joinColumns = @JoinColumn(name = "order_id"))
    private List<OrderLine> lines = new ArrayList<>();

    protected CustomerOrder() {}

    public CustomerOrder(String id, String idempotencyKey, String email, BigDecimal total, List<OrderLine> lines) {
        this.id = id;
        this.idempotencyKey = idempotencyKey;
        this.email = email;
        this.status = OrderStatus.ACCEPTED;
        this.total = total;
        this.createdAt = Instant.now();
        this.lines = new ArrayList<>(lines);
    }

    public String getId() { return id; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public String getEmail() { return email; }
    public OrderStatus getStatus() { return status; }
    public BigDecimal getTotal() { return total; }
    public Instant getCreatedAt() { return createdAt; }
    public List<OrderLine> getLines() { return List.copyOf(lines); }
}

