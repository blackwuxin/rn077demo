export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Details: {
    itemId: number;
    title: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
