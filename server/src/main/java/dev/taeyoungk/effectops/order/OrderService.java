package dev.taeyoungk.effectops.order;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.taeyoungk.effectops.catalog.Product;
import dev.taeyoungk.effectops.catalog.ProductRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final ProductRepository products;
    private final CustomerOrderRepository orders;
    private final OutboxEventRepository outbox;
    private final ObjectMapper objectMapper;

    public OrderService(ProductRepository products, CustomerOrderRepository orders, OutboxEventRepository outbox, ObjectMapper objectMapper) {
        this.products = products;
        this.orders = orders;
        this.outbox = outbox;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public CustomerOrder create(String idempotencyKey, OrderRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new InvalidOrderException("Idempotency-Key header is required");
        }

        return orders.findByIdempotencyKey(idempotencyKey).orElseGet(() -> persist(idempotencyKey, request));
    }

    private CustomerOrder persist(String idempotencyKey, OrderRequest request) {
        var lines = new ArrayList<OrderLine>();
        var total = BigDecimal.ZERO;

        for (OrderRequest.Item item : request.items()) {
            Product product = products.findById(item.sku())
                .orElseThrow(() -> new InvalidOrderException("Unknown product: " + item.sku()));
            lines.add(new OrderLine(product.getSku(), product.getName(), item.quantity(), product.getPrice()));
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }

        String orderId = UUID.randomUUID().toString();
        CustomerOrder order = orders.save(new CustomerOrder(orderId, idempotencyKey, request.email(), total, lines));
        outbox.save(new OutboxEvent(
            UUID.randomUUID().toString(),
            orderId,
            "order.created",
            eventPayload(order)
        ));
        return order;
    }

    private String eventPayload(CustomerOrder order) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", order.getId());
        payload.put("status", order.getStatus());
        payload.put("total", order.getTotal());
        payload.put("createdAt", order.getCreatedAt());

        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize order event", exception);
        }
    }
}

