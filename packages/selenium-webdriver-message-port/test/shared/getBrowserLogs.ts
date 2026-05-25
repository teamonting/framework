import { logging, type WebDriver } from 'selenium-webdriver';

export default async function getBrowserLogs(webDriver: WebDriver): Promise<readonly logging.Entry[]> {
  return await webDriver.manage().logs().get(logging.Type.BROWSER);
}
