type GetTimestampFunction = () => Promise<string>;

type HandshakeFunction = () => {
  getTimestampPort: MessagePort;
};

type Stub = {
  readonly getTimestamp: GetTimestampFunction;
};

export type { GetTimestampFunction, HandshakeFunction, Stub };
