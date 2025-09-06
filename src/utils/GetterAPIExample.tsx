import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import SimpleAPI from './GetterAPISimpleDemo';



// 使用 SimpleAPI 作为 APIModules
const APIModules = SimpleAPI;

const GetterAPIExample: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const addResult = (result: any) => {
    setResults(prev => [...prev, result]);
  };

  // 测试网络工具
  const testNetworkUtils = async () => {
    addLog('Testing NetworkUtils (lazy loaded)...');
    try {
      const isOnline = APIModules.NetworkUtils.isOnline();
      addLog(`Network status: ${isOnline ? 'Online' : 'Offline'}`);
      
      if (isOnline) {
        const data = await APIModules.NetworkUtils.fetchData('https://api.example.com/data');
        addResult({ type: 'Network', data });
        addLog('Network request completed');
      }
    } catch (error) {
      addLog(`Network error: ${error}`);
    }
  };

  // 测试存储工具
  const testStorageUtils = async () => {
    addLog('Testing StorageUtils (lazy loaded)...');
    try {
      await APIModules.StorageUtils.setItem('test_key', { value: 'test_data', id: Math.random() });
      const retrieved = await APIModules.StorageUtils.getItem('test_key');
      addResult({ type: 'Storage', data: retrieved });
      addLog('Storage operations completed');
    } catch (error) {
      addLog(`Storage error: ${error}`);
    }
  };

  // 测试基础 Getter API 演示
  const testBasicGetterAPI = () => {
    addLog('Testing Basic Getter API pattern...');
    try {
      // 第一次访问 NetworkUtils - 会触发加载
      const networkUtils = APIModules.NetworkUtils;
      addLog('NetworkUtils loaded successfully');
      
      // 第二次访问 NetworkUtils - 直接使用已加载的模块
      const networkUtils2 = APIModules.NetworkUtils;
      addLog('NetworkUtils accessed again (already loaded)');
      
      // 访问 StorageUtils - 会触发加载
      const storageUtils = APIModules.StorageUtils;
      addLog('StorageUtils loaded successfully');
      
      addResult({
        type: 'Getter API',
        data: {
          networkLoaded: !!networkUtils,
          storageLoaded: !!storageUtils,
          message: 'Both modules loaded via Getter API'
        }
      });
      
      addLog('Basic Getter API test completed');
    } catch (error) {
      addLog(`Getter API error: ${error}`);
    }
  };

  // 测试所有模块
  const testAllModules = async () => {
    addLog('=== Testing All Modules ===');
    setResults([]);
    
    testBasicGetterAPI();
    await testStorageUtils();
    await testNetworkUtils();
    
    addLog('=== All Tests Completed ===');
  };

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
    setResults([]);
  };

  // 显示模块加载树
  const showModuleTree = () => {
    if (typeof global !== 'undefined' && global.__printModuleLoadingTree) {
      global.__printModuleLoadingTree();
      Alert.alert('Module Tree', 'Check console for module loading tree');
    } else {
      Alert.alert('Module Tree', 'Module tracking not available');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Getter API 模块导出示例</Text>
      
      <Text style={styles.description}>
        这个示例展示了如何使用 getter API 来实现模块的延迟加载。
        使用 GetterAPISimpleDemo 中的 SimpleAPI，包含 NetworkUtils 和 StorageUtils 两个模块，
        每个模块只有在首次访问时才会被加载。
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="测试 Getter API" onPress={testBasicGetterAPI} />
        <Button title="测试网络工具" onPress={testNetworkUtils} />
        <Button title="测试存储工具" onPress={testStorageUtils} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="测试所有模块" onPress={testAllModules} color="#2196F3" />
        <Button title="控制台演示" onPress={() => {
          console.log('\n🚀 === Getter API 演示开始 ===\n');
          console.log('1️⃣ 首次访问 NetworkUtils:');
          const networkUtils = APIModules.NetworkUtils;
          console.log('   ✅ NetworkUtils 加载完成');
          
          console.log('\n2️⃣ 再次访问 NetworkUtils:');
          const networkUtils2 = APIModules.NetworkUtils;
          console.log('   ✅ NetworkUtils 直接返回（无需重新加载）');
          
          console.log('\n3️⃣ 首次访问 StorageUtils:');
          const storageUtils = APIModules.StorageUtils;
          console.log('   ✅ StorageUtils 加载完成');
          
          addLog('Getter API 演示已在控制台运行，请查看控制台输出');
        }} color="#4CAF50" />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="显示模块树" onPress={showModuleTree} color="#FF9800" />
        <Button title="清空日志" onPress={clearLogs} color="#f44336" />
      </View>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>执行结果:</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultType}>{result.type}:</Text>
              <Text style={styles.resultData}>
                {typeof result.data === 'object' 
                  ? JSON.stringify(result.data, null, 2)
                  : String(result.data)
                }
              </Text>
            </View>
          ))}
        </View>
      )}

      {logs.length > 0 && (
        <View style={styles.logsContainer}>
          <Text style={styles.sectionTitle}>执行日志:</Text>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logItem}>{log}</Text>
          ))}
        </View>
      )}
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
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultsContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  resultItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  resultType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  resultData: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  logsContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  logItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});

export default GetterAPIExample;
