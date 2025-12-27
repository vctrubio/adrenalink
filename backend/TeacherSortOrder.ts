export class TeacherSortOrder {
  private order: string[] = [];
  private subscribers = new Set<(order: string[]) => void>();
  private storageKey: string;

  constructor(storageKey = "teacher-sort-priority") {
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.order = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load teacher sort order:", error);
    }
  }

  getOrder(): string[] {
    return [...this.order];
  }

  setOrder(order: string[]): void {
    this.order = order;
    this.saveToStorage();
    this.notifySubscribers();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.order));
  }

  subscribe(callback: (order: string[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.getOrder()));
  }
}
