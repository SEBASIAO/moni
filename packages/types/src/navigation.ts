/**
 * React Navigation type definitions for the mobile app.
 * Import these in the mobile app via @moni/types.
 */

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: { email?: string };
};

export type AppTabParamList = {
  Home: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
};
