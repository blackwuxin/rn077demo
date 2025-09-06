import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import DataGenerator, { ListItem } from './DataGenerator';
import FlatListPerformanceMonitor from './FlatListPerformanceMonitor';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_HEIGHT = 280; // 增加高度以适应复杂布局

// 未优化版本 - 没有使用React.memo和缓存优化
const ComplexListItemUnoptimized: React.FC<{
  item: ListItem;
  index: number;
  isOptimized: boolean;
}> = ({ item, index, isOptimized }) => {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // ❌ 未优化：每次都重新创建函数，没有使用useCallback
  const handleImageError = (imageIndex: number) => {
    setImageErrors(prev => ({ ...prev, [imageIndex]: true }));
  };

  // ❌ 未优化：每次都重新计算星星，没有使用useMemo
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  // ❌ 未优化：没有缓存样式计算
  const getItemStyles = () => {
    return [styles.listItem];
  };

  return (
    <TouchableOpacity 
      style={getItemStyles()}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      {/* 头部信息 */}
      <View style={styles.itemHeader}>
        <View style={styles.authorInfo}>
          <Image 
            source={{ uri: item.author?.avatar || item.avatar }} 
            style={styles.authorAvatar}
            onError={() => {}}
          />
          <View style={styles.authorDetails}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{item.author?.name || 'Unknown'}</Text>
              {item.author?.verified && <Text style={styles.verifiedIcon}>✓</Text>}
            </View>
            <Text style={styles.publishTime}>{item.readTime}分钟阅读</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={[styles.actionIcon, { color: item.isBookmarked ? '#FF9800' : '#666' }]}>
              {item.isBookmarked ? '🔖' : '📑'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={[styles.actionIcon, { color: item.isLiked ? '#F44336' : '#666' }]}>
              {item.isLiked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 标题和评分 */}
      <View style={styles.titleSection}>
        <Text style={styles.itemTitle} numberOfLines={isExpanded ? undefined : 2}>
          {item.title}
        </Text>
        <View style={styles.ratingRow}>
          <View style={styles.starsContainer}>
            {/* ❌ 未优化：每次渲染都重新计算星星 */}
            {renderStars(item.rating || 0)}
          </View>
          <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)}</Text>
        </View>
      </View>

      {/* 图片网格 */}
      {item.images && item.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScroll}
          >
            {item.images.slice(0, 4).map((imageUrl, imageIndex) => (
              <View key={imageIndex} style={styles.imageWrapper}>
                {!imageErrors[imageIndex] ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.contentImage}
                    onError={() => handleImageError(imageIndex)}
                    // ❌ 未优化：没有设置合适的resizeMode
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.contentImage, styles.imagePlaceholder]}>
                    <Text style={styles.imagePlaceholderText}>📷</Text>
                  </View>
                )}
                {imageIndex === 3 && item.images!.length > 4 && (
                  <View style={styles.moreImagesOverlay}>
                    <Text style={styles.moreImagesText}>+{item.images!.length - 4}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 描述 */}
      <Text style={styles.itemDescription} numberOfLines={isExpanded ? undefined : 3}>
        {item.description}
      </Text>

      {/* 标签 */}
      <View style={styles.tagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.tags.map((tag, tagIndex) => (
            <View key={tagIndex} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 底部统计 */}
      <View style={styles.itemFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👁️</Text>
            <Text style={styles.statText}>{item.metadata.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statText}>{item.metadata.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{item.metadata.comments}</Text>
          </View>
        </View>
        
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {/* 展开/收起指示器 */}
      <TouchableOpacity style={styles.expandButton} onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ✅ 优化版本 - 使用React.memo防止不必要的重渲染
const ComplexListItemOptimized = React.memo<{
  item: ListItem;
  index: number;
  isOptimized: boolean;
}>(({ item, index, isOptimized }) => {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  // ✅ 优化1: 使用 useCallback 缓存事件处理函数
  const handleImageError = useCallback((imageIndex: number) => {
    setImageErrors(prev => ({ ...prev, [imageIndex]: true }));
  }, []);
  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  // ✅ 优化2: 使用 useMemo 缓存星星渲染，避免重复计算
  const starsComponent = useMemo(() => {
    const stars = [];
    const rating = item.rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  }, [item.rating]);
  // ✅ 优化3: 缓存样式计算
  const itemStyles = useMemo(() => {
    return [styles.listItem];
  }, []);

  return (
    <TouchableOpacity style={itemStyles} onPress={handleExpand}>
      {/* 头部信息 */}
      <View style={styles.itemHeader}>
        <View style={styles.authorInfo}>
          <Image 
            source={{ uri: item.author?.avatar || item.avatar }} 
            style={styles.authorAvatar}
            onError={() => {}}
            // ✅ 优化5: 使用合适的 resizeMode
            resizeMode="cover"
          />
          <View style={styles.authorDetails}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{item.author?.name || 'Unknown'}</Text>
              {item.author?.verified && <Text style={styles.verifiedIcon}>✓</Text>}
            </View>
            <Text style={styles.publishTime}>{item.readTime}分钟阅读</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={[styles.actionIcon, { color: item.isBookmarked ? '#FF9800' : '#666' }]}>
              {item.isBookmarked ? '🔖' : '📑'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={[styles.actionIcon, { color: item.isLiked ? '#F44336' : '#666' }]}>
              {item.isLiked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 标题和评分 */}
      <View style={styles.titleSection}>
        <Text style={styles.itemTitle} numberOfLines={isExpanded ? undefined : 2}>
          {item.title}
        </Text>
        <View style={styles.ratingRow}>
          <View style={styles.starsContainer}>
            {/* ✅ 优化：使用缓存的星星组件 */}
            {starsComponent}
          </View>
          <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)}</Text>
        </View>
      </View>

      {/* 图片网格 - 优化版本 */}
      {item.images && item.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScroll}
            // ✅ 优化4: 添加滚动优化
            removeClippedSubviews={true}
            scrollEventThrottle={16}
          >
            {item.images.slice(0, 4).map((imageUrl, imageIndex) => (
              <View key={imageIndex} style={styles.imageWrapper}>
                {!imageErrors[imageIndex] ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.contentImage}
                    onError={() => handleImageError(imageIndex)}
                    // ✅ 优化5: 使用合适的resizeMode
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.contentImage, styles.imagePlaceholder]}>
                    <Text style={styles.imagePlaceholderText}>📷</Text>
                  </View>
                )}
                {imageIndex === 3 && item.images!.length > 4 && (
                  <View style={styles.moreImagesOverlay}>
                    <Text style={styles.moreImagesText}>+{item.images!.length - 4}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 描述 */}
      <Text style={styles.itemDescription} numberOfLines={isExpanded ? undefined : 3}>
        {item.description}
      </Text>

      {/* 标签 - 优化版本 */}
      <View style={styles.tagsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
        >
          {item.tags.map((tag, tagIndex) => (
            <View key={tagIndex} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 底部统计 */}
      <View style={styles.itemFooter}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👁️</Text>
            <Text style={styles.statText}>{item.metadata.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statText}>{item.metadata.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statText}>{item.metadata.comments}</Text>
          </View>
        </View>
        
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {/* 展开/收起指示器 */}
      <TouchableOpacity style={styles.expandButton} onPress={handleExpand}>
        <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // ✅ 优化6: 自定义比较函数，仅当关键属性变化时重渲染
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.rating === nextProps.item.rating &&
    prevProps.item.isLiked === nextProps.item.isLiked &&
    prevProps.item.isBookmarked === nextProps.item.isBookmarked &&
    prevProps.isOptimized === nextProps.isOptimized
  );
});

const ComplexFlatListExample: React.FC = () => {
  const [data, setData] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const dataGenerator = useMemo(() => DataGenerator.getInstance(), []);
  const performanceMonitor = useMemo(() => FlatListPerformanceMonitor.getInstance(), []);

  // 组件卸载清理
  useEffect(() => {
    return () => {
      setIsMounted(false);
      performanceMonitor.stopMonitoring();
    };
  }, [performanceMonitor]);

  // 加载初始数据
  const loadInitialData = useCallback(async () => {
    if (!isMounted) return;
    
    setLoading(true);
    performanceMonitor.startRenderTiming();
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const initialData = dataGenerator.generateItems(300, 0);
      if (isMounted) {
        setData(initialData);
      }
    } catch (error) {
      if (isMounted) {
        console.error('Failed to load initial data:', error);
        Alert.alert('错误', '加载数据失败');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        performanceMonitor.endRenderTiming();
      }
    }
  }, [dataGenerator, performanceMonitor, isMounted]);

  // 初始化数据
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 优化状态改变时重启监控
  useEffect(() => {
    if (isMonitoring) {
      performanceMonitor.stopMonitoring();
      performanceMonitor.startMonitoring();
      
      Alert.alert(
        '性能监控',
        `已切换到${isOptimized ? '优化' : '未优化'}模式并重启监控`,
        [{ text: '确定' }]
      );
    }
  }, [isOptimized, performanceMonitor, isMonitoring]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    if (!isMounted) return;
    
    setRefreshing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const refreshedData = dataGenerator.generateItems(300, 0);
      if (isMounted) {
        setData(refreshedData);
      }
    } catch (error) {
      if (isMounted) {
        console.error('Failed to refresh data:', error);
        Alert.alert('错误', '刷新数据失败');
      }
    } finally {
      if (isMounted) {
        setRefreshing(false);
      }
    }
  }, [dataGenerator, isMounted]);

  // 性能监控切换
  const togglePerformanceMonitoring = useCallback(() => {
    if (isMonitoring) {
      performanceMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      performanceMonitor.startMonitoring();
      setIsMonitoring(true);
    }
  }, [isMonitoring, performanceMonitor]);

  // 显示性能报告
  const showPerformanceReport = useCallback(() => {
    const metrics = performanceMonitor.getMetrics();
    const recommendations = performanceMonitor.getPerformanceRecommendations();
    
    const optimizationConfig = isOptimized
      ? `🚀 优化模式配置:\n• getItemLayout: ✅ 预计算布局，避免动态计算\n• keyExtractor: ✅ 稳定唯一key (item.id)\n• initialNumToRender: 10 (与默认相同)\n• maxToRenderPerBatch: 5 (精简批量渲染)\n• windowSize: 10 (精简预渲染区域)\n• removeClippedSubviews: ✅ 启用视图裁剪\n• scrollEventThrottle: 16ms (60fps)\n• 组件优化: React.memo + 自定义比较\n• 缓存策略: useCallback + useMemo\n• 图片优化: resizeMode="cover"`
      : `🐌 未优化模式配置 (FlatList默认):\n• getItemLayout: ❌ 未设置，动态计算高度\n• keyExtractor: ❌ 不稳定key (index+title.length)\n• initialNumToRender: 10 (默认值)\n• maxToRenderPerBatch: 10 (默认值)\n• windowSize: 21 (默认值)\n• removeClippedSubviews: ❌ 默认禁用\n• scrollEventThrottle: 50ms (默认值)\n• 组件优化: ❌ 无React.memo优化\n• 缓存策略: ❌ 无缓存，重复计算\n• 图片优化: ❌ resizeMode="contain"`;
    
    Alert.alert(
      '📊 性能报告',
      `当前模式: ${isOptimized ? '🚀 优化模式' : '🐌 未优化模式'}\n\n` +
      `📈 性能指标:\n` +
      `FPS: ${metrics.scrollPerformance.averageFPS.toFixed(1)}\n` +
      `掉帧: ${metrics.scrollPerformance.droppedFrames}\n` +
      `渲染时间: ${metrics.renderTime.toFixed(2)}ms\n` +
      `可见项目: ${metrics.listMetrics.visibleItems}\n\n` +
      `⚙️ 配置详情:\n${optimizationConfig}\n\n` +
      `💡 建议:\n${recommendations.join('\n')}`,
      [{ text: '确定' }]
    );
  }, [performanceMonitor, isOptimized]);

  // 滚动事件处理
  const handleScroll = useCallback(() => {
    if (!isMounted) return;
    
    if (isMonitoring) {
      performanceMonitor.recordScrollEvent();
    }
  }, [isMonitoring, performanceMonitor, isMounted]);

  // 可视区域变化处理
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!isMounted) return;
    
    if (isMonitoring) {
      performanceMonitor.updateListMetrics(
        data.length,
        viewableItems.length,
        viewableItems.length + 10
      );
    }
  }, [isMonitoring, performanceMonitor, data.length, isMounted]);

  // ✅ 优化的 getItemLayout - 避免动态计算高度，提升滚动性能
  const getItemLayoutOptimized = useCallback(
    (data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // ❌ 未优化：不使用 getItemLayout，让FlatList动态计算高度
  const getItemLayoutUnoptimized = undefined;

  // ✅ 优化的 keyExtractor - 必须使用稳定的唯一的key
  const keyExtractorOptimized = useCallback((item: ListItem) => item.id, []);

  // ❌ 未优化的 keyExtractor - 使用不稳定的key
  const keyExtractorUnoptimized = useCallback((item: ListItem, index: number) => {
    // 常见的错误做法：使用index作为key或者组合不稳定的属性
    return `${index}-${item.title.length}`;
  }, []);

  // 渲染列表项
  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      if (!isMounted) return null;
      
      return isOptimized ? (
        <ComplexListItemOptimized item={item} index={index} isOptimized={isOptimized} />
      ) : (
        <ComplexListItemUnoptimized item={item} index={index} isOptimized={isOptimized} />
      );
    },
    [isOptimized, isMounted]
  );

  // 渲染列表底部
  const renderFooter = useCallback(() => {
    if (!loading) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#2196F3" />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    );
  }, [loading]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* 性能优化控制面板 */}
      <View style={styles.controlPanel}>
        <Text style={styles.panelTitle}>🚀 性能优化对比</Text>
        
        {/* 优化开关 */}
        <View style={styles.optimizationToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, !isOptimized && styles.toggleButtonActive]}
            onPress={() => setIsOptimized(false)}
          >
            <Text style={[styles.toggleButtonText, !isOptimized && styles.toggleButtonTextActive]}>
              🐌 未优化
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isOptimized && styles.toggleButtonActive]}
            onPress={() => setIsOptimized(true)}
          >
            <Text style={[styles.toggleButtonText, isOptimized && styles.toggleButtonTextActive]}>
              🚀 已优化
            </Text>
          </TouchableOpacity>
        </View>

        {/* 性能指示器 */}
        <View style={styles.performanceIndicator}>
          <View style={[styles.performanceBar, isOptimized ? styles.performanceGood : styles.performancePoor]}>
            <Text style={styles.performanceText}>
              {isOptimized ? '🚀 高性能模式' : '🐌 低性能模式'}
            </Text>
          </View>
          <Text style={styles.performanceHint}>
            {isOptimized
              ? '当前配置：最优化设置，流畅滚动'
              : '当前配置：复杂计算开销，明显卡顿'
            }
          </Text>
        </View>

        {/* 性能监控控制 */}
        <View style={styles.monitoringControls}>
          <TouchableOpacity
            style={[styles.monitorButton, isMonitoring && styles.activeMonitoring]}
            onPress={togglePerformanceMonitoring}
          >
            <Text style={styles.monitorButtonText}>
              {isMonitoring ? '停止监控' : '开始监控'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reportButton} onPress={showPerformanceReport}>
            <Text style={styles.reportButtonText}>性能报告</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 数据统计 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📊 复杂卡片列表 • {data.length} 项 • {isOptimized ? '优化模式' : '未优化模式'}
        </Text>
      </View>

      {/* 列表 */}
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        // ✅/❌ keyExtractor 配置对比
        keyExtractor={isOptimized ? keyExtractorOptimized : keyExtractorUnoptimized}
        // ✅/❌ getItemLayout 配置对比
        getItemLayout={isOptimized ? getItemLayoutOptimized : getItemLayoutUnoptimized}
        onScroll={handleScroll}
        onViewableItemsChanged={handleViewableItemsChanged}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        ListFooterComponent={renderFooter}
        // 🎯 核心性能配置对比
        // ✅ 优化模式：精心调优的参数 vs ❌ 未优化模式：FlatList默认配置
        // initialNumToRender: 初始化渲染的项数，按需设置
        initialNumToRender={10}
        // maxToRenderPerBatch: 每次渲染的项数，默认10，按需减少
        maxToRenderPerBatch={isOptimized ? 5 : 10}
        // windowSize: 可视区域外预渲染的项目，默认21，越小性能越好
        windowSize={isOptimized ? 10 : 21}
        // removeClippedSubviews: 裁剪不可见区域，提升性能
        removeClippedSubviews={isOptimized}
        // updateCellsBatchingPeriod: 批量更新周期
        updateCellsBatchingPeriod={50}
        // scrollEventThrottle: 滚动事件触发频率 (16ms = 60fps)
        scrollEventThrottle={isOptimized ? 16 : 50}
        showsVerticalScrollIndicator={true}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  controlPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  optimizationToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#1a1a1a',
  },
  performanceIndicator: {
    marginBottom: 16,
  },
  performanceBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  performanceGood: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  performancePoor: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  performanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  performanceHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  monitoringControls: {
    flexDirection: 'row',
    gap: 12,
  },
  monitorButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  activeMonitoring: {
    backgroundColor: '#f44336',
  },
  monitorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reportButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  // 复杂列表项样式
  listItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  
  // 头部样式
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 6,
  },
  verifiedIcon: {
    fontSize: 14,
    color: '#1976D2',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  publishTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  actionIcon: {
    fontSize: 16,
  },
  
  // 标题和评分样式
  titleSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 24,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  
  // 图片样式
  imagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  contentImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 24,
    color: '#ccc',
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 描述样式
  itemDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  
  // 标签样式
  tagsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  
  // 底部样式
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  categoryText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  
  // 展开按钮样式
  expandButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  
  // 底部加载样式
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default ComplexFlatListExample;
