export class ChatParticipant {
  constructor(public id: string, public displayName?: string) {}

  sendMessage(message: string) {
    // stub: integrate with chat/session APIs
    console.log(`[ChatParticipant:${this.id}] ${message}`);
  }
}
