package dev.taeyoungk.effectops.platform;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform")
public class PlatformController {

    private final JdbcTemplate jdbc;
    private final boolean messagingEnabled;

    public PlatformController(JdbcTemplate jdbc, @Value("${app.messaging.enabled:false}") boolean messagingEnabled) {
        this.jdbc = jdbc;
        this.messagingEnabled = messagingEnabled;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        Integer databaseReady = jdbc.queryForObject("SELECT 1", Integer.class);
        return Map.of(
            "status", "OPERATIONAL",
            "services", List.of(
                Map.of("name", "Storefront", "status", "ONLINE", "detail", "React edge client"),
                Map.of("name", "Order API", "status", "ONLINE", "detail", "Spring Boot / Java 21"),
                Map.of("name", "PostgreSQL", "status", databaseReady != null ? "ONLINE" : "DEGRADED", "detail", "Transactional persistence"),
                Map.of("name", "Event pipeline", "status", messagingEnabled ? "ONLINE" : "LOCAL", "detail", "Transactional outbox")
            )
        );
    }
}

