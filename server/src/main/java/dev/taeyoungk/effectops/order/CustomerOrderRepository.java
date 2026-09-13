package dev.taeyoungk.effectops.order;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, String> {
    Optional<CustomerOrder> findByIdempotencyKey(String idempotencyKey);
}

