# EFFECT/OPS Architecture Notes

이 문서는 README보다 한 단계 깊게, 구현이 해결하려는 실패 모드와 의도적으로 남긴 경계를 기록합니다.

## 1. 주문을 동기 처리하고 후속 작업을 비동기로 분리한 이유

사용자에게 즉시 확정해야 하는 최소 상태는 “유효한 상품으로 주문이 접수되었다”입니다. 알림, 분석, fulfillment 같은 후속 작업까지 HTTP 요청 안에 묶으면 한 downstream 장애가 전체 주문 실패로 전파됩니다.

EFFECT/OPS는 주문과 `order.created` outbox row를 하나의 PostgreSQL transaction으로 저장한 뒤 응답합니다. relay는 별도 주기로 미발행 row를 RabbitMQ에 보냅니다.

### 보장하는 것

- 주문만 저장되고 발행 의도가 사라지는 상황을 방지
- RabbitMQ 단기 장애 중에도 주문 수락 가능
- 애플리케이션 재시작 후 미발행 이벤트 재처리

### 보장하지 않는 것

- exactly-once delivery
- consumer가 처리 완료했다는 end-to-end 보장
- relay instance가 여러 개일 때의 row claim/lock

운영 확장 시에는 `SELECT ... FOR UPDATE SKIP LOCKED`, retry/backoff, dead-letter 정책, outbox retention, consumer inbox table이 필요합니다.

## 2. 멱등성 경계

클라이언트는 주문마다 UUID를 `Idempotency-Key` 헤더로 전송합니다. DB unique constraint가 최종 중복 방어선입니다. 현재 구현은 동일 key로 다른 payload를 보내도 기존 응답을 반환합니다.

운영 버전에서는 request body hash도 저장하여 같은 key·다른 payload를 `409 Conflict`로 거절하는 것이 안전합니다. key retention 기간과 사용자/tenant scope도 명시해야 합니다.

## 3. 가격 신뢰 경계

브라우저는 SKU와 수량만 전송합니다. API가 DB에서 가격을 읽어 line snapshot과 total을 만듭니다. 따라서 DevTools로 화면 가격을 바꿔도 주문 합계는 변하지 않습니다.

실제 커머스라면 통화, 세금, 할인, price version, 재고 reservation을 별도 도메인 규칙으로 추가해야 합니다.

## 4. UI degradation model

| 상태 | 사용자 경험 | 데이터 의미 |
|---|---|---|
| API 정상 | `LIVE API`, 실제 201 응답 | H2 또는 PostgreSQL에 저장 |
| API 미실행 | `DEMO DATA`, `demo-...` 주문 ID | 메모리 UI 시뮬레이션, 저장되지 않음 |
| 알 수 없는 경로 | recovery mode 404 | 홈으로 복구 가능 |
| reduced motion | 이동·회전 애니메이션 최소화 | 기능은 동일 |
| touch/coarse pointer | 시스템 포인터 유지 | 장바구니·라우팅은 동일 |

fallback은 장애를 성공처럼 숨기지 않습니다. 배지와 주문 status가 실제 연결 여부를 드러냅니다.

## 5. 배포 경계

Compose는 한 개발자 노트북에서 end-to-end 흐름을 재현하는 용도입니다. Kubernetes base는 컨테이너 health, replica, 자원 상한, network ingress를 문서화합니다.

Kubernetes 사양에 PostgreSQL을 넣지 않은 이유는 운영 데이터의 backup, encryption, HA, patching 책임을 단순 demo pod에 맡기지 않기 위해서입니다. 클라우드에서는 managed database와 workload identity/secret manager를 연결하는 것이 다음 단계입니다.

## 6. 관측 지표 제안

현재 `/actuator/prometheus`가 JVM·HTTP·DB pool 지표를 노출합니다. 운영 dashboard에는 다음 지표를 우선 추가합니다.

- `http.server.requests`: route별 p50/p95/p99, error rate
- `orders.created`: business throughput
- `outbox.pending`: backlog와 oldest event age
- `outbox.publish.failures`: broker 장애 탐지
- DB connection pool saturation
- RabbitMQ queue depth, unacked, consumer rate

SLO 예시는 “주문 API p95 < 250ms, 월 가용성 99.9%, 정상 broker 상태에서 outbox age < 10s”입니다. 이 수치는 현재 측정 결과가 아니라 향후 부하 테스트에서 검증할 설계 목표입니다.

