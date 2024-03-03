import { ADDON_NAME } from './config';
import { handler } from './handler';
import { log } from './logger';
import { Payload } from './models/payload';

log(`Starting ${ADDON_NAME} add-on`)

bootstrap(ADDON_NAME)

function bootstrap(addonName: string) {

  let port = browser.runtime.connectNative(addonName);
  log(`[${addonName}] Connected with native application`, port)

  port.onMessage.addListener((payload: Payload) => {
    log(`[${addonName}] Got message from native application: ${JSON.stringify(payload)}`);

    const { payload: command } = payload
    handler(port, command);
  });

}
