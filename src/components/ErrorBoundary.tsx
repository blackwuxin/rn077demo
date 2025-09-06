import React, { Component, ReactNode } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import ErrorHandler, { ErrorInfo } from '../utils/ErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  private errorHandler: ErrorHandler;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);
    
    // 记录错误到 ErrorHandler
    const errorData: ErrorInfo = {
      type: 'component',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      extra: { errorInfo }
    };
    
    this.errorHandler.logError(errorData);
    
    // 更新状态
    this.setState({
      error,
      errorInfo
    });

    // 调用自定义错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleShowDetails = () => {
    if (this.state.error && this.state.errorInfo) {
      const details = `
错误: ${this.state.error.message}

堆栈跟踪:
${this.state.error.stack || 'No stack trace available'}

组件堆栈:
${this.state.errorInfo.componentStack || 'No component stack available'}
      `.trim();
      
      console.log('📋 Error Details:', details);
      // 在实际应用中，这里可以显示一个模态框或导航到错误详情页面
    }
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // 默认错误 UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>😵 出错了</Text>
            <Text style={styles.message}>
              应用遇到了一个意外错误，但不用担心，您的数据是安全的。
            </Text>
            
            {this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>错误信息:</Text>
                <ScrollView style={styles.errorScroll}>
                  <Text style={styles.errorText}>
                    {this.state.error.message}
                  </Text>
                </ScrollView>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <Button
                title="重试"
                onPress={this.handleRetry}
                color="#2196F3"
              />
              <View style={styles.buttonSpacer} />
              <Button
                title="查看详情"
                onPress={this.handleShowDetails}
                color="#FF9800"
              />
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxWidth: '100%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  errorDetails: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  errorScroll: {
    maxHeight: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonSpacer: {
    width: 20,
  },
});

export default ErrorBoundary;
