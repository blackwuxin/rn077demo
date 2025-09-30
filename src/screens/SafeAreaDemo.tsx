import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaInsetsContext,
} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SafeAreaDemo'>;

// 使用 useSafeAreaInsets Hook 的组件
const InsetsDemo: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.demoSection}>
      <Text style={styles.sectionTitle}>Safe Area Insets</Text>
      <Text style={styles.insetText}>Top: {insets.top}px</Text>
      <Text style={styles.insetText}>Bottom: {insets.bottom}px</Text>
      <Text style={styles.insetText}>Left: {insets.left}px</Text>
      <Text style={styles.insetText}>Right: {insets.right}px</Text>
    </View>
  );
};

// 使用 useSafeAreaFrame Hook 的组件
const FrameDemo: React.FC = () => {
  const frame = useSafeAreaFrame();
  
  return (
    <View style={styles.demoSection}>
      <Text style={styles.sectionTitle}>Safe Area Frame</Text>
      <Text style={styles.insetText}>Width: {frame.width.toFixed(1)}px</Text>
      <Text style={styles.insetText}>Height: {frame.height.toFixed(1)}px</Text>
      <Text style={styles.insetText}>X: {frame.x}px</Text>
      <Text style={styles.insetText}>Y: {frame.y}px</Text>
    </View>
  );
};

// 使用 SafeAreaInsetsContext 的组件
const ContextDemo: React.FC = () => {
  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>Context Consumer</Text>
          {insets ? (
            <>
              <Text style={styles.insetText}>Top: {insets.top}px</Text>
              <Text style={styles.insetText}>Bottom: {insets.bottom}px</Text>
              <Text style={styles.insetText}>Left: {insets.left}px</Text>
              <Text style={styles.insetText}>Right: {insets.right}px</Text>
            </>
          ) : (
            <Text style={styles.insetText}>No insets available</Text>
          )}
        </View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

// 动态样式组件
const DynamicStyleDemo: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  const dynamicStyle = {
    paddingTop: insets.top + 20,
    paddingBottom: insets.bottom + 20,
    paddingLeft: insets.left + 20,
    paddingRight: insets.right + 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    margin: 10,
  };
  
  return (
    <View style={dynamicStyle}>
      <Text style={styles.sectionTitle}>Dynamic Padding</Text>
      <Text style={styles.description}>
        这个容器的内边距会根据安全区域自动调整
      </Text>
    </View>
  );
};

const SafeAreaDemo: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  
  const showInsetsAlert = () => {
    Alert.alert(
      'Current Insets',
      `Top: ${insets.top}px\nBottom: ${insets.bottom}px\nLeft: ${insets.left}px\nRight: ${insets.right}px`,
      [{text: 'OK'}]
    );
  };

  const showAbsoluteButtonInfo = () => {
    Alert.alert(
      '绝对定位按钮',
      `这个按钮使用绝对定位在底部，并通过 SafeAreaInsets 自动适配底部安全区域。\n\n当前底部安全区域: ${insets.bottom}px`,
      [{text: '知道了'}]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: 80}]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>SafeAreaContext 示例</Text>
          <Text style={styles.subtitle}>
            展示 react-native-safe-area-context 的各种用法
          </Text>
        </View>

        {/* Hooks 示例 */}
        <InsetsDemo />
        <FrameDemo />
        <ContextDemo />
        
        {/* 动态样式示例 */}
        <DynamicStyleDemo />
        
        {/* SafeAreaView 不同 edges 配置示例 */}
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>SafeAreaView Edges</Text>
          <Text style={styles.description}>
            当前 SafeAreaView 只应用了 bottom edge
          </Text>
          
          <SafeAreaView style={styles.edgeDemo} edges={['top']}>
            <Text style={styles.edgeText}>Top Edge Only</Text>
          </SafeAreaView>
          
          <SafeAreaView style={styles.edgeDemo} edges={['left', 'right']}>
            <Text style={styles.edgeText}>Left & Right Edges</Text>
          </SafeAreaView>
          
          <SafeAreaView style={styles.edgeDemo} edges={[]}>
            <Text style={styles.edgeText}>No Edges</Text>
          </SafeAreaView>
        </View>
        
        {/* 交互示例 */}
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>交互示例</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={showInsetsAlert}
          >
            <Text style={styles.buttonText}>显示当前 Insets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>返回首页</Text>
          </TouchableOpacity>
        </View>
        
        {/* 绝对定位示例说明 */}
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>绝对定位示例</Text>
          <Text style={styles.description}>
            查看页面底部的橙色按钮！它使用绝对定位，并通过 useSafeAreaInsets() 动态适配底部安全区域。
          </Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeTitle}>代码示例:</Text>
            <Text style={styles.codeText}>
{`const insets = useSafeAreaInsets();

<TouchableOpacity 
  style={{
    position: 'absolute',
    bottom: insets.bottom + 20,
    left: 20,
    right: 20,
    // ... 其他样式
  }}
>
  <Text>绝对定位按钮</Text>
</TouchableOpacity>`}
            </Text>
          </View>
        </View>

        {/* 实用技巧 */}
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>实用技巧</Text>
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 提示 1:</Text>
            <Text style={styles.tipText}>
              使用 useSafeAreaInsets() 获取安全区域边距，适用于动态布局
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 提示 2:</Text>
            <Text style={styles.tipText}>
              SafeAreaView 的 edges 属性可以选择性地应用安全区域
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 提示 3:</Text>
            <Text style={styles.tipText}>
              在 App 根组件使用 SafeAreaProvider 包裹整个应用
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 提示 4:</Text>
            <Text style={styles.tipText}>
              绝对定位元素需要手动处理安全区域，使用 insets.bottom + 额外间距
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* 绝对定位的底部按钮 - 展示 SafeAreaInsets 的实际应用 */}
      <TouchableOpacity 
        style={[
          styles.absoluteButton,
          {
            bottom: insets.bottom , // 动态适配底部安全区域
          }
        ]}
        onPress={showAbsoluteButtonInfo}
      >
        <Text style={styles.absoluteButtonText}>
          🚀 绝对定位按钮 (底部安全区域: {insets.bottom}px)
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  demoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insetText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    fontFamily: 'Courier New',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  edgeDemo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  edgeText: {
    fontSize: 12,
    color: '#2e7d32',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 6,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#bf360c',
    lineHeight: 16,
  },
  absoluteButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  absoluteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 18,
  },
  codeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    color: '#495057',
    fontFamily: 'Courier New',
    lineHeight: 16,
  },
});

export default SafeAreaDemo;
