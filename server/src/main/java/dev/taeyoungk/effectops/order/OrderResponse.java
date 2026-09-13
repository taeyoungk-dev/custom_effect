package dev.taeyoungk.effectops.order;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderResponse(String orderId, OrderStatus status, BigDecimal total, Instant createdAt) {
    static OrderResponse from(CustomerOrder order) {
        return new OrderResponse(order.getId(), order.getStatus(), order.getTotal(), order.getCreatedAt());
    }
}

