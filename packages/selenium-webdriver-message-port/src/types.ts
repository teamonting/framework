interface MessagePortFacilitySlice<T = any> {
  flushHostMessages(): readonly T[];
  getBrowserPort(): MessagePort;
  sendToBrowser(message: T): void;
}

interface MessagePortFacility {
  get<T>(key: string): MessagePortFacilitySlice<T>;
}

export type { MessagePortFacility, MessagePortFacilitySlice };
