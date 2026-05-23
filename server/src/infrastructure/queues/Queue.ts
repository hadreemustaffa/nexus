export default interface Queue<T> {
  enqueue(job: T): void;
  dequeue(): T | undefined;
  isEmpty(): boolean;
}
