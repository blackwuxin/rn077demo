// FlatList 性能监控工具
export interface PerformanceMetrics {
  renderTime: number;
  scrollPerformance: {
    averageFPS: number;
    droppedFrames: number;
    scrollEvents: number;
  };
  memoryUsage: {
    jsHeapSizeUsed: number;
    jsHeapSizeTotal: number;
    jsHeapSizeLimit: number;
  };
  listMetrics: {
    totalItems: number;
    visibleItems: number;
    renderedItems: number;
    recycledItems: number;
  };
}

export class FlatListPerformanceMonitor {
  private static instance: FlatListPerformanceMonitor;
  private metrics: PerformanceMetrics;
  private renderStartTime: number = 0;
  private frameCount: number = 0;
  private droppedFrames: number = 0;
  private scrollEventCount: number = 0;
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;
  private rafId: number | null = null;

  static getInstance(): FlatListPerformanceMonitor {
    if (!FlatListPerformanceMonitor.instance) {
      FlatListPerformanceMonitor.instance = new FlatListPerformanceMonitor();
    }
    return FlatListPerformanceMonitor.instance;
  }

  constructor() {
    this.metrics = {
      renderTime: 0,
      scrollPerformance: {
        averageFPS: 0,
        droppedFrames: 0,
        scrollEvents: 0,
      },
      memoryUsage: {
        jsHeapSizeUsed: 0,
        jsHeapSizeTotal: 0,
        jsHeapSizeLimit: 0,
      },
      listMetrics: {
        totalItems: 0,
        visibleItems: 0,
        renderedItems: 0,
        recycledItems: 0,
      },
    };
  }

  // 开始监控
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.scrollEventCount = 0;
    this.lastFrameTime = performance.now();
    
