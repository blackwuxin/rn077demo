npx react-native bundle --entry-file index.js --platform ios --bundle-output out/index.ios.jsbundle.js --assets-dest out --dev false

./node_modules/react-native/sdks/hermesc/osx-bin/hermesc --emit-binary -out out/index.ios.jsbundle.hbc  out/index.ios.jsbundle.js

bsdiff out/index.ios.jsbundle1.js out/index.ios.jsbundle2.js out/bundle.patch
bspatch out/index.ios.jsbundle1.js out/test_patched.js out/bundle.patch
diff  out/test_patched.js out/index.ios.jsbundle2.js && echo "文件完全相同" || echo "文件存在差异"

# React Native 路由示例应用

这是一个使用 React Navigation 实现路由功能的 React Native 应用示例。

## 🚀 功能特性

- ✅ 多页面导航系统
- ✅ 页面间参数传递
- ✅ TypeScript 类型安全
- ✅ 现代化 UI 设计
- ✅ 堆栈导航器
- ✅ 自定义页面标题
- ✅ **智能懒加载系统**
- ✅ **性能优化预加载**
- ✅ **自定义加载体验**

## 📱 页面结构

### 主要页面
- **首页 (HomeScreen)**: 应用的主入口，包含导航到其他页面的按钮
- **个人资料 (ProfileScreen)**: 显示用户信息的页面
- **设置 (SettingsScreen)**: 应用设置页面，包含开关控件
- **详情 (DetailsScreen)**: 支持参数传递的详情页面

### 导航功能
- 页面间跳转
- 返回上一页
- 参数传递 (如: itemId, title)
- 自定义页面标题

### 性能优化
- **懒加载**: 页面按需加载，提升启动速度
- **智能预加载**: 常用页面在空闲时预加载
- **内存优化**: 未使用页面不占用内存
- **流畅体验**: 使用 InteractionManager 优化加载时机

## 🛠 技术栈

- **React Native**: 0.77.0
- **React Navigation**: ^6.x
- **TypeScript**: 类型安全的开发体验
- **React Native Gesture Handler**: 手势处理
- **React Native Screens**: 原生屏幕优化

---

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
