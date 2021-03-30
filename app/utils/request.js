/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  return response.json();
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function request(url, options) {
  return fetch(url, options).then(checkStatus).then(parseJSON);
}

/**
 * This function allow you to modify a JS Promise by adding some status properties
 */
export const MakeQueryablePromise = (promise) => {
  // Don't modify any promise that has been already modified.
  if (promise.isResolved) return promise;

  // Set initial state
  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;

  // Observe the promise, saving the fulfillment in a closure scope.
  const result = promise.then(
    (v) => {
      isFulfilled = true;
      isPending = false;
      return v;
    },
    (e) => {
      isRejected = true;
      isPending = false;
      throw e;
    }
  );

  result.isFulfilled = () => { return isFulfilled; };
  result.isPending = () => { return isPending; };
  result.isRejected = () => { return isRejected; };
  return result;
};

export const checkJwtStructure = (token) => {
  const parseJwtPart = (tokenPart) => {
    return JSON.parse(Buffer.from(tokenPart, 'base64').toString('binary'));
  };

  try {
    const tokenParts = String(token).split('.');
    return {
      header: parseJwtPart(tokenParts[0]),
      body: parseJwtPart(tokenParts[1])
    };
  } catch (e) {
    console.error('Token check error!', e);
  }
  return null;
};
