/**
 * 性能监控工具
 * 用于测量页面加载时间和内存使用情况
 */

interface PerformanceMetrics {
  screenName: string;
  loadTime: number;
  timestamp: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private loadStartTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始测量页面加载时间
   */
  startScreenLoad(screenName: string): void {
    this.loadStartTimes.set(screenName, Date.now());
    console.log(`📊 [性能监控] 开始加载页面: ${screenName}`);
  }

  /**
   * 结束测量页面加载时间
   */
  endScreenLoad(screenName: string): void {
    const startTime = this.loadStartTimes.get(screenName);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      const metric: PerformanceMetrics = {
        screenName,
        loadTime,
        timestamp: Date.now(),
        memoryUsage: this.getMemoryUsage(),
      };

      this.metrics.push(metric);
      this.loadStartTimes.delete(screenName);

      console.log(`✅ [性能监控] 页面加载完成: ${screenName}, 耗时: ${loadTime}ms`);
      
      // 如果加载时间过长，给出警告
      if (loadTime > 1000) {
        console.warn(`⚠️ [性能警告] 页面 ${screenName} 加载时间过长: ${loadTime}ms`);
      }
    }
  }

  /**
   * 获取内存使用情况（仅在开发模式下可用）
   */
  private getMemoryUsage(): number | undefined {
    if (__DEV__ && (global as any).performance?.memory) {
      return (global as any).performance.memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * 获取所有性能指标
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * 获取特定页面的平均加载时间
   */
  getAverageLoadTime(screenName: string): number {
    const screenMetrics = this.metrics.filter(m => m.screenName === screenName);
    if (screenMetrics.length === 0) return 0;

    const totalTime = screenMetrics.reduce((sum, m) => sum + m.loadTime, 0);
    return totalTime / screenMetrics.length;
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    if (this.metrics.length === 0) {
      return '📊 暂无性能数据';
    }

    const report = ['📊 性能监控报告', '=================='];
    
    // 按页面分组统计
    const screenStats = new Map<string, {count: number; totalTime: number; minTime: number; maxTime: number}>();
    
    this.metrics.forEach(metric => {
      const stats = screenStats.get(metric.screenName) || {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
      };
      
      stats.count++;
      stats.totalTime += metric.loadTime;
      stats.minTime = Math.min(stats.minTime, metric.loadTime);
      stats.maxTime = Math.max(stats.maxTime, metric.loadTime);
      
      screenStats.set(metric.screenName, stats);
    });

    // 生成统计报告
    screenStats.forEach((stats, screenName) => {
      const avgTime = Math.round(stats.totalTime / stats.count);
      report.push(`\n📱 ${screenName}:`);
      report.push(`   加载次数: ${stats.count}`);
      report.push(`   平均耗时: ${avgTime}ms`);
      report.push(`   最快耗时: ${stats.minTime}ms`);
      report.push(`   最慢耗时: ${stats.maxTime}ms`);
    });

    // 总体统计
    const totalMetrics = this.metrics.length;
    const avgLoadTime = Math.round(
      this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / totalMetrics
    );
    
    report.push('\n📈 总体统计:');
    report.push(`   总加载次数: ${totalMetrics}`);
    report.push(`   平均加载时间: ${avgLoadTime}ms`);

    return report.join('\n');
  }

  /**
   * 清空性能数据
   */
  clearMetrics(): void {
    this.metrics = [];
    this.loadStartTimes.clear();
    console.log('🗑️ [性能监控] 已清空性能数据');
  }

  /**
   * 导出性能数据为JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.metrics,
      summary: {
        totalScreens: new Set(this.metrics.map(m => m.screenName)).size,
        totalLoads: this.metrics.length,
        averageLoadTime: this.metrics.length > 0 
          ? this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length 
          : 0,
      }
    }, null, 2);
  }
}

// 创建全局实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 导出类型
export type {PerformanceMetrics};

// 便捷的Hook
export const usePerformanceMonitor = (screenName: string) => {
  React.useEffect(() => {
    performanceMonitor.startScreenLoad(screenName);
    
    return () => {
      performanceMonitor.endScreenLoad(screenName);
    };
  }, [screenName]);
};

// React导入
import React from 'react';
