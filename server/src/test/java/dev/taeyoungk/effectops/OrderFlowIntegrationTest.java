package dev.taeyoungk.effectops;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.taeyoungk.effectops.order.CustomerOrderRepository;
import dev.taeyoungk.effectops.order.OutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class OrderFlowIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired CustomerOrderRepository orders;
    @Autowired OutboxEventRepository outbox;

    @BeforeEach
    void cleanOrders() {
        outbox.deleteAll();
        orders.deleteAll();
    }

    @Test
    void listsSeededCatalog() throws Exception {
        mvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[0].sku").value("FIELD-03"));
    }

    @Test
    void createsOneOrderAndOutboxEventForRepeatedIdempotencyKey() throws Exception {
        String request = """
            {
              "email": "engineer@example.com",
              "items": [{"sku": "SIGNAL-01", "quantity": 2}]
            }
            """;

        for (int attempt = 0; attempt < 2; attempt++) {
            mvc.perform(post("/api/orders")
                    .header("Idempotency-Key", "stable-client-key")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(258.00))
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
        }

        org.assertj.core.api.Assertions.assertThat(orders.count()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(outbox.count()).isEqualTo(1);
    }

    @Test
    void rejectsClientRequestWithoutIdempotencyKey() throws Exception {
        mvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"engineer@example.com\",\"items\":[{\"sku\":\"SIGNAL-01\",\"quantity\":1}]}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_ORDER"));
    }
}

