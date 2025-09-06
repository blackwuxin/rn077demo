// 数据生成器 - 用于生成大量模拟数据
export interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  avatar: string;
  timestamp: number;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  metadata: {
    views: number;
    likes: number;
    comments: number;
  };
  // 新增复杂数据字段
  images?: string[];
  author?: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  rating?: number;
  readTime?: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
}

export class DataGenerator {
  private static instance: DataGenerator;
  
  private categories = [
    '科技', '娱乐', '体育', '新闻', '教育', '旅游', '美食', '健康', 
    '财经', '汽车', '房产', '时尚', '游戏', '音乐', '电影', '书籍'
  ];
  
  private titles = [
    'React Native 性能优化指南',
    '深入理解 JavaScript 闭包',
    '移动端 UI 设计最佳实践',
    'TypeScript 高级类型系统',
    '前端工程化实战经验',
    '微服务架构设计模式',
    'GraphQL 实战应用',
    'Docker 容器化部署',
    'Kubernetes 集群管理',
    'Redis 缓存优化策略',
    'MySQL 数据库调优',
    'Node.js 后端开发',
    'Vue.js 组件设计',
    'Angular 企业级应用',
    'Flutter 跨平台开发',
    'SwiftUI 界面构建'
  ];
  
  private descriptions = [
    '这是一个详细的技术教程，涵盖了从基础到高级的各种概念和实践技巧。',
    '通过实际案例和代码示例，帮助开发者更好地理解和应用相关技术。',
    '深入分析了常见的问题和解决方案，提供了可行的最佳实践建议。',
    '结合了理论知识和实战经验，为读者提供全面的学习资源。',
    '包含了最新的技术趋势和发展方向，帮助开发者跟上时代步伐。',
    '通过循序渐进的方式，让初学者也能轻松掌握复杂的技术概念。'
  ];
  
  private tags = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Vue', 'Angular',
    'Flutter', 'Swift', 'Kotlin', 'Python', 'Java', 'Go', 'Rust',
    '前端', '后端', '全栈', '移动端', '性能优化', '架构设计', '最佳实践'
  ];

  static getInstance(): DataGenerator {
    if (!DataGenerator.instance) {
      DataGenerator.instance = new DataGenerator();
    }
    return DataGenerator.instance;
  }

  // 生成单个列表项
  generateItem(index: number): ListItem {
    const id = `item_${index}_${Date.now()}`;
    const categoryIndex = index % this.categories.length;
    const titleIndex = index % this.titles.length;
    const descIndex = index % this.descriptions.length;
    
    // 随机选择标签
    const selectedTags = this.getRandomTags(2, 4);
    
    return {
      id,
      title: `${this.titles[titleIndex]} #${index + 1}`,
      subtitle: `${this.categories[categoryIndex]} • ${this.formatDate(Date.now() - index * 60000)}`,
      description: this.descriptions[descIndex],
      avatar: this.generateAvatar(index),
      timestamp: Date.now() - index * 60000,
      category: this.categories[categoryIndex],
      status: this.getRandomStatus(),
      priority: this.getRandomPriority(),
      tags: selectedTags,
      metadata: {
        views: Math.floor(Math.random() * 10000) + 100,
        likes: Math.floor(Math.random() * 1000) + 10,
        comments: Math.floor(Math.random() * 100) + 1
      },
      // 新增复杂数据
      images: this.generateImages(index),
      author: this.generateAuthor(index),
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10, // 1.0-5.0
      readTime: Math.floor(Math.random() * 15) + 1, // 1-15分钟
      isBookmarked: Math.random() > 0.7,
      isLiked: Math.random() > 0.6,
    };
  }

  // 批量生成列表数据
  generateItems(count: number, startIndex: number = 0): ListItem[] {
    const items: ListItem[] = [];
    for (let i = 0; i < count; i++) {
      items.push(this.generateItem(startIndex + i));
    }
    return items;
  }

  // 生成头像 URL（使用多种头像服务）
  private generateAvatar(index: number): string {
    const avatarServices = [
      // 使用 DiceBear API 生成头像
      `https://api.dicebear.com/7.x/initials/svg?seed=${index}&backgroundColor=4CAF50,2196F3,FF9800,9C27B0,F44336&fontSize=40`,
      // 使用 UI Avatars
      `https://ui-avatars.com/api/?name=User${index}&background=random&color=fff&size=50&rounded=true`,
      // 使用 Gravatar 默认头像
      `https://www.gravatar.com/avatar/${index}?s=50&d=identicon&r=g`,
      // 本地fallback - 返回空字符串让组件使用文字头像
      ''
    ];
    
    // 随机选择一个服务，但偏向于使用可靠的服务
    const serviceIndex = index % 4;
    return avatarServices[serviceIndex];
  }

  // 生成多张图片
  private generateImages(index: number): string[] {
    const imageCount = Math.floor(Math.random() * 4) + 1; // 1-4张图片
    const images: string[] = [];
    
    for (let i = 0; i < imageCount; i++) {
      const imageServices = [
        `https://picsum.photos/300/200?random=${index + i}`,
        `https://source.unsplash.com/300x200/?nature,technology&sig=${index + i}`,
        `https://via.placeholder.com/300x200/4CAF50/ffffff?text=Image${i + 1}`,
        `https://dummyimage.com/300x200/2196F3/ffffff&text=Photo${i + 1}`,
      ];
      const serviceIndex = (index + i) % imageServices.length;
      images.push(imageServices[serviceIndex]);
    }
    
    return images;
  }

  // 生成作者信息
  private generateAuthor(index: number): { name: string; avatar: string; verified: boolean } {
    const names = [
      '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
      '陈一', '刘二', '杨三', '黄四', '朱五', '林六', '徐七', '马八'
    ];
    
    const nameIndex = index % names.length;
    
    return {
      name: names[nameIndex],
      avatar: this.generateAvatar(index + 1000), // 使用不同的种子
      verified: Math.random() > 0.6, // 40%的概率是认证用户
    };
  }

  // 随机选择标签
  private getRandomTags(min: number, max: number): string[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...this.tags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // 随机状态
  private getRandomStatus(): 'active' | 'inactive' | 'pending' {
    const statuses: ('active' | 'inactive' | 'pending')[] = ['active', 'inactive', 'pending'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // 随机优先级
  private getRandomPriority(): 'high' | 'medium' | 'low' {
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  // 格式化日期
  private formatDate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return new Date(timestamp).toLocaleDateString('zh-CN');
  }

  // 搜索过滤
  filterItems(items: ListItem[], query: string): ListItem[] {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // 排序
  sortItems(items: ListItem[], sortBy: 'timestamp' | 'views' | 'likes' | 'title', order: 'asc' | 'desc' = 'desc'): ListItem[] {
    return [...items].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'views':
          aValue = a.metadata.views;
          bValue = b.metadata.views;
          break;
        case 'likes':
          aValue = a.metadata.likes;
          bValue = b.metadata.likes;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  // 分类过滤
  filterByCategory(items: ListItem[], category: string): ListItem[] {
    if (!category || category === '全部') return items;
    return items.filter(item => item.category === category);
  }

  // 状态过滤
  filterByStatus(items: ListItem[], status: string): ListItem[] {
    if (!status || status === '全部') return items;
    return items.filter(item => item.status === status);
  }

  // 获取所有分类
  getCategories(): string[] {
    return ['全部', ...this.categories];
  }

  // 获取所有状态
  getStatuses(): string[] {
    return ['全部', 'active', 'inactive', 'pending'];
  }
}

export default DataGenerator;
