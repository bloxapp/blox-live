export function step(metadata: any) {
  return (target, key, descriptor) => {
    // save a reference to the original method this way we keep the values currently in the
    // descriptor and don't overwrite what another decorator might have done to the descriptor.
    if (descriptor === undefined) {
      // eslint-disable-next-line no-param-reassign
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    const originalMethod = descriptor.value;

    // editing the descriptor/value parameter
    // eslint-disable-next-line func-names
    descriptor.value = async function () {
      const args = [];
      for (let i = 0; i < arguments.length; i += 1) {
        // eslint-disable-next-line prefer-rest-params
        args[i] = arguments[i];
      }
      // validate config properties
      if (Array.isArray(metadata.requiredConfig)) {
        metadata.requiredConfig.forEach((prop) => {
          if (!this.conf.get(prop)) {
            throw new Error(`Configuration settings ${prop} not found`);
          }
        });
      }
      const result = await originalMethod.apply(this, args);
      return { ...result, step: { name: metadata ? metadata.name : key } };
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}
