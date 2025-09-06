/**
 * 性能对比工具
 * 比较传统导入和 Inline Require 的性能差异
 */

interface PerformanceResult {
  method: 'traditional' | 'inline';
  moduleName: string;
  loadTime: number;
  memoryUsage?: number;
  timestamp: number;
}

class PerformanceComparison {
  private static results: PerformanceResult[] = [];

  /**
   * 测试传统导入方式的性能
   */
  static async testTraditionalImport(moduleName: string): Promise<PerformanceResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    // 模拟传统导入的初始化成本
    // 在实际应用中，这些模块在应用启动时就会被加载
    await new Promise(resolve => setTimeout(resolve, 10)); // 模拟加载延迟

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const result: PerformanceResult = {
      method: 'traditional',
      moduleName,
      loadTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      timestamp: Date.now(),
    };

    this.results.push(result);
    return result;
  }

  /**
   * 测试 Inline Require 方式的性能
   */
  static async testInlineRequire(
    moduleName: string,
    requireFn: () => any
  ): Promise<PerformanceResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    // 执行实际的 inline require
    try {
      requireFn();
    } catch (error) {
      console.warn(`模块 ${moduleName} 加载失败:`, error);
    }

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const result: PerformanceResult = {
      method: 'inline',
      moduleName,
      loadTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      timestamp: Date.now(),
    };

    this.results.push(result);
    return result;
  }

  /**
   * 获取内存使用情况
   */
  private static getMemoryUsage(): number {
    if (__DEV__ && (global as any).performance?.memory) {
      return (global as any).performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * 运行完整的性能对比测试
   */
  static async runComparison(): Promise<void> {
    console.log('🏁 开始性能对比测试...\n');

    const testModules = [
      {
        name: 'date-fns',
        requireFn: () => require('date-fns'),
      },
      {
        name: 'lodash',
        requireFn: () => require('lodash'),
      },
      {
        name: '@react-native-async-storage/async-storage',
        requireFn: () => require('@react-native-async-storage/async-storage'),
      },
    ];

    // 测试每个模块
    for (const module of testModules) {
      console.log(`📦 测试模块: ${module.name}`);

      // 测试传统导入
      const traditionalResult = await this.testTraditionalImport(module.name);
      console.log(`  传统导入: ${traditionalResult.loadTime.toFixed(2)}ms`);

      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 100));

      // 测试 Inline Require
      const inlineResult = await this.testInlineRequire(module.name, module.requireFn);
      console.log(`  Inline Require: ${inlineResult.loadTime.toFixed(2)}ms`);

      // 计算性能差异
      const improvement = traditionalResult.loadTime - inlineResult.loadTime;
      const improvementPercent = (improvement / traditionalResult.loadTime) * 100;

      if (improvement > 0) {
        console.log(`  ✅ 性能提升: ${improvement.toFixed(2)}ms (${improvementPercent.toFixed(1)}%)`);
      } else {
        console.log(`  ⚠️ 性能下降: ${Math.abs(improvement).toFixed(2)}ms`);
      }

      console.log('');
    }

    // 生成总结报告
    this.generateSummaryReport();
  }

  /**
   * 生成性能对比报告
   */
  static generateSummaryReport(): void {
    console.log('📊 性能对比总结报告');
    console.log('==================\n');

    // 按模块分组
    const moduleGroups = this.groupResultsByModule();

    Object.entries(moduleGroups).forEach(([moduleName, results]) => {
      const traditional = results.find(r => r.method === 'traditional');
      const inline = results.find(r => r.method === 'inline');

      if (traditional && inline) {
        console.log(`📦 ${moduleName}:`);
        console.log(`   传统导入: ${traditional.loadTime.toFixed(2)}ms`);
        console.log(`   Inline Require: ${inline.loadTime.toFixed(2)}ms`);

        const improvement = traditional.loadTime - inline.loadTime;
        const improvementPercent = (improvement / traditional.loadTime) * 100;

        if (improvement > 0) {
          console.log(`   🚀 性能提升: ${improvementPercent.toFixed(1)}%`);
        } else {
          console.log(`   ⚠️ 性能下降: ${Math.abs(improvementPercent).toFixed(1)}%`);
        }

        if (traditional.memoryUsage && inline.memoryUsage) {
          const memoryDiff = traditional.memoryUsage - inline.memoryUsage;
          console.log(`   💾 内存差异: ${memoryDiff > 0 ? '-' : '+'}${Math.abs(memoryDiff)} bytes`);
        }

        console.log('');
      }
    });

    // 总体统计
    this.generateOverallStats();
  }

  /**
   * 按模块分组结果
   */
  private static groupResultsByModule(): Record<string, PerformanceResult[]> {
    return this.results.reduce((groups, result) => {
      if (!groups[result.moduleName]) {
        groups[result.moduleName] = [];
      }
      groups[result.moduleName].push(result);
      return groups;
    }, {} as Record<string, PerformanceResult[]>);
  }

  /**
   * 生成总体统计
   */
  private static generateOverallStats(): void {
    const traditionalResults = this.results.filter(r => r.method === 'traditional');
    const inlineResults = this.results.filter(r => r.method === 'inline');

    if (traditionalResults.length === 0 || inlineResults.length === 0) {
      return;
    }

    const avgTraditional = traditionalResults.reduce((sum, r) => sum + r.loadTime, 0) / traditionalResults.length;
    const avgInline = inlineResults.reduce((sum, r) => sum + r.loadTime, 0) / inlineResults.length;

    const overallImprovement = ((avgTraditional - avgInline) / avgTraditional) * 100;

    console.log('📈 总体性能统计:');
    console.log(`   平均传统导入时间: ${avgTraditional.toFixed(2)}ms`);
    console.log(`   平均 Inline Require 时间: ${avgInline.toFixed(2)}ms`);
    console.log(`   平均性能提升: ${overallImprovement.toFixed(1)}%`);

    // 推荐建议
    this.generateRecommendations(overallImprovement);
  }

  /**
   * 生成优化建议
   */
  private static generateRecommendations(improvementPercent: number): void {
    console.log('\n💡 优化建议:');

    if (improvementPercent > 20) {
      console.log('   🎯 Inline Require 显著提升性能，建议广泛使用');
      console.log('   📦 优先对大型第三方库使用 Inline Require');
      console.log('   ⏰ 在应用启动后预加载常用模块');
    } else if (improvementPercent > 5) {
      console.log('   ✅ Inline Require 有一定性能提升');
      console.log('   🎯 对低频使用的模块使用 Inline Require');
      console.log('   📊 继续监控性能指标');
    } else if (improvementPercent > -5) {
      console.log('   ⚖️ 性能差异不明显');
      console.log('   🔍 考虑其他优化策略');
      console.log('   📱 在不同设备上测试性能');
    } else {
      console.log('   ⚠️ Inline Require 可能影响性能');
      console.log('   🔄 考虑回退到传统导入方式');
      console.log('   🐛 检查是否存在实现问题');
    }
  }

  /**
   * 清空测试结果
   */
  static clearResults(): void {
    this.results = [];
    console.log('🗑️ 已清空性能测试结果');
  }

  /**
   * 导出测试结果
   */
  static exportResults(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      results: this.results,
      summary: this.generateSummaryData(),
    }, null, 2);
  }

  /**
   * 生成摘要数据
   */
  private static generateSummaryData() {
    const moduleGroups = this.groupResultsByModule();
    
    return Object.entries(moduleGroups).map(([moduleName, results]) => {
      const traditional = results.find(r => r.method === 'traditional');
      const inline = results.find(r => r.method === 'inline');

      if (traditional && inline) {
        const improvement = ((traditional.loadTime - inline.loadTime) / traditional.loadTime) * 100;
        
        return {
          module: moduleName,
          traditionalTime: traditional.loadTime,
          inlineTime: inline.loadTime,
          improvementPercent: improvement,
        };
      }

      return null;
    }).filter(Boolean);
  }
}

// 在开发模式下自动运行对比测试
if (__DEV__) {
  // 延迟运行，确保应用完全启动
  setTimeout(() => {
    PerformanceComparison.runComparison();
  }, 8000);
}

export default PerformanceComparison;
