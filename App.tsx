/**
 * Sample React Native App with Navigation
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorHandler from './src/utils/ErrorHandler';
import ErrorBoundary from './src/components/ErrorBoundary';

function App(): React.JSX.Element {
  useEffect(() => {
    // 初始化全局错误处理器
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.init();
    
    console.log('🚀 App started with global error handling');
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppNavigator />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
