export type State = {
  isLoading: boolean;
  isLoggedIn: boolean;
  idToken: string;
  refreshToken: string;
  error: null;
  userData: Record<string, any>;
};
