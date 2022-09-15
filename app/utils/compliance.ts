import config from '~app/backend/common/config';
import { Log } from '~app/backend/common/logger/logger';
import BaseStore from '~app/backend/common/store-manager/base-store';
import AccountService from '~app/backend/services/account/account.service';

const logger = new Log('utils/compliance');
const baseStore = new BaseStore();

const getRestrictedLocations = async () => {
  return await fetch(config.env.COMPLIANCE_URL).then(res => res.json());
};

const getCurrentUserLocation = async () => {
  const fetchLocation = async (requestUri: string, getCountryCallback: any) => {
    return await fetch(requestUri)
      .then(res => res.json())
      .then(getCountryCallback);
  };
  const countryGetters = [
    {
      url: 'http://ip-api.com/json',
      callback: (response) => {
        return [response.country, response.regionName];
      }
    },
    {
      url: 'https://geolocation-db.com/json/',
      callback: (response) => {
        return [response.country_name, response.city];
      }
    }
  ];

  for (let i = 0; i < countryGetters.length; i += 1) {
    const countryGetter = countryGetters[i];
    try {
      // eslint-disable-next-line no-await-in-loop
      const currentLocation = await fetchLocation(
        countryGetter.url,
        countryGetter.callback
      );
      if (currentLocation?.length) {
        return currentLocation;
      }
    } catch (error) {
      logger.error('Detecting location failed using:', countryGetter.url);
    }
  }
  return [];
};

/**
 * Returns true if user is located in restricted country and doesn't have accounts
 */
export const checkCompliance = async () => {
  const accountService = new AccountService();
  const accounts = await accountService.get();
  const haveAccounts = accounts?.length > 0;

  if (!haveAccounts) {
    const userLocation = await getCurrentUserLocation();
    const restrictedLocations = await getRestrictedLocations();
    const testRestrictedCountry = baseStore.get(config.FLAGS.COMPLIANCE.RESTRICTED_TEST);
    if (testRestrictedCountry) {
      restrictedLocations.push(testRestrictedCountry);
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const location of userLocation) {
      // eslint-disable-next-line no-restricted-syntax
      for (const restrictedLocation of restrictedLocations) {
        if (String(restrictedLocation).toLowerCase().indexOf(String(location).toLowerCase()) !== -1) {
          return true;
        }
      }
    }
  }
  return false;
};
