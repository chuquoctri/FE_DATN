import React, {useState, useEffect, useRef} from 'react';
import {WebView} from 'react-native-webview';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Alert, // Thêm Alert để xử lý lỗi nghiêm trọng
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomPaymentResultModal from './CustomPaymentResultModal'; // Đảm bảo đường dẫn này đúng

const VnpayWebView = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // 1. Nhận params từ PaymentScreen
  const params = route.params || {}; // Fallback nếu route.params undefined
  const {
    paymentUrl,
    userId: userIdFromPaymentScreen, // userId nhận được
    userName: userNameFromPaymentScreen, // userName nhận được
    // ... các params khác bạn truyền từ PaymentScreen ...
    orderId: orderIdFromPaymentScreen, // Giả sử orderId cũng được truyền để dùng nếu cần
    fromScreen,
    currentTotalAmountForDisplay,
  } = params;

  // Log params nhận được ngay khi component mount hoặc params thay đổi
  useEffect(() => {
    console.log(
      '--- [VnpayWebView] Component Mounted or route.params changed ---',
    );
    console.log(
      '[VnpayWebView] Received route.params:',
      JSON.stringify(route.params, null, 2),
    );
    console.log(
      '[VnpayWebView] Destructured userIdFromPaymentScreen:',
      userIdFromPaymentScreen,
    );
    console.log(
      '[VnpayWebView] Destructured userNameFromPaymentScreen:',
      userNameFromPaymentScreen,
    );

    if (!userIdFromPaymentScreen) {
      console.error(
        '[VnpayWebView] LỖI NGHIÊM TRỌNG: userIdFromPaymentScreen là undefined!',
      );
      Alert.alert(
        'Lỗi Truyền Dữ Liệu',
        'Không nhận được User ID cần thiết cho trang thanh toán. Vui lòng thử lại từ đầu.',
        [
          {
            text: 'Quay Lại',
            onPress: () =>
              navigation.navigate('HomeScreen', {
                userId: undefined,
                userName: undefined,
              }),
          },
        ], // Về Home và reset params
      );
    }
    // userName có thể không bắt buộc cho mọi logic của WebView, nhưng quan trọng để truyền về Home
    if (!userNameFromPaymentScreen) {
      console.warn(
        '[VnpayWebView] CẢNH BÁO: userNameFromPaymentScreen là undefined. HomeScreen có thể không hiển thị tên người dùng.',
      );
    }
  }, [route.params, userIdFromPaymentScreen, userNameFromPaymentScreen]); // Thêm route.params vào dependencies

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalOutcome, setModalOutcome] = useState('failure'); // 'success' hoặc 'failure'
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  // State này sẽ giữ params chuẩn bị cho việc điều hướng (bao gồm cả userId và userName)
  const [modalNavigationParams, setModalNavigationParams] = useState(null);

  // 2. Xử lý đóng Modal và Điều hướng
  const handleModalCloseAndNavigate = navParamsForModal => {
    // navParamsForModal từ state modalNavigationParams
    setIsModalVisible(false); // Ẩn modal

    // Đợi một chút cho animation đóng modal (nếu có) rồi mới điều hướng
    setTimeout(() => {
      if (
        modalOutcome === 'success' &&
        navParamsForModal?.paramsForHomeScreen
      ) {
        console.log(
          '[VnpayWebView] Đóng Modal (THÀNH CÔNG). Reset và điều hướng về HomeScreen với params:',
          JSON.stringify(navParamsForModal.paramsForHomeScreen, null, 2),
        );
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'HomeScreen',
              params: navParamsForModal.paramsForHomeScreen, // Truyền đầy đủ params về HomeScreen
            },
          ],
        });
      } else {
        // Trường hợp thất bại hoặc không có paramsForHomeScreen
        console.log(
          '[VnpayWebView] Đóng Modal (THẤT BẠI hoặc không có params). Outcome:',
          modalOutcome,
          ' Quay về màn hình trước (PaymentScreen).',
        );
        // Nếu thất bại, có thể quay lại PaymentScreen hoặc HomeScreen với thông báo lỗi
        // Hiện tại, logic là quay lại màn hình trước đó (PaymentScreen)
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          // Nếu không thể goBack (ví dụ stack chỉ có VnpayWebView), về HomeScreen với trạng thái thất bại
          navigation.replace('HomeScreen', {
            userId: userIdFromPaymentScreen,
            userName: userNameFromPaymentScreen,
            paymentSuccess: false, // Thêm trạng thái thanh toán
            // orderIdAttempted: navParamsForModal?.paramsForHomeScreen?.orderIdAttempted, // Nếu có
          });
        }
      }
    }, 300); // Delay nhỏ cho UI
  };

  // 3. Xử lý tin nhắn từ WebView (khi vnpay_return_handler.php gửi postMessage)
  const handleWebViewMessage = event => {
    console.log(
      '[VnpayWebView] Received message from WebView:',
      event.nativeEvent.data,
    );
    try {
      const dataFromPHP = JSON.parse(event.nativeEvent.data);
      console.log(
        '[VnpayWebView] Parsed data from PHP:',
        JSON.stringify(dataFromPHP, null, 2),
      );

      if (dataFromPHP.vnpay_event === 'payment_result') {
        const {
          outcome, // 'success' hoặc 'failure'
          message, // Thông báo từ PHP
          orderId: returnedOrderIdFromPHP, // ID đơn hàng từ PHP xử lý
          responseCode, // Mã lỗi từ VNPay (nếu có)
        } = dataFromPHP;

        setModalOutcome(outcome);
        setModalMessage(
          message ||
            (outcome === 'success'
              ? 'Giao dịch thành công!'
              : 'Giao dịch không thành công.'),
        );

        // Chuẩn bị params để truyền về HomeScreen
        const paramsForHomeScreen = {
          userId: userIdFromPaymentScreen, // Luôn truyền lại userId
          userName: userNameFromPaymentScreen, // Luôn truyền lại userName
          paymentSuccess: outcome === 'success',
          orderIdPaid: outcome === 'success' ? returnedOrderIdFromPHP : null,
          orderIdAttempted: returnedOrderIdFromPHP || orderIdFromPaymentScreen, // orderId đã cố gắng thanh toán
          errorCode: outcome !== 'success' ? responseCode : null,
          // Thêm các thông tin khác nếu HomeScreen cần để hiển thị thông báo hoặc cập nhật UI
        };
        console.log(
          '[VnpayWebView] Chuẩn bị params cho HomeScreen sau khi xử lý postMessage:',
          JSON.stringify(paramsForHomeScreen, null, 2),
        );

        setModalNavigationParams({paramsForHomeScreen}); // Lưu params này để dùng khi đóng modal

        if (outcome === 'success') {
          setModalTitle('Thanh toán thành công!');
        } else {
          setModalTitle('Thanh toán thất bại');
        }
        setIsModalVisible(true); // Hiển thị modal kết quả
      } else {
        console.warn(
          '[VnpayWebView] Nhận được sự kiện không xác định từ postMessage:',
          dataFromPHP,
        );
        // Có thể hiển thị một lỗi chung nếu sự kiện không mong muốn
      }
    } catch (error) {
      console.error(
        '[VnpayWebView] Lỗi parse JSON từ WebView hoặc xử lý message:',
        error,
        'Dữ liệu gốc:',
        event.nativeEvent.data,
      );
      setModalOutcome('failure');
      setModalTitle('Lỗi Xử Lý Kết Quả');
      setModalMessage(
        'Không thể xử lý phản hồi từ cổng thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
      );
      setModalNavigationParams({
        paramsForHomeScreen: {
          userId: userIdFromPaymentScreen,
          userName: userNameFromPaymentScreen,
          paymentSuccess: false,
        },
      });
      setIsModalVisible(true);
    }
  };

  // Xử lý lỗi nếu không có paymentUrl
  if (!paymentUrl) {
    console.error('[VnpayWebView] LỖI: paymentUrl là undefined!');
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>
          Lỗi: Không có URL thanh toán hợp lệ.
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.replace('HomeScreen', {
                  userId: userIdFromPaymentScreen,
                  userName: userNameFromPaymentScreen,
                })
          }
          style={styles.backButtonError}>
          <Text style={styles.backButtonErrorText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop:
          Platform.OS === 'android'
            ? 0
            : 20 /* Khoảng trống cho status bar iOS */,
      }}>
      <WebView
        source={{uri: paymentUrl}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text>Đang tải trang thanh toán...</Text>
          </View>
        )}
        // Xử lý lỗi khi WebView không tải được trang ban đầu
        onError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.warn(
            '[VnpayWebView] Lỗi tải WebView ban đầu (onError):',
            JSON.stringify(nativeEvent, null, 2),
          );
          setModalOutcome('failure');
          setModalTitle('Lỗi Tải Trang');
          setModalMessage(
            `Không thể tải trang thanh toán (${nativeEvent.code || ''} ${
              nativeEvent.description || 'Lỗi không xác định'
            }). Vui lòng kiểm tra kết nối mạng và thử lại.`,
          );
          setModalNavigationParams({
            paramsForHomeScreen: {
              userId: userIdFromPaymentScreen,
              userName: userNameFromPaymentScreen,
              paymentSuccess: false,
            },
          });
          setIsModalVisible(true);
        }}
        // onHttpError cho lỗi HTTP cụ thể (ví dụ 404, 500 từ server VNPay)
        onHttpError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.warn(
            '[VnpayWebView] Lỗi HTTP từ WebView (onHttpError):',
            JSON.stringify(nativeEvent, null, 2),
          );
          setModalOutcome('failure');
          setModalTitle(`Lỗi Máy Chủ (${nativeEvent.statusCode})`);
          setModalMessage(
            `Gặp sự cố khi kết nối đến máy chủ thanh toán. Vui lòng thử lại sau.`,
          );
          setModalNavigationParams({
            paramsForHomeScreen: {
              userId: userIdFromPaymentScreen,
              userName: userNameFromPaymentScreen,
              paymentSuccess: false,
            },
          });
          setIsModalVisible(true);
        }}
      />
      <CustomPaymentResultModal
        isVisible={isModalVisible}
        outcome={modalOutcome}
        title={modalTitle}
        message={modalMessage}
        onClose={() => handleModalCloseAndNavigate(modalNavigationParams)} // Truyền modalNavigationParams vào đây
        // buttonText prop không cần thiết nếu CustomPaymentResultModal tự xử lý text dựa trên outcome
        // buttonText={...} // Nếu bạn muốn override text mặc định của Modal
        navigationParams={modalNavigationParams} // Vẫn truyền để CustomModal có thể dùng nếu cần (dù onClose đã có)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonError: {
    // Đổi tên style để tránh trùng với style backButton trong header của các màn hình khác
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonErrorText: {color: '#fff', fontSize: 16},
});

export default VnpayWebView;
