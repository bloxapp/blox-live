import config from '~app/backend/common/config';
import { Log } from '~app/backend/common/logger/logger';
import BaseStore from '~app/backend/common/store-manager/base-store';
import AccountService from '~app/backend/services/account/account.service';

const logger = new Log('utils/compliance');
const baseStore = new BaseStore();

const getRestrictedCountriesList = async () => {
  return await fetch(config.env.COMPLIANCE_URL).then(res => res.json());
};

const getCurrentUserCountry = async () => {
  const fetchCountry = async (requestUri: string, getCountryCallback: any) => {
    return await fetch(requestUri)
      .then(res => res.json())
      .then(getCountryCallback);
  };
  const countryGetters = [
    {
      url: 'https://extreme-ip-lookup.com/json/',
      callback: (response) => {
        return response.country;
      }
    },
    {
      url: 'http://ip-api.com/json',
      callback: (response) => {
        return response.country;
      }
    },
    {
      url: 'http://geolocation-db.com/json/',
      callback: (response) => {
        return response.country_name;
      }
    }
  ];

  let detectedCountry;
  for (let i = 0; i < countryGetters.length; i += 1) {
    const countryGetter = countryGetters[i];
    try {
      // eslint-disable-next-line no-await-in-loop
      const currentCountry = await fetchCountry(
        countryGetter.url,
        countryGetter.callback
      );
      if (currentCountry) {
        detectedCountry = currentCountry;
        break;
      }
    } catch (error) {
      logger.error('Detecting country failed using:', countryGetter.url);
    }
  }
  return detectedCountry;
};

/**
 * Returns true if user is located in restricted country and doesn't have accounts
 */
export const checkCompliance = async () => {
  const accountService = new AccountService();
  const accounts = await accountService.get();
  const haveAccounts = accounts?.length > 0;

  if (!haveAccounts) {
    const userCountry = await getCurrentUserCountry();
    const restrictedCountries = await getRestrictedCountriesList();
    const testRestrictedCountry = baseStore.get(config.FLAGS.COMPLIANCE.RESTRICTED_TEST);
    if (testRestrictedCountry) {
      restrictedCountries.push(testRestrictedCountry);
    }
    return restrictedCountries.indexOf(userCountry) !== -1;
  }
  return false;
};
