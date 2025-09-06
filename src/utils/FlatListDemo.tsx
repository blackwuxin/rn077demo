/**
 * FlatList Performance Comparison Demo
 * 复杂item的FlatList性能优化示例
 * @format
 */

import React, {useState, useCallback, useMemo, memo, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';

const {width: screenWidth} = Dimensions.get('window');

// 复杂的数据结构
interface UserData {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isVerified: boolean;
  tags: string[];
  lastActive: string;
  joinDate: string;
  rating: number;
}

// 生成复杂的测试数据
const generateComplexData = (count: number): UserData[] => {
  const data: UserData[] = [];
  const companies = ['Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'SpaceX'];
  const tags = ['Developer', 'Designer', 'Manager', 'Analyst', 'Engineer', 'Consultant', 'Freelancer'];
  
  for (let i = 0; i < count; i++) {
    data.push({
      id: `user_${i}`,
      name: `User ${i + 1}`,
      avatar: `https://picsum.photos/60/60?random=${i}`,
      email: `user${i + 1}@example.com`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      address: `${Math.floor(Math.random() * 9999) + 1} Main St, City ${i + 1}`,
      company: companies[Math.floor(Math.random() * companies.length)],
      bio: `This is a detailed bio for user ${i + 1}. They are passionate about technology and innovation. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      followers: Math.floor(Math.random() * 10000),
      following: Math.floor(Math.random() * 1000),
      posts: Math.floor(Math.random() * 500),
      isVerified: Math.random() > 0.7,
      tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
      lastActive: `${Math.floor(Math.random() * 24)}h ago`,
      joinDate: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      rating: Math.floor(Math.random() * 5) + 1,
    });
  }
  return data;
};

// 基础版本的复杂Item组件（未优化）
const BasicComplexItem = ({item, onPress}: {item: UserData; onPress: (item: UserData) => void}) => {
  // 每次渲染都会重新计算（性能问题）
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderStars = (rating: number) => {
    return Array.from({length: 5}, (_, index) => (
      <Text key={index} style={styles.star}>
        {index < rating ? '★' : '☆'}
      </Text>
    ));
  };

  const renderTags = (tags: string[]) => {
    return tags.map((tag, index) => (
      <View key={index} style={styles.tag}>
        <Text style={styles.tagText}>{tag}</Text>
      </View>
    ));
  };

  return (
    <Pressable style={styles.itemContainer} onPress={() => onPress(item)}>
      <View style={styles.itemHeader}>
        <Image source={{uri: item.avatar}} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {item.isVerified && <Text style={styles.verified}>✓</Text>}
          </View>
          <Text style={styles.company}>{item.company}</Text>
          <Text style={styles.lastActive}>Active {item.lastActive}</Text>
        </View>
        <View style={styles.rating}>
          {renderStars(item.rating)}
        </View>
      </View>
      
      <Text style={styles.bio}>{item.bio}</Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{formatNumber(item.followers)}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{formatNumber(item.following)}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{formatNumber(item.posts)}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>
      
      <View style={styles.contact}>
        <Text style={styles.contactText}>📧 {item.email}</Text>
        <Text style={styles.contactText}>📱 {item.phone}</Text>
        <Text style={styles.contactText}>📍 {item.address}</Text>
      </View>
      
      <View style={styles.tagsContainer}>
        {renderTags(item.tags)}
      </View>
      
      <Text style={styles.joinDate}>Joined: {item.joinDate}</Text>
    </Pressable>
  );
};

// 优化版本的复杂Item组件
const OptimizedComplexItem = memo(({item, onPress}: {item: UserData; onPress: (item: UserData) => void}) => {
  // 使用useMemo缓存计算结果
  const formattedStats = useMemo(() => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };
    
    return {
      followers: formatNumber(item.followers),
      following: formatNumber(item.following),
      posts: formatNumber(item.posts),
    };
  }, [item.followers, item.following, item.posts]);

  const stars = useMemo(() => {
    return Array.from({length: 5}, (_, index) => (
      <Text key={index} style={styles.star}>
        {index < item.rating ? '★' : '☆'}
      </Text>
    ));
  }, [item.rating]);

  const tags = useMemo(() => {
    return item.tags.map((tag, index) => (
      <View key={index} style={styles.tag}>
        <Text style={styles.tagText}>{tag}</Text>
      </View>
    ));
  }, [item.tags]);

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Pressable style={styles.itemContainer} onPress={handlePress}>
      <View style={styles.itemHeader}>
        <Image source={{uri: item.avatar}} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {item.isVerified && <Text style={styles.verified}>✓</Text>}
          </View>
          <Text style={styles.company}>{item.company}</Text>
          <Text style={styles.lastActive}>Active {item.lastActive}</Text>
        </View>
        <View style={styles.rating}>
          {stars}
        </View>
      </View>
      
      <Text style={styles.bio}>{item.bio}</Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{formattedStats.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{formattedStats.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{formattedStats.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>
      
      <View style={styles.contact}>
        <Text style={styles.contactText}>📧 {item.email}</Text>
        <Text style={styles.contactText}>📱 {item.phone}</Text>
        <Text style={styles.contactText}>📍 {item.address}</Text>
      </View>
      
      <View style={styles.tagsContainer}>
        {tags}
      </View>
      
      <Text style={styles.joinDate}>Joined: {item.joinDate}</Text>
    </Pressable>
  );
});

function App(): JSX.Element {
  const [isOptimized, setIsOptimized] = useState(false);
  const renderCountRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // 生成1000条复杂数据
  const data = useMemo(() => generateComplexData(1000), []);

  // 定期更新渲染计数显示，避免在渲染过程中更新状态
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderCount(renderCountRef.current);
    }, 500); // 每500ms更新一次显示

    return () => clearInterval(interval);
  }, []);

  // 当优化模式切换时，重置渲染计数
  useEffect(() => {
    renderCountRef.current = 0;
    setRenderCount(0);
  }, [isOptimized]);

  const handleItemPress = useCallback((item: UserData) => {
    Alert.alert('Item Pressed', `You pressed ${item.name}`);
  }, []);

  const renderBasicItem = useCallback(({item}: {item: UserData}) => {
    // 使用ref来跟踪渲染次数，避免在渲染过程中更新状态
    renderCountRef.current += 1;
    return <BasicComplexItem item={item} onPress={handleItemPress} />;
  }, [handleItemPress]);

  const renderOptimizedItem = useCallback(({item}: {item: UserData}) => {
    // 使用ref来跟踪渲染次数，避免在渲染过程中更新状态
    renderCountRef.current += 1;
    return <OptimizedComplexItem item={item} onPress={handleItemPress} />;
  }, [handleItemPress]);

  const keyExtractor = useCallback((item: UserData) => item.id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 280, // 预估item高度
    offset: 280 * index,
    index,
  }), []);

  const toggleOptimization = () => {
    setIsOptimized(!isOptimized);
    // 滚动到顶部以便观察性能差异
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>FlatList Performance Demo</Text>
        <Text style={styles.subtitle}>
          {isOptimized ? '优化版本' : '基础版本'} - 渲染次数: {renderCount}
        </Text>
        <Pressable style={styles.toggleButton} onPress={toggleOptimization}>
          <Text style={styles.toggleButtonText}>
            切换到{isOptimized ? '基础版本' : '优化版本'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={isOptimized ? renderOptimizedItem : renderBasicItem}
        keyExtractor={keyExtractor}
        // 基础配置 vs 优化配置
        {...(isOptimized ? {
          // 优化配置
          removeClippedSubviews: true, // 移除屏幕外的子视图
          maxToRenderPerBatch: 10, // 每批次最多渲染10个item
          windowSize: 10, // 保持10个屏幕高度的item在内存中
          initialNumToRender: 10, // 初始渲染10个item
          updateCellsBatchingPeriod: 50, // 批量更新间隔
          getItemLayout: getItemLayout, // 提供item布局信息
        } : {
          // 基础配置（FlatList默认值）
          removeClippedSubviews: false,
          maxToRenderPerBatch: 50,
          windowSize: 21,
          initialNumToRender: 10,
          updateCellsBatchingPeriod: 50,
        })}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  verified: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
  },
  company: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  lastActive: {
    fontSize: 12,
    color: '#999',
  },
  rating: {
    flexDirection: 'row',
  },
  star: {
    color: '#FFD700',
    fontSize: 16,
  },
  bio: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contact: {
    marginBottom: 12,
  },
  contactText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
  },
  joinDate: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
});

export default App;
