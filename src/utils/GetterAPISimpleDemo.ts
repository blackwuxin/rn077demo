// 简化的 Getter API 演示

// 基础 Getter API 模式示例
const SimpleAPI = {
  // 延迟加载网络工具
  get NetworkUtils() {
    console.log('📦 Loading NetworkUtils module...');
    return require('./NetworkUtils').default;
  },
  
  // 延迟加载存储工具
  get StorageUtils() {
    console.log('📦 Loading StorageUtils module...');
    return require('./StorageUtils').default;
  }
};


export { SimpleAPI };
export default SimpleAPI;
