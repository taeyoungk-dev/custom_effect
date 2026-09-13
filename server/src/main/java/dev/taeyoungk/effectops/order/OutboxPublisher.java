package dev.taeyoungk.effectops.order;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.messaging.enabled", havingValue = "true")
public class OutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);
    private final OutboxEventRepository outbox;
    private final RabbitTemplate rabbitTemplate;

    public OutboxPublisher(OutboxEventRepository outbox, RabbitTemplate rabbitTemplate) {
        this.outbox = outbox;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Scheduled(fixedDelayString = "${app.messaging.publish-interval-ms:1000}")
    @Transactional
    public void publishPending() {
        for (OutboxEvent event : outbox.findByPublishedAtIsNullOrderByCreatedAtAsc(PageRequest.of(0, 50))) {
            rabbitTemplate.convertAndSend("effectops.orders", event.getEventType(), event.getPayload(), message -> {
                message.getMessageProperties().setHeader("event-id", event.getId());
                message.getMessageProperties().setHeader("aggregate-id", event.getAggregateId());
                return message;
            });
            event.markPublished();
            log.info("Published eventId={} type={}", event.getId(), event.getEventType());
        }
    }
}

