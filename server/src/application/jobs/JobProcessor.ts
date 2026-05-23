export default interface JobProcessor<T> {
  process(job: T): Promise<void>;
}
