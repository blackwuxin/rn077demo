# React Native Inline Require 指南

## 🎯 什么是 Inline Require？

Inline Require 是 React Native 中的一种性能优化技术，通过在需要时才加载模块，而不是在文件顶部预先导入所有依赖。

## 🚀 核心概念

### 传统导入方式 vs Inline Require

```typescript
// ❌ 传统方式 - 在模块加载时立即执行
import {format} from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';

// ✅ Inline Require - 按需加载
const formatDate = () => {
  const {format} = require('date-fns'); // 只在需要时加载
  return format(new Date(), 'yyyy-MM-dd');
};
```

## 📊 性能优势

| 指标 | 传统导入 | Inline Require | 提升 |
|------|----------|----------------|------|
| 启动时间 | 较慢 | 更快 | **30-50%** |
| 内存占用 | 较高 | 较低 | **20-40%** |
| Bundle 大小 | 较大 | 更小 | **代码分割** |
| 首屏渲染 | 较慢 | 更快 | **显著改善** |

## 🛠 实际应用场景

### 1. 大型第三方库

```typescript
// ❌ 避免在顶部导入大型库
import _ from 'lodash'; // ~70KB

// ✅ 按需加载
const performComplexOperation = (data: any[]) => {
  const _ = require('lodash'); // 只在需要时加载
  return _.chain(data).filter().map().value();
};
```

### 2. 条件性功能

```typescript
// ✅ 只在特定条件下加载
const handleAdvancedFeature = (isAdvancedUser: boolean) => {
  if (isAdvancedUser) {
    const AdvancedModule = require('./AdvancedModule');
    return AdvancedModule.process();
  }
  return null;
};
```

### 3. 平台特定模块

```typescript
// ✅ 根据平台按需加载
const getPlatformSpecificModule = () => {
  if (Platform.OS === 'ios') {
    return require('./IOSSpecificModule');
  } else {
    return require('./AndroidSpecificModule');
  }
};
```

### 4. 异步存储操作

```typescript
// ✅ 只在需要存储时加载 AsyncStorage
const saveUserData = async (data: any) => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.setItem('userData', JSON.stringify(data));
};
```

### 5. 日期格式化

```typescript
// ✅ 只在需要格式化时加载 date-fns
const formatTimestamp = (timestamp: number) => {
  const {format} = require('date-fns');
  const {zhCN} = require('date-fns/locale');
  return format(new Date(timestamp), 'PPP', {locale: zhCN});
};
```

## 🎨 最佳实践

### 1. 识别适合的场景

```typescript
// ✅ 适合 Inline Require 的场景：
- 大型第三方库 (lodash, moment, chart libraries)
- 条件性功能模块
- 平台特定代码
- 低频使用的工具函数
- 开发工具和调试模块

// ❌ 不适合的场景：
- 核心业务逻辑
- 频繁使用的小型模块
- React 组件的基础依赖
- 应用启动必需的模块
```

### 2. 性能监控

```typescript
const loadModuleWithTiming = (moduleName: string) => {
  const startTime = Date.now();
  const module = require(moduleName);
  const loadTime = Date.now() - startTime;
  
  console.log(`📦 [Inline Require] ${moduleName} 加载耗时: ${loadTime}ms`);
  return module;
};
```

### 3. 错误处理

```typescript
const safeRequire = (moduleName: string) => {
  try {
    return require(moduleName);
  } catch (error) {
    console.warn(`⚠️ 模块 ${moduleName} 加载失败:`, error);
    return null;
  }
};
```

### 4. 缓存策略

```typescript
const moduleCache = new Map();

const getCachedModule = (moduleName: string) => {
  if (moduleCache.has(moduleName)) {
    return moduleCache.get(moduleName);
  }
  
  const module = require(moduleName);
  moduleCache.set(moduleName, module);
  return module;
};
```

## 🔧 配置和工具

### Metro 配置

```javascript
// metro.config.js
module.exports = {
  transformer: {
    // 启用内联 require 优化
    inlineRequires: true,
  },
  resolver: {
    // 配置模块解析
    alias: {
      '@utils': './src/utils',
    },
  },
};
```

### TypeScript 配置

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 📈 性能测试

### 测试工具

```typescript
class InlineRequireProfiler {
  private static loadTimes = new Map<string, number[]>();
  
  static measureLoad(moduleName: string, loadFn: () => any) {
    const startTime = performance.now();
    const result = loadFn();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    const times = this.loadTimes.get(moduleName) || [];
    times.push(loadTime);
    this.loadTimes.set(moduleName, times);
    
    return result;
  }
  
  static getReport() {
    const report = Array.from(this.loadTimes.entries()).map(([module, times]) => ({
      module,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      loadCount: times.length,
    }));
    
    return report.sort((a, b) => b.avgTime - a.avgTime);
  }
}
```

### 性能对比

```typescript
// 测试传统导入 vs Inline Require
const benchmarkImportMethods = () => {
  console.log('🏁 开始性能对比测试...');
  
  // 测试传统导入
  const traditionalStart = performance.now();
  // 模拟传统导入的初始化成本
  const traditionalEnd = performance.now();
  
  // 测试 Inline Require
  const inlineStart = performance.now();
  const _ = require('lodash'); // 按需加载
  const inlineEnd = performance.now();
  
  console.log(`传统导入耗时: ${traditionalEnd - traditionalStart}ms`);
  console.log(`Inline Require 耗时: ${inlineEnd - inlineStart}ms`);
};
```

## ⚠️ 注意事项

### 1. 避免过度使用

```typescript
// ❌ 不要对小型、频繁使用的模块使用
const add = (a: number, b: number) => {
  const {add} = require('./mathUtils'); // 过度优化
  return add(a, b);
};

// ✅ 对大型、低频模块使用
const generateComplexChart = (data: any[]) => {
  const ChartLibrary = require('react-native-chart-kit'); // 合适的使用
  return ChartLibrary.generateChart(data);
};
```

### 2. 考虑用户体验

```typescript
// ✅ 提供加载反馈
const loadHeavyModule = async () => {
  setLoading(true);
  try {
    const HeavyModule = require('./HeavyModule');
    return HeavyModule;
  } finally {
    setLoading(false);
  }
};
```

### 3. 测试覆盖

```typescript
// ✅ 确保 Inline Require 的代码路径被测试覆盖
describe('Inline Require 功能', () => {
  it('应该正确加载模块', () => {
    const result = loadModuleFunction();
    expect(result).toBeDefined();
  });
});
```

## 🚀 实施步骤

1. **分析现有导入**: 识别大型或条件性模块
2. **逐步迁移**: 从影响最大的模块开始
3. **性能测试**: 测量优化前后的性能差异
4. **监控指标**: 持续监控应用性能
5. **用户反馈**: 收集用户体验反馈

## 📚 相关资源

- [React Native 性能优化官方文档](https://reactnative.dev/docs/performance)
- [Metro Bundler 配置](https://metrobundler.dev/docs/configuration)
- [JavaScript 模块系统最佳实践](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
