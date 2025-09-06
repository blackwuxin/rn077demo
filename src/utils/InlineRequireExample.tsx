/**
 * Inline Require 示例
 * 演示如何使用内联 require 来优化组件加载性能
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

// 传统的顶层导入方式（会在模块加载时立即执行）
// import {format} from 'date-fns';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const InlineRequireExample: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [savedData, setSavedData] = useState<string>('');
  const [loadTimes, setLoadTimes] = useState<{[key: string]: number}>({});

  // 示例1: 内联 require 日期格式化库
  const formatCurrentTime = useCallback(() => {
    const startTime = Date.now();
    
    // 使用内联 require，只在需要时加载 date-fns
    const {format} = require('date-fns');
    const {zhCN} = require('date-fns/locale');
    
    const formatted = format(new Date(), 'yyyy年MM月dd日 HH:mm:ss', {
      locale: zhCN,
    });
    
    const loadTime = Date.now() - startTime;
    setCurrentTime(formatted);
    setLoadTimes(prev => ({...prev, dateFns: loadTime}));
    
    console.log(`📦 [Inline Require] date-fns 加载耗时: ${loadTime}ms`);
  }, []);

  // 示例2: 内联 require AsyncStorage
  const saveData = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      // 使用内联 require，只在需要时加载 AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      const data = `保存时间: ${new Date().toISOString()}`;
      await AsyncStorage.setItem('example_data', data);
      
      const loadTime = Date.now() - startTime;
      setLoadTimes(prev => ({...prev, asyncStorage: loadTime}));
      
      Alert.alert('成功', '数据已保存');
      console.log(`📦 [Inline Require] AsyncStorage 加载耗时: ${loadTime}ms`);
    } catch (error) {
      Alert.alert('错误', '保存失败');
      console.error('保存数据失败:', error);
    }
  }, []);

  // 示例3: 内联 require 读取数据
  const loadData = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      // 使用内联 require
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      const data = await AsyncStorage.getItem('example_data');
      setSavedData(data || '暂无数据');
      
      const loadTime = Date.now() - startTime;
      setLoadTimes(prev => ({...prev, loadData: loadTime}));
      
      console.log(`📦 [Inline Require] 读取数据耗时: ${loadTime}ms`);
    } catch (error) {
      setSavedData('读取失败');
      console.error('读取数据失败:', error);
    }
  }, []);

  // 示例4: 条件性内联 require
  const performComplexCalculation = useCallback(() => {
    const startTime = Date.now();
    
    // 只有在需要复杂计算时才加载 lodash
    const _ = require('lodash');
    
    // 模拟复杂计算
    const numbers = Array.from({length: 1000}, (_, i) => i);
    const result = _.chain(numbers)
      .filter((n: number) => n % 2 === 0)
      .map((n: number) => n * 2)
      .sum()
      .value();
    
    const loadTime = Date.now() - startTime;
    setLoadTimes(prev => ({...prev, lodash: loadTime}));
    
    Alert.alert('计算结果', `结果: ${result}`);
    console.log(`📦 [Inline Require] lodash 计算耗时: ${loadTime}ms`);
  }, []);

  // 示例5: 动态功能加载
  const loadAdvancedFeature = useCallback(() => {
    const startTime = Date.now();
    
    // 模拟加载高级功能模块
    try {
      // 假设这是一个大型的图表库
      const Chart = require('react-native-chart-kit');
      
      const loadTime = Date.now() - startTime;
      setLoadTimes(prev => ({...prev, chartKit: loadTime}));
      
      Alert.alert('功能已加载', '图表功能现在可用');
      console.log(`📦 [Inline Require] Chart Kit 加载耗时: ${loadTime}ms`);
    } catch (error) {
      Alert.alert('加载失败', '图表功能不可用');
      console.log('Chart Kit 未安装，这是正常的演示行为');
    }
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Inline Require 示例</Text>
      <Text style={styles.subtitle}>
        演示如何使用内联 require 优化模块加载性能
      </Text>

      {/* 性能统计 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>加载性能统计:</Text>
        {Object.entries(loadTimes).map(([module, time]) => (
          <Text key={module} style={styles.statsItem}>
            {module}: {time}ms
          </Text>
        ))}
      </View>

      {/* 示例按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={formatCurrentTime}>
          <Text style={styles.buttonText}>格式化当前时间</Text>
          <Text style={styles.buttonSubtext}>(内联 require date-fns)</Text>
        </TouchableOpacity>

        {currentTime ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{currentTime}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={saveData}>
          <Text style={styles.buttonText}>保存数据</Text>
          <Text style={styles.buttonSubtext}>(内联 require AsyncStorage)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>读取数据</Text>
          <Text style={styles.buttonSubtext}>(内联 require AsyncStorage)</Text>
        </TouchableOpacity>

        {savedData ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{savedData}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={performComplexCalculation}>
          <Text style={styles.buttonText}>复杂计算</Text>
          <Text style={styles.buttonSubtext}>(内联 require lodash)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={loadAdvancedFeature}>
          <Text style={styles.buttonText}>加载高级功能</Text>
          <Text style={styles.buttonSubtext}>(内联 require chart-kit)</Text>
        </TouchableOpacity>
      </View>

      {/* 说明文档 */}
      <View style={styles.docContainer}>
        <Text style={styles.docTitle}>Inline Require 优势:</Text>
        <Text style={styles.docItem}>• 减少应用启动时间</Text>
        <Text style={styles.docItem}>• 降低初始内存占用</Text>
        <Text style={styles.docItem}>• 按需加载第三方库</Text>
        <Text style={styles.docItem}>• 提升代码分割效果</Text>
        
        <Text style={styles.docTitle}>适用场景:</Text>
        <Text style={styles.docItem}>• 大型第三方库 (lodash, moment等)</Text>
        <Text style={styles.docItem}>• 条件性功能模块</Text>
        <Text style={styles.docItem}>• 低频使用的工具函数</Text>
        <Text style={styles.docItem}>• 平台特定的模块</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statsItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
  docContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  docItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    paddingLeft: 10,
  },
});

export default InlineRequireExample;
