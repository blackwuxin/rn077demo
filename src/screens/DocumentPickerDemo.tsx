import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DocumentPicker, {
  DocumentPickerResponse,
  types,
} from 'react-native-document-picker';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentPickerDemo'>;

interface SelectedFile extends DocumentPickerResponse {
  id: string;
}

const {width: screenWidth} = Dimensions.get('window');

const DocumentPickerDemo: React.FC<Props> = ({navigation}) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 选择单个文档
  const pickSingleDocument = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'documentDirectory',
      });
      
      const fileWithId: SelectedFile = {
        ...result,
        id: Date.now().toString(),
      };
      
      setSelectedFiles(prev => [fileWithId, ...prev]);
      
      Alert.alert(
        '文件选择成功',
        `文件名: ${result.name}\n大小: ${formatFileSize(result.size || 0)}\n类型: ${result.type}`,
        [{text: '确定'}]
      );
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Document picker error:', error);
        Alert.alert('错误', '选择文件时发生错误');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 选择多个文档
  const pickMultipleDocuments = async () => {
    try {
      setIsLoading(true);
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
        copyTo: 'documentDirectory',
      });
      
      const filesWithId: SelectedFile[] = results.map(result => ({
        ...result,
        id: Date.now().toString() + Math.random().toString(),
      }));
      
      setSelectedFiles(prev => [...filesWithId, ...prev]);
      
      Alert.alert(
        '文件选择成功',
        `已选择 ${results.length} 个文件`,
        [{text: '确定'}]
      );
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Document picker error:', error);
        Alert.alert('错误', '选择文件时发生错误');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 选择特定类型的文档
  const pickSpecificType = async (fileType: string, typeName: string) => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.pickSingle({
        type: [fileType as any],
        copyTo: 'documentDirectory',
      });
      
      const fileWithId: SelectedFile = {
        ...result,
        id: Date.now().toString(),
      };
      
      setSelectedFiles(prev => [fileWithId, ...prev]);
      
      Alert.alert(
        `${typeName}选择成功`,
        `文件名: ${result.name}\n大小: ${formatFileSize(result.size || 0)}`,
        [{text: '确定'}]
      );
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Document picker error:', error);
        Alert.alert('错误', `选择${typeName}时发生错误`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件类型图标
  const getFileIcon = (type: string): string => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('text')) return '📝';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📁';
  };

  // 删除文件
  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  // 清空所有文件
  const clearAllFiles = () => {
    Alert.alert(
      '确认清空',
      '确定要清空所有已选择的文件吗？',
      [
        {text: '取消', style: 'cancel'},
        {text: '确定', onPress: () => setSelectedFiles([])},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>文档选择器示例</Text>
          <Text style={styles.subtitle}>
            展示 react-native-document-picker 的各种用法
          </Text>
        </View>

        {/* 基础功能按钮 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基础功能</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={pickSingleDocument}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '选择中...' : '📄 选择单个文档'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={pickMultipleDocuments}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '选择中...' : '📚 选择多个文档'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 特定类型选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择特定类型</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.typeButton, styles.imageButton]}
              onPress={() => pickSpecificType(types.images, '图片')}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>🖼️ 图片</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.typeButton, styles.pdfButton]}
              onPress={() => pickSpecificType(types.pdf, 'PDF')}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>📄 PDF</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.typeButton, styles.videoButton]}
              onPress={() => pickSpecificType(types.video, '视频')}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>🎥 视频</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.typeButton, styles.audioButton]}
              onPress={() => pickSpecificType(types.audio, '音频')}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>🎵 音频</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 已选择文件列表 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              已选择文件 ({selectedFiles.length})
            </Text>
            {selectedFiles.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllFiles}
              >
                <Text style={styles.clearButtonText}>清空</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无选择的文件</Text>
              <Text style={styles.emptySubtext}>点击上方按钮选择文件</Text>
            </View>
          ) : (
            selectedFiles.map((file) => (
              <View key={file.id} style={styles.fileItem}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileIcon}>
                    {getFileIcon(file.type || '')}
                  </Text>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName} numberOfLines={2}>
                      {file.name}
                    </Text>
                    <Text style={styles.fileSize}>
                      {formatFileSize(file.size || 0)} • {file.type}
                    </Text>
                    {file.fileCopyUri && (
                      <Text style={styles.filePath} numberOfLines={1}>
                        {file.fileCopyUri}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFile(file.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* 使用说明 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>使用说明</Text>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 功能特点:</Text>
            <Text style={styles.tipText}>
              • 支持选择单个或多个文档{'\n'}
              • 支持按文件类型筛选{'\n'}
              • 自动复制文件到应用目录{'\n'}
              • 显示文件详细信息{'\n'}
              • 支持文件管理操作
            </Text>
          </View>

          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>📱 权限说明:</Text>
            <Text style={styles.tipText}>
              iOS: 需要在 Info.plist 中配置文档访问权限{'\n'}
              Android: 需要存储访问权限
            </Text>
          </View>
        </View>

        {/* 返回按钮 */}
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← 返回首页</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  imageButton: {
    backgroundColor: '#FF6B35',
  },
  pdfButton: {
    backgroundColor: '#DC3545',
  },
  videoButton: {
    backgroundColor: '#6F42C1',
  },
  audioButton: {
    backgroundColor: '#FD7E14',
  },
  backButton: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  clearButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  filePath: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Courier New',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC3545',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#0D47A1',
    lineHeight: 16,
  },
});

export default DocumentPickerDemo;

