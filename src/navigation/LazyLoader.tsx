import React, {Suspense, useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import {performanceMonitor} from '../utils/PerformanceMonitor';

// 加载中组件
const LoadingScreen: React.FC<{message?: string}> = ({
  message = '加载中...',
}) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// 高级懒加载包装器
interface LazyWrapperProps {
  children: React.ReactNode;
  loadingMessage?: string;
  delay?: number;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  loadingMessage,
  delay = 0,
}) => {
  const [isReady, setIsReady] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          setIsReady(true);
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!isReady) {
    return <LoadingScreen message={loadingMessage} />;
  }

  return (
    <Suspense fallback={<LoadingScreen message={loadingMessage} />}>
      {children}
    </Suspense>
  );
};

// 创建懒加载页面的工厂函数
export const createLazyScreen = <T extends Record<string, any>>(
  importFn: () => Promise<{default: React.ComponentType<T>}>,
  loadingMessage?: string,
  screenName?: string,
) => {
  const LazyComponent = React.lazy(() => {
    const loadStartTime = Date.now();
    if (screenName) {
      performanceMonitor.startScreenLoad(screenName);
    }
    
    return importFn().then(module => {
      if (screenName) {
        const loadTime = Date.now() - loadStartTime;
        console.log(`📦 [懒加载] ${screenName} 模块加载完成，耗时: ${loadTime}ms`);
      }
      return module;
    });
  });

  return (props: T) => {
    useEffect(() => {
      if (screenName) {
        performanceMonitor.endScreenLoad(screenName);
      }
    }, []);

    return (
      <LazyWrapper loadingMessage={loadingMessage}>
        <LazyComponent {...(props as any)} />
      </LazyWrapper>
    );
  };
};

// 预加载函数
export const preloadScreen = (
  importFn: () => Promise<{default: React.ComponentType<any>}>,
) => {
  // 在空闲时间预加载组件
  InteractionManager.runAfterInteractions(() => {
    importFn().catch(() => {
      // 静默处理预加载错误
    });
  });
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LazyWrapper;
