// 全局错误处理器
import { Alert } from 'react-native';
import { setUnhandledPromiseRejectionTracker } from 'react-native-promise-rejection-utils';


export interface ErrorInfo {
  type: 'fatal' | 'promise' | 'component' | 'custom';
  message: string;
  stack?: string;
  timestamp: number;
  componentStack?: string;
  extra?: any;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLogs: ErrorInfo[] = [];
  private maxLogs = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // 初始化全局错误处理
  init() {
    this.setupGlobalErrorHandler();
    this.setupUnhandledPromiseRejection();
    console.log('🛡️ ErrorHandler initialized');
  }

  // 设置全局 JavaScript 错误处理
  private setupGlobalErrorHandler() {
    // React Native 中的 ErrorUtils
    const ErrorUtils = (global as any).ErrorUtils;
    if (!ErrorUtils) {
      console.warn('ErrorUtils not available, skipping global error handler setup');
      return;
    }

    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
      console.log('🚨 Global Error Caught:', error);
      
      const errorInfo: ErrorInfo = {
        type: isFatal ? 'fatal' : 'custom',
        message: error.message || 'Unknown error',
        stack: error.stack,
        timestamp: Date.now(),
        extra: { isFatal }
      };

      this.logError(errorInfo);
      
      if (isFatal) {
        this.handleFatalError(errorInfo);
      }

      // 调用原始处理器
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }

  // 设置未处理的 Promise 拒绝处理
  private setupUnhandledPromiseRejection() {
    setUnhandledPromiseRejectionTracker((error: any) => {
      console.error('🚨 Unhandled Promise Rejection detected:', error);
      const errorInfo: ErrorInfo = {
        type: 'promise',
        message: this.extractPromiseErrorMessage(error),
        stack: error?.stack,
        timestamp: Date.now(),
        extra: { 
          reason: error,
          source: 'unhandledrejection_event'
        }
      };
      
      this.logError(errorInfo);
      this.handlePromiseError(errorInfo);
    });
  }

  // 提取 Promise 错误消息
  private extractPromiseErrorMessage(error: any): string {
    if (error instanceof Error) {
      return `Unhandled Promise Rejection: ${error.message}`;
    }
    
    if (typeof error === 'string') {
      return `Unhandled Promise Rejection: ${error}`;
    }
    
    if (typeof error === 'object' && error !== null) {
      if (error.message) {
        return `Unhandled Promise Rejection: ${error.message}`;
      }
      
      try {
        return `Unhandled Promise Rejection: ${JSON.stringify(error)}`;
      } catch {
        return `Unhandled Promise Rejection: [Object object]`;
      }
    }
    
    return `Unhandled Promise Rejection: ${String(error)}`;
  }

  // 记录错误
  logError(errorInfo: ErrorInfo) {
    this.errorLogs.unshift(errorInfo);
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogs);
    }

    // 输出到控制台
    console.log('📝 Error logged:', {
      type: errorInfo.type,
      message: errorInfo.message,
      timestamp: new Date(errorInfo.timestamp).toLocaleTimeString()
    });
  }

  // 处理致命错误
  private handleFatalError(errorInfo: ErrorInfo) {
    console.log('💀 Fatal Error:', errorInfo);
    
    Alert.alert(
      '应用错误',
      `发生了一个严重错误：\n${errorInfo.message}\n\n应用可能需要重启。`,
      [
        { text: '查看详情', onPress: () => this.showErrorDetails(errorInfo) },
        { text: '确定', style: 'default' }
      ]
    );
  }

  // 处理 Promise 错误
  private handlePromiseError(errorInfo: ErrorInfo) {
    console.warn('⚠️ Promise Error:', errorInfo);
    
    // 可以选择是否显示用户提示
    if (__DEV__) {
      Alert.alert(
        'Promise 错误',
        `检测到未处理的 Promise 拒绝：\n${errorInfo.message}`,
        [
          { text: '查看详情', onPress: () => this.showErrorDetails(errorInfo) },
          { text: '忽略', style: 'cancel' }
        ]
      );
    }
  }

  // 显示错误详情
  private showErrorDetails(errorInfo: ErrorInfo) {
    const details = `
类型: ${errorInfo.type}
时间: ${new Date(errorInfo.timestamp).toLocaleString()}
消息: ${errorInfo.message}
${errorInfo.stack ? `\n堆栈:\n${errorInfo.stack}` : ''}
${errorInfo.componentStack ? `\n组件堆栈:\n${errorInfo.componentStack}` : ''}
    `.trim();

    Alert.alert('错误详情', details, [{ text: '确定' }]);
  }

  // 手动报告错误
  reportError(error: Error | string, type: ErrorInfo['type'] = 'custom', extra?: any) {
    const errorInfo: ErrorInfo = {
      type,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: Date.now(),
      extra
    };

    this.logError(errorInfo);

    if (type === 'fatal') {
      this.handleFatalError(errorInfo);
    } else if (type === 'promise') {
      this.handlePromiseError(errorInfo);
    }
  }

  // 获取错误日志
  getErrorLogs(): ErrorInfo[] {
    return [...this.errorLogs];
  }

  // 清空错误日志
  clearErrorLogs() {
    this.errorLogs = [];
    console.log('🧹 Error logs cleared');
  }

  // 导出错误日志
  exportErrorLogs(): string {
    return JSON.stringify(this.errorLogs, null, 2);
  }
}

export default ErrorHandler;
