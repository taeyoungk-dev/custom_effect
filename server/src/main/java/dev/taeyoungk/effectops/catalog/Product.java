package dev.taeyoungk.effectops.catalog;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private String accent;
    private String image;

    protected Product() {}

    public Product(String sku, String name, String description, BigDecimal price, String accent, String image) {
        this.sku = sku;
        this.name = name;
        this.description = description;
        this.price = price;
        this.accent = accent;
        this.image = image;
    }

    public String getSku() { return sku; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getAccent() { return accent; }
    public String getImage() { return image; }
}

