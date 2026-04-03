/**
 * React Navigation type definitions for Moni.
 */

export type RootStackParamList = {
  Onboarding: undefined;
  App: undefined;
  FixedPayments: undefined;
  Incomes: undefined;
  Transactions: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  CreditCards: undefined;
  Budget: undefined;
  More: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  TransactionDetail: { transactionId: string };
};

export type CreditCardsStackParamList = {
  CreditCardsHome: undefined;
  CardDetail: { accountId: string };
};

export type BudgetStackParamList = {
  BudgetHome: undefined;
  CategoryDetail: { categoryId: string };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  FixedPayments: undefined;
  Income: undefined;
  Savings: undefined;
  Debts: undefined;
  Settings: undefined;
};
