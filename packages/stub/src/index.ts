import type { BrowsingContext, StubDeclaration } from '@onting/rpc';

type Stub = {
  captureScreenshot(): Promise<string>;
  getTimestamp(): string;
};

const stubDeclaration: StubDeclaration<Stub> = {
  implement({ browsingContext }: { browsingContext: BrowsingContext }) {
    return {
      captureScreenshot(): Promise<string> {
        return browsingContext.captureScreenshot();
      },
      getTimestamp(): string {
        return `Hello, World! ${new Date().toLocaleString()}`;
      }
    };
  },
  keys: ['captureScreenshot', 'getTimestamp']
};

export default stubDeclaration;
