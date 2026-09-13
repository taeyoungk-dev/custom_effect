package dev.taeyoungk.effectops.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessagingConfig {

    @Bean
    TopicExchange orderExchange() {
        return new TopicExchange("effectops.orders", true, false);
    }

    @Bean
    Queue orderCreatedQueue() {
        return new Queue("effectops.order-created", true);
    }

    @Bean
    Binding orderCreatedBinding(Queue orderCreatedQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderCreatedQueue).to(orderExchange).with("order.created");
    }
}

