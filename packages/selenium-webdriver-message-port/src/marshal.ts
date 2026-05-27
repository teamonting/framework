import walk from './walk.ts';

const MESSAGE_PORT = '@@__SELENIUM_WEBDRIVER_MESSAGE_PORT__@@';

/**
 * Marshals the data and mask `MessagePort` into ['@@__SWMP__@@', 1].
 *
 * MessagePort cannot be sent directly across WebDriver.executeScript.
 *
 * We are walking the postMessage(data) and turning MessagePort into ['@@__SWMP__@@', 1].
 *
 * The second argument is the index of the MessagePort as they appear in Transferable[].
 *
 * @param target
 * @param transferable
 * @returns
 */
function marshal(target: any, transferable: readonly Transferable[]): any {
  return walk(target, value => {
    if (value instanceof MessagePort) {
      const index = transferable.indexOf(value);

      return ~index ? [MESSAGE_PORT, index] : value;
    }

    return value;
  });
}

/**
 * Unmarshals the data and unmask ['@@__SWMP__@@', 1] into `MessagePort`.
 *
 * MessagePort cannot be sent directly across WebDriver.executeScript.
 *
 * We are walking the postMessage(data) and turning MessagePort into ['@@__SWMP__@@', 1].
 *
 * The second argument is the index of the MessagePort as they appear in Transferable[].
 *
 * @param target
 * @param transferable
 * @returns
 */
function unmarshal(target: any, transferable: readonly Transferable[]): any {
  return walk(target, value => {
    if (Array.isArray(value) && value[0] === MESSAGE_PORT) {
      return transferable[value[1]];
    }

    return value;
  });
}

export { marshal, unmarshal };
