export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Details: {
    itemId: number;
    title: string;
  };
  InlineRequire: undefined;
  GetterAPI: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
