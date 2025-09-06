import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';
import {createLazyScreen, preloadScreen} from './LazyLoader';


// 创建懒加载页面组件
const HomeScreen = createLazyScreen(
  () => import('../screens/HomeScreen'),
  '加载首页...',
  'HomeScreen'
);

const ProfileScreen = createLazyScreen(
  () => import('../screens/ProfileScreen'),
  '加载个人资料...',
  'ProfileScreen'
);

const SettingsScreen = createLazyScreen(
  () => import('../screens/SettingsScreen'),
  '加载设置页面...',
  'SettingsScreen'
);

const DetailsScreen = createLazyScreen(
  () => import('../screens/DetailsScreen'),
  '加载详情页面...',
  'DetailsScreen'
);

const InlineRequireScreen = createLazyScreen(
  () => import('../utils/InlineRequireExample'),
  '加载 Inline Require 示例...',
  'InlineRequireScreen'
);

const GetterAPIScreen = createLazyScreen(
  () => import('../utils/GetterAPIExample'),
  '加载 Getter API 示例...',
  'GetterAPIScreen'
);

const JSErrorScreen = createLazyScreen(
  () => import('../utils/JSErrorExample'),
  '加载 JSError 示例...',
  'JSErrorScreen'
);

const FlatListExampleScreen = createLazyScreen(
  () => import('../utils/FlatListExample'),
  '加载 FlatList 示例...',
  'FlatListExampleScreen'
);

const ListPerformanceComparisonScreen = createLazyScreen(
  () => import('../utils/ListPerformanceComparison'),
  '加载性能对比示例...',
  'ListPerformanceComparisonScreen'
);

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  // 预加载常用页面
  useEffect(() => {
    // 在应用启动后预加载Profile和Settings页面
    // preloadScreen(() => import('../screens/ProfileScreen'));
    // preloadScreen(() => import('../screens/SettingsScreen'));
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '首页',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: '个人资料',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '设置',
          }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={({route}) => ({
            title: (route.params as any)?.title || '详情',
          })}
        />
        <Stack.Screen
          name="InlineRequire"
          component={InlineRequireScreen}
          options={{
            title: 'Inline Require 示例',
          }}
        />
        <Stack.Screen
          name="GetterAPI"
          component={GetterAPIScreen}
          options={{
            title: 'Getter API 示例',
          }}
        />
        <Stack.Screen
          name="JSError"
          component={JSErrorScreen}
          options={{
            title: 'JSError 异常捕获',
          }}
        />
        <Stack.Screen
          name="FlatListExample"
          component={FlatListExampleScreen}
          options={{
            title: 'FlatList 长列表优化',
          }}
        />
        <Stack.Screen
          name="ListPerformanceComparison"
          component={ListPerformanceComparisonScreen}
          options={{
            title: 'FlatList vs FlashList 性能对比',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
