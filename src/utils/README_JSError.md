# JSError 异常捕获系统

这个系统提供了完整的 JavaScript 错误捕获和处理功能，包括致命错误、Promise 拒绝和组件错误的处理。

## 🏗️ 架构组件

### 1. ErrorHandler (全局错误处理器)
- **位置**: `src/utils/ErrorHandler.ts`
- **功能**: 
  - 捕获全局 JavaScript 错误
  - 处理未处理的 Promise 拒绝
  - 错误日志记录和管理
  - 错误分类和报告

### 2. ErrorBoundary (React 错误边界)
- **位置**: `src/components/ErrorBoundary.tsx`
- **功能**:
  - 捕获 React 组件渲染错误
  - 提供错误恢复 UI
  - 错误详情显示
  - 重试机制

### 3. JSErrorExample (演示组件)
- **位置**: `src/utils/JSErrorExample.tsx`
- **功能**:
  - 各种错误类型的演示
  - 交互式错误测试
  - 实时日志显示
  - 错误处理效果展示

## 🚨 支持的错误类型

### 1. Fatal Error (致命错误)
```javascript
// 触发致命错误
errorHandler.reportError(new Error('致命错误'), 'fatal');
```
- 会显示用户警告对话框
- 记录详细错误信息
- 建议用户重启应用

### 2. Promise Error (Promise 拒绝)
```javascript
// 未处理的 Promise 拒绝
Promise.reject(new Error('Promise 错误'));
```
- **多层检测机制**:
  - 全局 `unhandledrejection` 事件监听
  - `console.error` 拦截和模式匹配
  - Promise 构造函数包装（开发模式）
- **支持多种拒绝类型**:
  - Error 对象: `Promise.reject(new Error('message'))`
  - 字符串: `Promise.reject('error message')`
  - 对象: `Promise.reject({ code: 500, message: 'error' })`
  - 基本类型: `Promise.reject(404)` 或 `Promise.reject(null)`
- **智能错误信息提取**: 自动从不同类型的拒绝值中提取有意义的错误信息
- **开发模式下显示警告**: 提供详细的调试信息

### 3. Component Error (组件错误)
```jsx
// 使用 ErrorBoundary 包装组件
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```
- 捕获组件渲染时的错误
- 显示友好的错误 UI
- 提供重试功能

### 4. Runtime Error (运行时错误)
```javascript
// JavaScript 运行时错误
try {
  null.someMethod();
} catch (error) {
  errorHandler.reportError(error, 'custom');
}
```
- 捕获 JavaScript 执行错误
- 自动记录错误堆栈
- 分类处理不同错误

## 🔧 使用方法

### 1. 初始化 (已在 App.tsx 中完成)
```javascript
import ErrorHandler from './src/utils/ErrorHandler';

const errorHandler = ErrorHandler.getInstance();
errorHandler.init();
```

### 2. 包装应用 (已在 App.tsx 中完成)
```jsx
import ErrorBoundary from './src/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 3. 手动报告错误
```javascript
import ErrorHandler from './src/utils/ErrorHandler';

const errorHandler = ErrorHandler.getInstance();

// 报告自定义错误
errorHandler.reportError('Something went wrong', 'custom');

// 报告 Error 对象
errorHandler.reportError(new Error('Network failed'), 'promise');
```

### 4. 获取错误日志
```javascript
// 获取所有错误日志
const logs = errorHandler.getErrorLogs();

// 导出错误日志
const jsonLogs = errorHandler.exportErrorLogs();

// 清空错误日志
errorHandler.clearErrorLogs();
```

## 📱 演示功能

在 JSError 示例页面中，您可以测试以下功能：

1. **致命错误测试** - 模拟应用崩溃级别的错误
2. **Promise 错误测试** - 模拟多种类型的未处理 Promise 拒绝
3. **组件错误测试** - 触发 ErrorBoundary 捕获
4. **运行时错误测试** - 模拟 JavaScript 运行时异常
5. **异步错误测试** - 模拟异步操作中的错误
6. **Promise 类型测试** - 测试 Error、字符串、对象、数字、null 等不同类型的拒绝
7. **错误日志管理** - 查看、导出、清空错误日志

## 🎯 最佳实践

### 1. 错误分类
- `fatal`: 应用级别的严重错误
- `promise`: Promise 拒绝相关错误
- `component`: React 组件渲染错误
- `custom`: 自定义业务逻辑错误

### 2. 错误处理策略
- **开发环境**: 显示详细错误信息，便于调试
- **生产环境**: 显示友好提示，记录详细日志
- **用户体验**: 提供重试机制，避免应用崩溃

### 3. 日志管理
- 限制日志数量 (默认 100 条)
- 定期清理旧日志
- 支持日志导出和分析

## 🔍 调试技巧

### 1. 控制台输出
所有错误都会在控制台输出详细信息：
```
🚨 Global Error Caught: Error message
📝 Error logged: { type: 'fatal', message: '...', timestamp: ... }
```

### 2. 错误详情查看
- 点击 "查看详情" 按钮查看完整错误信息
- 包含错误堆栈和组件堆栈信息
- 支持复制错误信息用于分析

### 3. 实时监控
- 实时日志显示最新的错误信息
- 错误计数和分类统计
- 时间戳记录便于追踪问题

## 🛠️ 扩展功能

### 1. 自定义错误处理
```javascript
const errorHandler = ErrorHandler.getInstance();

// 自定义错误处理逻辑
errorHandler.reportError(error, 'custom', {
  userId: 'user123',
  screen: 'HomeScreen',
  action: 'button_click'
});
```

### 2. 错误上报
可以扩展 ErrorHandler 来支持错误上报到服务器：
```javascript
// 在 ErrorHandler 中添加上报逻辑
private async reportToServer(errorInfo: ErrorInfo) {
  try {
    await fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify(errorInfo)
    });
  } catch (e) {
    console.warn('Failed to report error to server:', e);
  }
}
```

### 3. 错误恢复策略
```jsx
<ErrorBoundary
  fallback={(error, errorInfo) => (
    <CustomErrorUI error={error} onRetry={handleRetry} />
  )}
  onError={(error, errorInfo) => {
    // 自定义错误处理逻辑
    analytics.track('component_error', { error: error.message });
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## 📊 性能考虑

1. **错误日志限制**: 默认保留最近 100 条错误记录
2. **异步处理**: 错误处理不阻塞主线程
3. **内存管理**: 定期清理过期日志
4. **条件渲染**: 只在开发模式显示详细错误信息

## 🔗 相关文件

- `src/utils/ErrorHandler.ts` - 核心错误处理逻辑
- `src/components/ErrorBoundary.tsx` - React 错误边界组件
- `src/utils/JSErrorExample.tsx` - 演示和测试组件
- `App.tsx` - 全局错误处理初始化
- `src/navigation/AppNavigator.tsx` - 导航集成

这个系统为 React Native 应用提供了完整的错误处理解决方案，确保应用的稳定性和用户体验。
