package dev.taeyoungk.effectops.catalog;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class CatalogSeed implements ApplicationRunner {

    private final ProductRepository products;

    public CatalogSeed(ProductRepository products) {
        this.products = products;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (products.count() > 0) return;

        products.saveAll(List.of(
            new Product("SIGNAL-01", "Signal No. 01", "A modular light study for focused rooms.", new BigDecimal("129.00"), "#ff5b35", "/assets/poster-signal.png"),
            new Product("ORBIT-02", "Orbit No. 02", "A kinetic print about systems in motion.", new BigDecimal("96.00"), "#8b6cff", "/assets/poster-orbit.png"),
            new Product("FIELD-03", "Field No. 03", "A chromatic field generated from live data.", new BigDecimal("148.00"), "#c7ff5e", "/assets/poster-field.png")
        ));
    }
}

