export interface Job<TPayload> {
  type: string;
  payload: TPayload;
}
