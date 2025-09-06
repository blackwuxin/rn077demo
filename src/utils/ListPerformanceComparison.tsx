import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import DataGenerator, { ListItem } from './DataGenerator';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_HEIGHT = 140;

// 性能监控Hook
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    scrollFPS: 60,
    memoryUsage: 0,
    droppedFrames: 0,
  });

  const startTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  const startMonitoring = useCallback(() => {
    startTime.current = performance.now();
    frameCount.current = 0;
    lastFrameTime.current = performance.now();
  }, []);

  const updateMetrics = useCallback(() => {
    const currentTime = performance.now();
    const renderTime = currentTime - startTime.current;
    
    // 模拟FPS计算
    frameCount.current++;
    const timeDiff = currentTime - lastFrameTime.current;
    const fps = timeDiff > 0 ? Math.min(60, 1000 / timeDiff) : 60;
    
    // 模拟内存使用情况
    const memoryUsage = (performance as any).memory 
      ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 
      : Math.random() * 50 + 20;

    setMetrics({
      renderTime: Math.round(renderTime),
      scrollFPS: Math.round(fps * 10) / 10,
      memoryUsage: Math.round(memoryUsage * 10) / 10,
      droppedFrames: Math.max(0, Math.round((60 - fps) * frameCount.current / 60)),
    });

    lastFrameTime.current = currentTime;
  }, []);

  return { metrics, startMonitoring, updateMetrics };
};

// 列表项组件
const ListItemComponent = React.memo<{
  item: ListItem;
  index: number;
}>(({ item, index }) => {
  const [imageError, setImageError] = useState(false);

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

  return (
    <View style={styles.listItem}>
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
    </View>
  );
});

// 性能指标显示组件
const PerformanceMetrics: React.FC<{
  title: string;
  metrics: any;
  color: string;
}> = ({ title, metrics, color }) => (
  <View style={[styles.metricsContainer, { borderLeftColor: color }]}>
    <Text style={[styles.metricsTitle, { color }]}>{title}</Text>
    <View style={styles.metricsGrid}>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>渲染时间</Text>
        <Text style={styles.metricValue}>{metrics.renderTime}ms</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>滚动FPS</Text>
        <Text style={[styles.metricValue, { color: metrics.scrollFPS > 50 ? '#4CAF50' : '#FF5722' }]}>
          {metrics.scrollFPS}
        </Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>内存使用</Text>
        <Text style={styles.metricValue}>{metrics.memoryUsage}MB</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>丢帧数</Text>
        <Text style={[styles.metricValue, { color: metrics.droppedFrames > 10 ? '#FF5722' : '#4CAF50' }]}>
          {metrics.droppedFrames}
        </Text>
      </View>
    </View>
  </View>
);

const ListPerformanceComparison: React.FC = () => {
  const [data, setData] = useState<ListItem[]>([]);
  const [currentList, setCurrentList] = useState<'flatlist' | 'flashlist'>('flatlist');
  const [isLoading, setIsLoading] = useState(false);
  const [dataSize, setDataSize] = useState(1000);

  const flatListRef = useRef<FlatList>(null);
  const flashListRef = useRef<FlashList<ListItem>>(null);
  
  const flatListMonitor = usePerformanceMonitor();
  const flashListMonitor = usePerformanceMonitor();
  
  const dataGenerator = useMemo(() => DataGenerator.getInstance(), []);

  // 生成测试数据
  const generateTestData = useCallback(async (size: number) => {
    setIsLoading(true);
    try {
      // 模拟数据生成延迟
      await new Promise(resolve => setTimeout(resolve, 100));
      const newData = dataGenerator.generateItems(size);
      setData(newData);
    } catch (error) {
      Alert.alert('错误', '数据生成失败');
    } finally {
      setIsLoading(false);
    }
  }, [dataGenerator]);

  // 初始化数据
  useEffect(() => {
    generateTestData(dataSize);
  }, [generateTestData, dataSize]);

  // 切换列表类型
  const switchListType = useCallback((type: 'flatlist' | 'flashlist') => {
    setCurrentList(type);
    if (type === 'flatlist') {
      flatListMonitor.startMonitoring();
    } else {
      flashListMonitor.startMonitoring();
    }
  }, [flatListMonitor, flashListMonitor]);

  // 滚动事件处理
  const handleScroll = useCallback(() => {
    if (currentList === 'flatlist') {
      flatListMonitor.updateMetrics();
    } else {
      flashListMonitor.updateMetrics();
    }
  }, [currentList, flatListMonitor, flashListMonitor]);

  // 渲染项目
  const renderItem = useCallback(({ item, index }: { item: ListItem; index: number }) => (
    <ListItemComponent item={item} index={index} />
  ), []);

  // 获取项目布局
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  // 数据大小选项
  const dataSizeOptions = [500, 1000, 2000, 5000, 10000];

  return (
    <View style={styles.container}>
      {/* 头部控制区 */}
      <View style={styles.header}>
        <Text style={styles.title}>FlatList vs FlashList 性能对比</Text>
        
        {/* 数据大小选择 */}
        <View style={styles.sizeSelector}>
          <Text style={styles.selectorLabel}>数据量:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dataSizeOptions.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  dataSize === size && styles.sizeButtonActive
                ]}
                onPress={() => setDataSize(size)}
              >
                <Text style={[
                  styles.sizeButtonText,
                  dataSize === size && styles.sizeButtonTextActive
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 列表类型切换 */}
        <View style={styles.listSelector}>
          <TouchableOpacity
            style={[
              styles.listButton,
              currentList === 'flatlist' && styles.listButtonActive
            ]}
            onPress={() => switchListType('flatlist')}
          >
            <Text style={[
              styles.listButtonText,
              currentList === 'flatlist' && styles.listButtonTextActive
            ]}>
              FlatList
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.listButton,
              currentList === 'flashlist' && styles.listButtonActive
            ]}
            onPress={() => switchListType('flashlist')}
          >
            <Text style={[
              styles.listButtonText,
              currentList === 'flashlist' && styles.listButtonTextActive
            ]}>
              FlashList
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 性能指标显示 */}
      <View style={styles.metricsSection}>
        <PerformanceMetrics
          title="FlatList"
          metrics={flatListMonitor.metrics}
          color="#2196F3"
        />
        <PerformanceMetrics
          title="FlashList"
          metrics={flashListMonitor.metrics}
          color="#4CAF50"
        />
      </View>

      {/* 列表显示区 */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>生成 {dataSize} 条数据中...</Text>
          </View>
        ) : (
          <>
            {currentList === 'flatlist' ? (
              <FlatList
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                getItemLayout={getItemLayout}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                initialNumToRender={10}
                windowSize={10}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <FlashList
                ref={flashListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                estimatedItemSize={ITEM_HEIGHT}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </View>

      {/* 底部信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          当前显示: {currentList === 'flatlist' ? 'FlatList' : 'FlashList'} • 
          数据量: {data.length} 条
        </Text>
        <Text style={styles.footerHint}>
          滚动列表查看性能差异 📊
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  sizeSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  sizeButtonActive: {
    backgroundColor: '#2196F3',
  },
  sizeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sizeButtonTextActive: {
    color: '#fff',
  },
  listSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  listButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  listButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  listButtonTextActive: {
    color: '#1a1a1a',
  },
  metricsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  metricsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricsGrid: {
    gap: 6,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  footerHint: {
    fontSize: 11,
    color: '#999',
  },
  
  // 列表项样式（复用之前的样式）
  listItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    opacity: 1,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
    height: ITEM_HEIGHT - 20,
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
    marginBottom: 4,
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
});

export default ListPerformanceComparison;
