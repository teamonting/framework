type SerializedMessage = {
  readonly data: any;
  readonly portId: string;
  readonly transferPortIds: readonly string[];
};

interface MessagePortFacility {
  flushAll(): readonly SerializedMessage[];
  sendToBrowser(message: SerializedMessage): void;
}

export type { MessagePortFacility, SerializedMessage };
