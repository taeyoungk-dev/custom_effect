package dev.taeyoungk.effectops.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record OrderRequest(
    @Email @NotNull String email,
    @NotEmpty List<@Valid Item> items
) {
    public record Item(@NotNull String sku, @Positive int quantity) {}
}

