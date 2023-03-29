import { useHistory, useRouteMatch } from 'react-router-dom';

const useRouting = () => {
  const history = useHistory();

  /**
   * Go to specified page and call callback when done
   */
  const goToPage = (where: string, state?: object, callback?: any): void => {
    try {
      history.push(where, state ?? undefined);
      if (typeof callback === 'function') {
        callback();
      }
    } catch (e) {
      console.error('Error during navigating on page', where, e);
    }
  };

  /**
   * Get current page
   */
  const getCurrentPage = (): string => {
    const { path } = useRouteMatch();
    return path;
  };

  /**
   * Check if user is currently located on a specified page
   */
  const isOnPage = (page: string, strict: boolean = false): boolean => {
    const currentPage = getCurrentPage();
    if (!strict) {
      return String(currentPage).startsWith(page);
    }
    return String(currentPage) === page;
  };

  const ROUTES: any = {
    ROOT: '/',
    LOGIN: '/login',
    LOGGED_IN: '/logged-in',
    NOT_FOUND: ''
  };

  ROUTES.WIZARD = `${ROUTES.LOGGED_IN}/wizard`;
  ROUTES.TEST_PAGE = `${ROUTES.LOGGED_IN}/test`;
  ROUTES.SETTINGS = `${ROUTES.LOGGED_IN}/settings`;
  ROUTES.LOGIN_CALLBACK = `${ROUTES.LOGIN}/callback`;
  ROUTES.DASHBOARD = `${ROUTES.LOGGED_IN}/dashboard`;
  ROUTES.REWARD_ADDRESSES = `${ROUTES.LOGGED_IN}/reward_addresses`;
  ROUTES.WITHDRAWAL_ADDRESSES = `${ROUTES.LOGGED_IN}/withdrawal_addresses`;

  return {
    goToPage,
    getCurrentPage,
    isOnPage,
    ROUTES
  };
};

export default useRouting;
