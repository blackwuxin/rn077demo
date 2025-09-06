// 网络工具模块
export default {
  async fetchData(url: string) {
    console.log(`Fetching data from: ${url}`);
    // 模拟网络请求
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          data: 'Mock data from ' + url, 
          timestamp: Date.now(),
          status: 'success'
        });
      }, 1000);
    });
  },
  
  isOnline() {
    // 模拟网络状态检查
    return Math.random() > 0.3;
  },

  async get(url: string) {
    console.log(`GET request to: ${url}`);
    return this.fetchData(url);
  },

  async post(url: string, data: any) {
    console.log(`POST request to: ${url}`, data);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          data: data,
          timestamp: Date.now()
        });
      }, 800);
    });
  }
};
