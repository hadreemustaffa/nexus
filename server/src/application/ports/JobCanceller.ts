export default interface JobCanceller {
  cancel(key: string): void;
}
