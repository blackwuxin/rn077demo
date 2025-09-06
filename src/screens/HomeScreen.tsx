import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>欢迎来到首页</Text>
        <Text style={styles.subtitle}>这是一个React Native路由示例</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.buttonText}>前往个人资料</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.buttonText}>前往设置</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Details', {itemId: 42, title: '示例详情'})}>
          <Text style={styles.buttonText}>查看详情页面</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.specialButton]}
          onPress={() => navigation.navigate('InlineRequire')}>
          <Text style={styles.buttonText}>Inline Require 示例</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.getterButton]}
          onPress={() => navigation.navigate('GetterAPI')}>
          <Text style={styles.buttonText}>Getter API 示例</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={() => navigation.navigate('JSError')}>
          <Text style={styles.buttonText}>JSError 异常捕获</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.flatListButton]}
          onPress={() => navigation.navigate('FlatListExample')}>
          <Text style={styles.buttonText}>FlatList 长列表优化</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.comparisonButton]}
          onPress={() => navigation.navigate('ListPerformanceComparison')}>
          <Text style={styles.buttonText}>FlatList vs FlashList 性能对比</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  specialButton: {
    backgroundColor: '#FF6B35',
  },
  getterButton: {
    backgroundColor: '#34C759',
  },
  errorButton: {
    backgroundColor: '#d32f2f',
  },
  flatListButton: {
    backgroundColor: '#1976d2',
  },
  comparisonButton: {
    backgroundColor: '#9C27B0',
  },
});

export default HomeScreen;
