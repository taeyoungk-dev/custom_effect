package dev.taeyoungk.effectops.order;

import jakarta.persistence.Embeddable;
import java.math.BigDecimal;

@Embeddable
public class OrderLine {

    private String sku;
    private String productName;
    private int quantity;
    private BigDecimal unitPrice;

    protected OrderLine() {}

    public OrderLine(String sku, String productName, int quantity, BigDecimal unitPrice) {
        this.sku = sku;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public String getSku() { return sku; }
    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}

