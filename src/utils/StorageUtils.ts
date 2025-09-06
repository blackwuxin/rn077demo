// 存储工具模块
export default {
  async setItem(key: string, value: any) {
    console.log(`Storing ${key}:`, value);
    // 模拟存储操作
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log(`Successfully stored ${key}`);
        resolve();
      }, 300);
    });
  },
  
  async getItem(key: string) {
    console.log(`Getting ${key} from storage`);
    // 模拟获取数据
    return new Promise(resolve => {
      setTimeout(() => {
        const mockData = `stored_value_for_${key}_${Date.now()}`;
        console.log(`Retrieved ${key}:`, mockData);
        resolve(mockData);
      }, 200);
    });
  },

  async removeItem(key: string) {
    console.log(`Removing ${key} from storage`);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log(`Successfully removed ${key}`);
        resolve();
      }, 150);
    });
  },

  async clear() {
    console.log('Clearing all storage');
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log('Storage cleared');
        resolve();
      }, 400);
    });
  }
};
