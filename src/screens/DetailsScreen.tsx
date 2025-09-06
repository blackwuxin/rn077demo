import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen: React.FC<Props> = ({route, navigation}) => {
  const {itemId, title} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.itemId}>ID: {itemId}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>详细信息</Text>
            <Text style={styles.cardContent}>
              这是一个详情页面示例。您可以在这里显示从上一个页面传递过来的参数信息。
            </Text>
            <Text style={styles.cardContent}>
              当前项目ID: {itemId}
            </Text>
            <Text style={styles.cardContent}>
              页面标题: {title}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>功能说明</Text>
            <Text style={styles.cardContent}>
              • 支持参数传递
            </Text>
            <Text style={styles.cardContent}>
              • 支持返回导航
            </Text>
            <Text style={styles.cardContent}>
              • 响应式布局设计
            </Text>
            <Text style={styles.cardContent}>
              • TypeScript 类型安全
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.buttonText}>前往个人资料</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.goBack()}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                返回上一页
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.homeButton]}
              onPress={() => navigation.navigate('Home')}>
              <Text style={styles.buttonText}>回到首页</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemId: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  cardContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  homeButton: {
    backgroundColor: '#34C759',
  },
});

export default DetailsScreen;
