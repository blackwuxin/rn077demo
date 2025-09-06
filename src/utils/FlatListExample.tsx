import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import DataGenerator, { ListItem } from './DataGenerator';
import FlatListPerformanceMonitor from './FlatListPerformanceMonitor';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_HEIGHT = 140; // 固定项目高度用于 getItemLayout 优化（调整以适应新间距）

// 优化的列表项组件
const ListItemComponent = React.memo<{
  item: ListItem;
  index: number;
  onPress: (item: ListItem) => void;
}>(({ item, index, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const statusColor = useMemo(() => {
    switch (item.status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#9E9E9E';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  }, [item.status]);

  const priorityIcon = useMemo(() => {
    switch (item.priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }, [item.priority]);

  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.listItem} onPress={handlePress}>
      <View style={styles.itemHeader}>
        <View style={styles.avatarContainer}>
          {!imageError && item.avatar ? (
            <Image 
              source={{ uri: item.avatar }} 
              style={styles.avatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {item.title.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.priorityIcon}>{priorityIcon}</Text>
          </View>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      </View>
      
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.itemFooter}>
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={tagIndex} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
          )}
        </View>
        
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataText}>👁️ {item.metadata.views}</Text>
          <Text style={styles.metadataText}>❤️ {item.metadata.likes}</Text>
          <Text style={styles.metadataText}>💬 {item.metadata.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const FlatListExample: React.FC = () => {
  const [data, setData] = useState<ListItem[]>([]);
  const [filteredData, setFilteredData] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<'timestamp' | 'views' | 'likes' | 'title'>('timestamp');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const dataGenerator = useMemo(() => DataGenerator.getInstance(), []);
  const performanceMonitor = useMemo(() => FlatListPerformanceMonitor.getInstance(), []);

  const ITEMS_PER_PAGE = 50;
  const TOTAL_ITEMS = 10000; // 模拟大量数据

  // 初始化数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 过滤和排序数据
  useEffect(() => {
    let filtered = dataGenerator.filterItems(data, searchQuery);
    filtered = dataGenerator.filterByCategory(filtered, selectedCategory);
    filtered = dataGenerator.sortItems(filtered, sortBy);
    setFilteredData(filtered);
  }, [data, searchQuery, selectedCategory, sortBy, dataGenerator]);

  // 加载初始数据
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    performanceMonitor.startRenderTiming();
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const initialData = dataGenerator.generateItems(ITEMS_PER_PAGE, 0);
      setData(initialData);
      setCurrentPage(1);
      setHasMoreData(ITEMS_PER_PAGE < TOTAL_ITEMS);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('错误', '加载数据失败');
    } finally {
      setLoading(false);
      performanceMonitor.endRenderTiming();
    }
  }, [dataGenerator, performanceMonitor]);

  // 加载更多数据
  const loadMoreData = useCallback(async () => {
    if (loading || !hasMoreData) return;

    setLoading(true);
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const newData = dataGenerator.generateItems(ITEMS_PER_PAGE, startIndex);
      
      setData(prevData => [...prevData, ...newData]);
      setCurrentPage(prevPage => prevPage + 1);
      setHasMoreData(startIndex + ITEMS_PER_PAGE < TOTAL_ITEMS);
    } catch (error) {
      console.error('Failed to load more data:', error);
      Alert.alert('错误', '加载更多数据失败');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMoreData, currentPage, dataGenerator]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const refreshedData = dataGenerator.generateItems(ITEMS_PER_PAGE, 0);
      setData(refreshedData);
      setCurrentPage(1);
      setHasMoreData(ITEMS_PER_PAGE < TOTAL_ITEMS);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      Alert.alert('错误', '刷新数据失败');
    } finally {
      setRefreshing(false);
    }
  }, [dataGenerator]);

  // 项目点击处理
  const handleItemPress = useCallback((item: ListItem) => {
    Alert.alert(
      item.title,
      `分类: ${item.category}\n状态: ${item.status}\n优先级: ${item.priority}\n\n${item.description}`,
      [{ text: '确定' }]
    );
  }, []);

  // 搜索处理
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 分类选择
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // 排序选择
  const handleSortSelect = useCallback((sort: 'timestamp' | 'views' | 'likes' | 'title') => {
    setSortBy(sort);
  }, []);

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
    
    Alert.alert(
      '性能报告',
      `FPS: ${metrics.scrollPerformance.averageFPS.toFixed(1)}\n` +
      `掉帧: ${metrics.scrollPerformance.droppedFrames}\n` +
      `渲染时间: ${metrics.renderTime.toFixed(2)}ms\n` +
      `可见项目: ${metrics.listMetrics.visibleItems}\n\n` +
      `建议:\n${recommendations.join('\n')}`,
      [{ text: '确定' }]
    );
  }, [performanceMonitor]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // 滚动事件处理
  const handleScroll = useCallback(() => {
    if (isMonitoring) {
      performanceMonitor.recordScrollEvent();
    }
  }, [isMonitoring, performanceMonitor]);

  // 可视区域变化处理
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (isMonitoring) {
      performanceMonitor.updateListMetrics(
        filteredData.length,
        viewableItems.length,
        viewableItems.length + 10 // 估算渲染项目数
      );
    }
  }, [isMonitoring, performanceMonitor, filteredData.length]);

  // getItemLayout 优化
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // keyExtractor 优化
  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  // 渲染列表项
  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => (
      <ListItemComponent item={item} index={index} onPress={handleItemPress} />
    ),
    [handleItemPress]
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

  // 渲染空状态
  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>📋</Text>
      <Text style={styles.emptyTitle}>暂无数据</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? '没有找到匹配的结果' : '点击刷新加载数据'}
      </Text>
    </View>
  ), [searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* 搜索和过滤栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索标题、描述或标签..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* 过滤和排序选项 */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>分类:</Text>
          <TouchableOpacity
            style={[styles.filterButton, selectedCategory === '全部' && styles.activeFilter]}
            onPress={() => handleCategorySelect('全部')}
          >
            <Text style={styles.filterButtonText}>全部</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedCategory === '科技' && styles.activeFilter]}
            onPress={() => handleCategorySelect('科技')}
          >
            <Text style={styles.filterButtonText}>科技</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedCategory === '娱乐' && styles.activeFilter]}
            onPress={() => handleCategorySelect('娱乐')}
          >
            <Text style={styles.filterButtonText}>娱乐</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>排序:</Text>
          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'timestamp' && styles.activeFilter]}
            onPress={() => handleSortSelect('timestamp')}
          >
            <Text style={styles.filterButtonText}>时间</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'views' && styles.activeFilter]}
            onPress={() => handleSortSelect('views')}
          >
            <Text style={styles.filterButtonText}>浏览量</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'likes' && styles.activeFilter]}
            onPress={() => handleSortSelect('likes')}
          >
            <Text style={styles.filterButtonText}>点赞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 性能监控控制 */}
      <View style={styles.performanceContainer}>
        <TouchableOpacity
          style={[styles.performanceButton, isMonitoring && styles.activeMonitoring]}
          onPress={togglePerformanceMonitoring}
        >
          <Text style={styles.performanceButtonText}>
            {isMonitoring ? '停止监控' : '开始监控'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reportButton} onPress={showPerformanceReport}>
          <Text style={styles.reportButtonText}>性能报告</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
          <Text style={styles.scrollTopButtonText}>回到顶部</Text>
        </TouchableOpacity>
      </View>

      {/* 数据统计 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          显示 {filteredData.length} / {data.length} 项 • 第 {currentPage} 页
        </Text>
      </View>

      {/* 列表 */}
      <FlatList
        ref={flatListRef}
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        onViewableItemsChanged={handleViewableItemsChanged}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        // 性能优化配置
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        // 其他优化
        scrollEventThrottle={16}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 8,
    minWidth: 40,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  performanceContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  performanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  activeMonitoring: {
    backgroundColor: '#f44336',
  },
  performanceButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  reportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    marginRight: 8,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollTopButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#9C27B0',
  },
  scrollTopButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  flatList: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingBottom: 16,
  },
  listItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 10, // 增加卡片间距
    padding: 16,
    borderRadius: 12,
    // iOS 阴影优化
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Android 阴影优化
    elevation: 2,
    // 确保完全不透明的背景
    opacity: 1,
    // 添加边框防止内容重叠
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
    height: ITEM_HEIGHT - 20, // 调整高度适应新的 margin
    // 确保 z-index 层级
    zIndex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  priorityIcon: {
    fontSize: 12,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // 增加底部间距
  },
  tagsContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 0.5,
    borderColor: '#d1e7dd',
  },
  tagText: {
    fontSize: 10,
    color: '#1976d2',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 11,
    color: '#777',
    marginLeft: 10,
    backgroundColor: 'transparent',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default FlatListExample;
