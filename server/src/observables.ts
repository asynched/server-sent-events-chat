type Subscriber<T> = (data: T) => unknown

export class Observable<T> {
  private subscribers: Array<Subscriber<T>> = []

  emit(data: T) {
    this.subscribers.forEach((s) => s(data))
  }

  subscribe(subscriber: Subscriber<T>) {
    this.subscribers.push(subscriber)

    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== subscriber)
    }
  }
}
