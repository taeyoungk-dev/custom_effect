CREATE TABLE products (
    sku VARCHAR(64) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(500) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    accent VARCHAR(16) NOT NULL,
    image VARCHAR(255) NOT NULL
);

CREATE TABLE customer_orders (
    id VARCHAR(36) PRIMARY KEY,
    idempotency_key VARCHAR(120) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE order_lines (
    order_id VARCHAR(36) NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL,
    product_name VARCHAR(160) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX idx_order_lines_order_id ON order_lines(order_id);

CREATE TABLE outbox_events (
    id VARCHAR(36) PRIMARY KEY,
    aggregate_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_outbox_unpublished ON outbox_events(published_at, created_at);

