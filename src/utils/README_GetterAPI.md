# Getter API 模块导出示例

这个示例展示了如何在 React Native 中使用 Getter API 来实现模块的延迟加载和动态导入。

## 📁 文件结构

- `GetterAPIExample.tsx` - React 组件，提供可视化界面测试 Getter API
- `GetterAPIDemo.ts` - 核心演示模块，包含各种 Getter API 模式
- `SimpleGetterExample.ts` - 简单的 Getter API 示例集合

## 🎯 主要特性

### 1. 基础 Getter API 模式
```javascript
const BasicAPI = {
  get utils() {
    console.log('Loading utils module...');
    return require('./utils');
  },
  
  get constants() {
    console.log('Loading constants module...');
    return require('./constants');
  }
};
```

### 2. 条件加载模式
```javascript
const ConditionalAPI = {
  get platform() {
    const Platform = require('react-native').Platform;
    if (Platform.OS === 'ios') {
      return require('./ios-specific');
    } else {
      return require('./android-specific');
    }
  }
};
```

### 3. 缓存模式
```javascript
const cachedModules = new Map();

const CachedAPI = {
  get database() {
    if (!cachedModules.has('database')) {
      cachedModules.set('database', require('./database'));
    }
    return cachedModules.get('database');
  }
};
```

### 4. 工厂模式
```javascript
const FactoryAPI = {
  get logger() {
    const LoggerClass = require('./Logger').default;
    return new LoggerClass({
      level: __DEV__ ? 'debug' : 'error'
    });
  }
};
```

## 🚀 使用方法

### 在应用中测试

1. 启动 React Native 应用
2. 导航到 "Getter API 示例" 页面
3. 点击各种按钮测试不同的功能
4. 查看控制台输出了解模块加载过程

### 在控制台中测试

```javascript
// 运行完整演示
demonstrateGetterAPIs();

// 测试基础 API
const utils = BasicAPI.utils;
console.log(utils.formatString('hello'));

// 测试条件加载
const platformModule = ConditionalAPI.platform;
console.log(platformModule.platform);

// 测试缓存
const db1 = CachedAPI.database; // 首次加载
const db2 = CachedAPI.database; // 使用缓存

// 查看模块加载树
__printModuleLoadingTree();
```

## 💡 优势

1. **延迟加载**: 模块只在首次访问时才被加载
2. **减少初始包大小**: 避免在应用启动时加载所有模块
3. **条件加载**: 根据平台、环境等条件加载不同模块
4. **缓存机制**: 避免重复加载相同模块
5. **工厂模式**: 动态创建配置化的实例
6. **代码分割**: 更好的代码组织和分割

## 📊 性能监控

使用内置的模块加载跟踪功能：

```javascript
// 查看模块加载树
__printModuleLoadingTree();

// 查看最慢的模块
__getSlowModules(10);

// 清理跟踪数据
__clearModuleLoadingTree();
```

## ⚠️ 注意事项

1. **开发环境**: 某些功能仅在开发环境中可用
2. **模块路径**: 确保模块路径正确，避免运行时错误
3. **循环依赖**: 避免模块间的循环依赖
4. **内存管理**: 注意缓存模块的内存使用

## 🔧 自定义扩展

你可以基于这些模式创建自己的 Getter API：

```javascript
const MyAPI = {
  get customModule() {
    // 你的自定义加载逻辑
    return require('./my-custom-module');
  }
};
```

## 📝 最佳实践

1. 使用有意义的模块名称
2. 添加适当的日志记录
3. 处理模块加载错误
4. 考虑使用 TypeScript 类型定义
5. 在生产环境中优化加载策略
