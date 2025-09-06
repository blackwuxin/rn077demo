import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({navigation}) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
  }> = ({title, subtitle, rightComponent, onPress}) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知设置</Text>
          <SettingItem
            title="推送通知"
            subtitle="接收应用推送消息"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>外观</Text>
          <SettingItem
            title="深色模式"
            subtitle="使用深色主题"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据同步</Text>
          <SettingItem
            title="自动同步"
            subtitle="自动同步数据到云端"
            rightComponent={
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={autoSync ? '#007AFF' : '#f4f3f4'}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他</Text>
          <SettingItem
            title="关于我们"
            subtitle="查看应用信息"
            rightComponent={<Text style={styles.arrow}>›</Text>}
            onPress={() => {
              // 这里可以导航到关于页面
              console.log('导航到关于页面');
            }}
          />
          <SettingItem
            title="帮助与反馈"
            subtitle="获取帮助或提供反馈"
            rightComponent={<Text style={styles.arrow}>›</Text>}
            onPress={() => {
              // 这里可以导航到帮助页面
              console.log('导航到帮助页面');
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
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
  section: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: '300',
  },
  backButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SettingsScreen;
