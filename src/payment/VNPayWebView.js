import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

const VNPayWebView = ({route, navigation}) => {
  const {paymentUrl, paymentInfo} = route.params;
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [connectionStatus, setConnectionStatus] = useState(true);
  const timeoutRef = useRef(null);
  const webViewRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetryAttempts = 3;

  // Kiểm tra kết nối mạng
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionStatus(state.isConnected);
      if (!state.isConnected) {
        handleConnectionError();
      }
    });

    return () => unsubscribe();
  }, []);

  // Xử lý timeout sau 3 phút (giảm từ 5 phút)
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, 180000); // 3 phút

    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Xử lý timeout
  const handleTimeout = () => {
    setPaymentStatus('timeout');
    Alert.alert(
      'Thông báo',
      'Quá thời gian thanh toán. Vui lòng kiểm tra lại giao dịch',
      [
        {
          text: 'Đóng',
          onPress: () =>
            navigation.replace('PaymentResult', {
              success: false,
              paymentInfo,
              message: 'Quá thời gian thanh toán',
            }),
        },
      ],
    );
  };

  // Xử lý lỗi kết nối
  const handleConnectionError = () => {
    Alert.alert(
      'Lỗi mạng',
      'Không có kết nối mạng. Vui lòng kiểm tra lại kết nối của bạn.',
      [
        {
          text: 'Thử lại',
          onPress: () => checkConnectionAndRetry(),
        },
        {
          text: 'Quay lại',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  // Kiểm tra kết nối và thử lại
  const checkConnectionAndRetry = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      handleRetry();
    } else {
      Alert.alert('Lỗi mạng', 'Vẫn chưa có kết nối mạng.');
    }
  };

  // Xử lý thay đổi trạng thái navigation
  const handleNavigationStateChange = navState => {
    // Pre-parse URL để giảm thời gian xử lý
    const url = navState.url;

    if (url.includes('vnp_ResponseCode=00')) {
      clearTimeout(timeoutRef.current);
      setPaymentStatus('success');
      const transactionRef = extractParamFromUrl(url, 'vnp_TxnRef');
      verifyPaymentWithBackend(transactionRef);
    } else if (url.includes('vnp_ResponseCode=')) {
      clearTimeout(timeoutRef.current);
      setPaymentStatus('failed');
      navigation.replace('PaymentResult', {
        success: false,
        paymentInfo,
        message: extractParamFromUrl(url, 'vnp_ResponseMessage'),
      });
    }

    // Tối ưu hiển thị loading
    if (navState.loading !== loading) {
      setLoading(navState.loading);
    }
  };

  // Xác minh thanh toán với backend
  const verifyPaymentWithBackend = async transactionRef => {
    try {
      const response = await axios.post('YOUR_BACKEND_VERIFY_ENDPOINT', {
        transactionRef,
      });

      if (response.data.success) {
        navigation.replace('PaymentResult', {
          success: true,
          paymentInfo,
          transactionRef,
        });
      } else {
        navigation.replace('PaymentResult', {
          success: false,
          paymentInfo,
          message: response.data.message || 'Xác minh thanh toán thất bại',
        });
      }
    } catch (error) {
      navigation.replace('PaymentResult', {
        success: false,
        paymentInfo,
        message: 'Lỗi xác minh thanh toán',
      });
    }
  };

  // Trích xuất tham số từ URL (tối ưu hóa)
  const extractParamFromUrl = (url, param) => {
    const paramIndex = url.indexOf(param + '=');
    if (paramIndex === -1) return null;

    const startIndex = paramIndex + param.length + 1;
    const endIndex = url.indexOf('&', startIndex);
    return decodeURIComponent(
      endIndex === -1
        ? url.substring(startIndex)
        : url.substring(startIndex, endIndex),
    );
  };

  // Thử lại kết nối
  const handleRetry = () => {
    if (retryCountRef.current >= maxRetryAttempts) {
      Alert.alert('Lỗi', 'Đã vượt quá số lần thử lại cho phép');
      return;
    }

    retryCountRef.current += 1;

    if (webViewRef.current) {
      webViewRef.current.reload();
      setPaymentStatus('processing');
      setLoading(true);

      // Reset timeout
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(handleTimeout, 180000);
    }
  };

  // Render error view
  const renderErrorView = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Không thể kết nối đến VNPay</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>
          Thử lại ({maxRetryAttempts - retryCountRef.current})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {!connectionStatus || paymentStatus === 'timeout' ? (
        renderErrorView()
      ) : (
        <>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Đang kết nối đến VNPay...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{uri: paymentUrl}}
            onNavigationStateChange={handleNavigationStateChange}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={true}
            applicationNameForUserAgent={
              Platform.OS === 'ios'
                ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
                : 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
            }
            onError={() => {
              if (retryCountRef.current < maxRetryAttempts) {
                handleRetry();
              } else {
                renderErrorView();
              }
            }}
            renderError={renderErrorView}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 15,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VNPayWebView;
