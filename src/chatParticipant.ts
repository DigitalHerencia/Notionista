export class ChatParticipant {
  constructor(
    public id: string,
    public displayName?: string
  ) {}

  sendMessage(message: string) {
    // stub: integrate with chat/session APIs
    console.warn(`[ChatParticipant:${this.id}] ${message}`);
  }
}
