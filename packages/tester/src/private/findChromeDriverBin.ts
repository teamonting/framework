import { findUp } from 'find-up';

async function findChromeDriverBin_(): Promise<string> {
  let path =
    (await findUp('chromedriver.exe')) || (await findUp('chromedriver')) || (await findUp('/usr/bin/chromedriver'));

  if (!path) {
    throw new Error('ChromeDriver is not found under the current path up to the root, please download ChromeDriver');
  }

  return path;
}

let findDriverBinResult: Promise<string>;

export default function findChromeDriverBin(): Promise<string> {
  return findDriverBinResult || (findDriverBinResult = findChromeDriverBin_());
}