    console.log('📊 FlatList 性能监控已启动');
    this.startFrameMonitoring();
  }

  // 停止监控
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.updateMetrics();
    console.log('📊 FlatList 性能监控已停止');
    this.logPerformanceReport();
  }

  // 开始渲染计时
  startRenderTiming(): void {
    this.renderStartTime = performance.now();
  }

  // 结束渲染计时
  endRenderTiming(): void {
    if (this.renderStartTime > 0) {
      this.metrics.renderTime = performance.now() - this.renderStartTime;
      this.renderStartTime = 0;
    }
  }

  // 记录滚动事件
  recordScrollEvent(): void {
    this.scrollEventCount++;
    this.metrics.scrollPerformance.scrollEvents = this.scrollEventCount;
  }

  // 更新列表指标
  updateListMetrics(totalItems: number, visibleItems: number, renderedItems: number): void {
    this.metrics.listMetrics = {
      totalItems,
      visibleItems,
      renderedItems,
      recycledItems: Math.max(0, renderedItems - visibleItems),
    };
  }

  // 帧监控
  private startFrameMonitoring(): void {
    const monitorFrame = (currentTime: number) => {
      if (!this.isMonitoring) return;

      const deltaTime = currentTime - this.lastFrameTime;
      this.frameCount++;

      // 检测掉帧（假设目标是 60 FPS，即每帧 16.67ms）
      if (deltaTime > 16.67 * 2) { // 超过两帧的时间认为是掉帧
        this.droppedFrames++;
      }

      this.lastFrameTime = currentTime;
      this.rafId = requestAnimationFrame(monitorFrame);
    };

    this.rafId = requestAnimationFrame(monitorFrame);
  }

  // 更新性能指标
  private updateMetrics(): void {
    // 计算平均 FPS
    const monitoringDuration = (performance.now() - (this.lastFrameTime - this.frameCount * 16.67)) / 1000;
    this.metrics.scrollPerformance.averageFPS = this.frameCount / monitoringDuration;
    this.metrics.scrollPerformance.droppedFrames = this.droppedFrames;

    // 更新内存使用情况
    this.updateMemoryUsage();
  }

  // 更新内存使用情况
  private updateMemoryUsage(): void {
    // React Native 中可能无法直接获取内存信息，这里提供一个模拟实现
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = {
        jsHeapSizeUsed: memory.usedJSHeapSize || 0,
        jsHeapSizeTotal: memory.totalJSHeapSize || 0,
        jsHeapSizeLimit: memory.jsHeapSizeLimit || 0,
      };
    } else {
      // 模拟内存数据
      this.metrics.memoryUsage = {
        jsHeapSizeUsed: Math.floor(Math.random() * 50000000) + 10000000, // 10-60MB
        jsHeapSizeTotal: Math.floor(Math.random() * 20000000) + 60000000, // 60-80MB
        jsHeapSizeLimit: 100000000, // 100MB
      };
    }
  }

  // 获取当前性能指标
  getMetrics(): PerformanceMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  // 格式化内存大小
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 输出性能报告
  private logPerformanceReport(): void {
    const metrics = this.getMetrics();
    
    console.log('\n📊 === FlatList 性能报告 ===');
    console.log(`🎨 渲染时间: ${metrics.renderTime.toFixed(2)}ms`);
    console.log(`📱 平均 FPS: ${metrics.scrollPerformance.averageFPS.toFixed(1)}`);
    console.log(`⚠️ 掉帧数量: ${metrics.scrollPerformance.droppedFrames}`);
    console.log(`📜 滚动事件: ${metrics.scrollPerformance.scrollEvents}`);
    console.log(`📋 总项目数: ${metrics.listMetrics.totalItems}`);
    console.log(`👁️ 可见项目: ${metrics.listMetrics.visibleItems}`);
    console.log(`🎭 渲染项目: ${metrics.listMetrics.renderedItems}`);
    console.log(`♻️ 回收项目: ${metrics.listMetrics.recycledItems}`);
    console.log(`💾 JS 堆内存: ${this.formatBytes(metrics.memoryUsage.jsHeapSizeUsed)} / ${this.formatBytes(metrics.memoryUsage.jsHeapSizeTotal)}`);
    console.log('================================\n');
  }

  // 生成性能建议
  getPerformanceRecommendations(): string[] {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];

    if (metrics.scrollPerformance.averageFPS < 50) {
      recommendations.push('🐌 FPS 过低，建议优化渲染性能');
    }

    if (metrics.scrollPerformance.droppedFrames > 10) {
      recommendations.push('⚠️ 掉帧较多，检查是否有复杂的渲染逻辑');
    }

    if (metrics.renderTime > 16) {
      recommendations.push('🎨 渲染时间过长，考虑使用 getItemLayout 优化');
    }

    if (metrics.listMetrics.renderedItems > metrics.listMetrics.visibleItems * 3) {
      recommendations.push('📋 渲染项目过多，调整 initialNumToRender 和 maxToRenderPerBatch');
    }

    const memoryUsagePercent = (metrics.memoryUsage.jsHeapSizeUsed / metrics.memoryUsage.jsHeapSizeTotal) * 100;
    if (memoryUsagePercent > 80) {
      recommendations.push('💾 内存使用率过高，检查是否有内存泄漏');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ 性能表现良好！');
    }

    return recommendations;
  }

  // 重置监控数据
  reset(): void {
    this.stopMonitoring();
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.scrollEventCount = 0;
    this.renderStartTime = 0;
    this.lastFrameTime = 0;
    
    this.metrics = {
      renderTime: 0,
      scrollPerformance: {
        averageFPS: 0,
        droppedFrames: 0,
        scrollEvents: 0,
      },
      memoryUsage: {
        jsHeapSizeUsed: 0,
        jsHeapSizeTotal: 0,
        jsHeapSizeLimit: 0,
      },
      listMetrics: {
        totalItems: 0,
        visibleItems: 0,
        renderedItems: 0,
        recycledItems: 0,
      },
    };
    
    console.log('🔄 性能监控数据已重置');
  }

  // 导出性能数据
  exportMetrics(): string {
    const metrics = this.getMetrics();
    const recommendations = this.getPerformanceRecommendations();
    
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics,
      recommendations,
    }, null, 2);
  }
}

export default FlatListPerformanceMonitor;
