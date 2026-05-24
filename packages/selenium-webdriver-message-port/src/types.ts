type SerializedMessage = {
  id: string;
  data: any;
  portIds: readonly string[];
};

interface MessagePortFacility {
  flushAll(): readonly SerializedMessage[];
  getMessagePort(id: string): MessagePort;
  sendToBrowser(id: string, data: any, portIds: readonly string[]): void;
}

export type { MessagePortFacility, SerializedMessage };
