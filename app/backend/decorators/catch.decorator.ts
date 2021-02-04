import 'reflect-metadata';
import { Log } from '../common/logger/logger';

const catchDecoratorStore = {
  handler: null,
  setHandler(handler) {
    this.handler = handler;
  }
};

const catchFunction = (payload: any = {}, toReflect: boolean = false) => {
  return function(target, key, descriptor) {
    if (toReflect) {
      Reflect.defineMetadata(key, true, target, key);
    }
    if (descriptor === undefined) {
      // no-param-reassign
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    const originalMethod = descriptor.value;
    const isAsync = originalMethod.constructor.name === 'AsyncFunction';
    if (isAsync) {
      descriptor.value = async function(...args) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          return handleCatchFunctionError(key, error, payload);
        }
      };
    } else {
      descriptor.value = function(...args) {
        try {
          return originalMethod.apply(this, args);
        } catch (error) {
          return handleCatchFunctionError(key, error, payload);
        }
      };
    }
    return descriptor;
  };
};

function handleCatchFunctionError(key: string, error: Error, payload: any) {
  const logger = new Log();
  const { handler } = catchDecoratorStore;
  const showErrorMessage = !!payload.showErrorMessage;
  const displayMessage = showErrorMessage
    ? error.message
    : payload.displayMessage || `${key} failed`;
  const extendedError = { error, displayMessage };
  logger.error(displayMessage, error);
  if (payload.localHandler) {
    return payload.localHandler.call(null, extendedError, this);
  }
  if (handler) {
    return handler.call(null, extendedError, this);
  }
  throw new Error(displayMessage);
}

function Catch(payload: any = {}, toReflect: boolean = true) {
  return catchFunction(payload, toReflect);
}

function CatchClass<T>(payload: any = {}) {
  return function(target: new (...params: any[]) => T) {
    for (const propertyName of Object.getOwnPropertyNames(target.prototype)) {
      if (Reflect.getMetadata(propertyName, target.prototype, propertyName)) {
        continue;
      }
      let descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
      if (descriptor) {
        descriptor = Catch(payload, false)(target, propertyName, descriptor);
        Object.defineProperty(target.prototype, propertyName, descriptor);
      }
    }
  };
}

export {
  Catch,
  CatchClass,
  catchDecoratorStore
};
