# 导航使用指南

## 项目结构

```
src/
├── navigation/
│   ├── AppNavigator.tsx    # 主导航配置
│   └── types.ts           # 导航类型定义
└── screens/
    ├── HomeScreen.tsx     # 首页
    ├── ProfileScreen.tsx  # 个人资料页
    ├── SettingsScreen.tsx # 设置页
    ├── DetailsScreen.tsx  # 详情页
    └── index.ts          # 页面导出
```

## 使用示例

### 1. 基本导航

```typescript
// 导航到其他页面
navigation.navigate('Profile');

// 返回上一页
navigation.goBack();

// 导航到首页
navigation.navigate('Home');
```

### 2. 参数传递

```typescript
// 传递参数到详情页
navigation.navigate('Details', {
  itemId: 42,
  title: '示例详情'
});

// 在目标页面接收参数
const {itemId, title} = route.params;
```

### 3. 添加新页面

#### 步骤 1: 更新类型定义

在 `src/navigation/types.ts` 中添加新页面的类型：

```typescript
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Details: {itemId: number; title: string};
  NewPage: {param1: string; param2?: number}; // 新页面
};
```

#### 步骤 2: 创建页面组件

在 `src/screens/` 目录下创建新页面：

```typescript
// NewPageScreen.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewPage'>;

const NewPageScreen: React.FC<Props> = ({route, navigation}) => {
  const {param1, param2} = route.params;
  
  return (
    <View style={styles.container}>
      <Text>新页面</Text>
      <Text>参数1: {param1}</Text>
      <Text>参数2: {param2}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewPageScreen;
```

#### 步骤 3: 注册页面

在 `src/navigation/AppNavigator.tsx` 中注册新页面：

```typescript
import NewPageScreen from '../screens/NewPageScreen';

// 在 Stack.Navigator 中添加
<Stack.Screen
  name="NewPage"
  component={NewPageScreen}
  options={{
    title: '新页面',
  }}
/>
```

### 4. 自定义页面标题

```typescript
// 静态标题
<Stack.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    title: '个人资料',
  }}
/>

// 动态标题
<Stack.Screen
  name="Details"
  component={DetailsScreen}
  options={({route}) => ({
    title: route.params?.title || '详情',
  })}
/>
```

### 5. 自定义头部样式

```typescript
<Stack.Navigator
  screenOptions={{
    headerStyle: {
      backgroundColor: '#007AFF',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
```

## 常用导航模式

### 1. 替换当前页面

```typescript
navigation.replace('NewScreen');
```

### 2. 重置导航栈

```typescript
navigation.reset({
  index: 0,
  routes: [{name: 'Home'}],
});
```

### 3. 返回到特定页面

```typescript
navigation.navigate('Home');
```

### 4. 监听导航事件

```typescript
React.useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    // 页面获得焦点时执行
    console.log('页面已聚焦');
  });

  return unsubscribe;
}, [navigation]);
```

## 最佳实践

1. **类型安全**: 始终使用 TypeScript 类型定义
2. **参数验证**: 在接收参数时进行适当的验证
3. **错误处理**: 处理导航可能出现的错误
4. **性能优化**: 避免在导航回调中执行重操作
5. **用户体验**: 提供清晰的导航反馈和加载状态

## 扩展功能

### 添加底部标签导航

```bash
npm install @react-navigation/bottom-tabs
```

### 添加抽屉导航

```bash
npm install @react-navigation/drawer
```

### 添加材料设计主题

```bash
npm install @react-navigation/material-top-tabs
```
