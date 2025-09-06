import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorHandler from './ErrorHandler';

// 故意出错的组件
const BuggyComponent: React.FC<{ shouldCrash: boolean }> = ({ shouldCrash }) => {
  if (shouldCrash) {
    // 这会触发 ErrorBoundary
    throw new Error('💥 BuggyComponent intentionally crashed!');
  }
  
  return (
    <View style={styles.buggyContainer}>
      <Text style={styles.buggyText}>✅ 组件正常运行</Text>
    </View>
  );
};

const JSErrorExample: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [shouldCrash, setShouldCrash] = useState(false);
  const [errorHandler] = useState(() => ErrorHandler.getInstance());

  useEffect(() => {
    // 初始化错误处理器
    errorHandler.init();
    addLog('🛡️ ErrorHandler 已初始化');
    
    return () => {
      // 清理
    };
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  // 触发致命错误
  const triggerFatalError = () => {
    addLog('🚨 触发致命错误...');
    // const error = new Error('这是一个模拟的致命错误');
    // throw error;
    aaaaa
  };

  // 触发 Promise 错误
  const triggerPromiseError = () => {
    addLog('⚠️ 触发 Promise 错误...');
    
    Promise.reject(new Error('真正的未处理 Promise 拒绝'));
    
  };

  // 触发组件错误（ErrorBoundary 捕获）
  const triggerComponentError = () => {
    addLog('🔴 触发组件错误...');
    setShouldCrash(true);
    
    // 重置状态，以便可以再次测试
    setTimeout(() => {
      setShouldCrash(false);
    }, 3000);
  };

  // 触发 JavaScript 运行时错误
  const triggerRuntimeError = () => {
    addLog('💀 触发运行时错误...');

      // 这会触发全局错误处理器
      (null as any).someMethod();

  };

  // 触发异步错误
  const triggerAsyncError = async () => {
    addLog('🔄 触发异步错误...');
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('异步操作失败'));
        }, 1000);
      });
  };


  // 显示错误日志
  const showErrorLogs = () => {
    const errorLogs = errorHandler.getErrorLogs();
    if (errorLogs.length === 0) {
      Alert.alert('错误日志', '暂无错误记录');
      return;
    }

    const summary = errorLogs.slice(0, 5).map((log, index) => 
      `${index + 1}. [${log.type}] ${log.message.substring(0, 50)}...`
    ).join('\n');

    Alert.alert(
      '错误日志',
      `最近 ${Math.min(5, errorLogs.length)} 条错误:\n\n${summary}`,
      [
        { text: '查看详情', onPress: () => console.log('📋 完整错误日志:', errorLogs) },
        { text: '导出日志', onPress: () => console.log('📤 导出日志:', errorHandler.exportErrorLogs()) },
        { text: '关闭', style: 'cancel' }
      ]
    );
  };

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
    errorHandler.clearErrorLogs();
    addLog('🧹 日志已清空');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>JSError 异常捕获示例</Text>
      
      <Text style={styles.description}>
        这个示例演示了如何捕获和处理各种类型的 JavaScript 错误，
        包括致命错误、Promise 拒绝、组件错误和运行时错误。
      </Text>

      {/* ErrorBoundary 测试区域 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛡️ ErrorBoundary 测试</Text>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            addLog(`🔴 ErrorBoundary 捕获: ${error.message}`);
          }}
        >
          <BuggyComponent shouldCrash={shouldCrash} />
        </ErrorBoundary>
      </View>

      {/* 错误触发按钮 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 错误触发测试</Text>
        
        <View style={styles.buttonGrid}>
          <Button
            title="致命错误"
            onPress={triggerFatalError}
            color="#d32f2f"
          />
          <Button
            title="Promise 错误"
            onPress={triggerPromiseError}
            color="#f57c00"
          />
        </View>
        
        <View style={styles.buttonGrid}>
          <Button
            title="组件错误"
            onPress={triggerComponentError}
            color="#7b1fa2"
          />
          <Button
            title="运行时错误"
            onPress={triggerRuntimeError}
            color="#c62828"
          />
        </View>
        
        <View style={styles.buttonGrid}>
          <Button
            title="异步错误"
            onPress={triggerAsyncError}
            color="#ad1457"
          />
        </View>
      </View>

      {/* 日志管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 日志管理</Text>
        
        <View style={styles.buttonGrid}>
          <Button
            title="查看错误日志"
            onPress={showErrorLogs}
            color="#1976d2"
          />
          <Button
            title="清空日志"
            onPress={clearLogs}
            color="#388e3c"
          />
        </View>
      </View>

      {/* 实时日志 */}
      {logs.length > 0 && (
        <View style={styles.logsContainer}>
          <Text style={styles.sectionTitle}>📝 实时日志</Text>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logItem}>
              {log}
            </Text>
          ))}
        </View>
      )}

      {/* 使用说明 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 使用说明</Text>
        <Text style={styles.instruction}>
          • <Text style={styles.bold}>致命错误</Text>: 模拟应用崩溃级别的错误{'\n'}
          • <Text style={styles.bold}>Promise 错误</Text>: 模拟未处理的 Promise 拒绝{'\n'}
          • <Text style={styles.bold}>组件错误</Text>: 触发 ErrorBoundary 捕获的组件错误{'\n'}
          • <Text style={styles.bold}>运行时错误</Text>: 模拟 JavaScript 运行时异常{'\n'}
          • <Text style={styles.bold}>异步错误</Text>: 模拟异步操作中的错误{'\n'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  buggyContainer: {
    padding: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
    alignItems: 'center',
  },
  buggyText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  logsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  logItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default JSErrorExample;
