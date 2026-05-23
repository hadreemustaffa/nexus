export default interface DomainEvent<TPayload = unknown> {
  type: string;
  occurredAt: Date;
  payload: TPayload;
}
