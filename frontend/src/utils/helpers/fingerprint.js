import * as Fingerprint2 from 'fingerprintjs2';
import * as UAParser from 'ua-parser-js';

export default () => {
  return new Promise((resolve, reject) => {
    async function getHash() {
      const options = {
        excludes: {
          plugins: true,
          localStorage: true,
          adBlock: true,
          screenResolution: true,
          availableScreenResolution: true,
          enumerateDevices: true,
          pixelRatio: true,
          doNotTrack: true,
          preprocessor: (key, value) => {
            if (key === 'userAgent') {
              const parser = new UAParser(value);
              // return customized user agent (without browser version)
              return `${parser.getOS().name} :: ${
                parser.getBrowser().name
              } :: ${parser.getEngine().name}`;
            }
            return value;
          },
        },
      };

      try {
        // todo: fingerptint should be fired and LOADED ONLY if no prev value found in localstore
        const components = await Fingerprint2.getPromise(options);
        const values = components.map((component) => component.value);
        console.log('fingerprint hash components', components);

        return String(Fingerprint2.x64hash128(values.join(''), 31));
      } catch (e) {
        reject(e);
      }
    }

    if (window.requestIdleCallback) {
      console.log('get fp hash @ requestIdleCallback');
      requestIdleCallback(async () => resolve(await getHash()));
    } else {
      console.log('get fp hash @ setTimeout');
      setTimeout(async () => resolve(await getHash()), 500);
    }
  });
};
