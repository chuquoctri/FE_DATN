import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import axios from 'axios';
import url from '../../ipconfig';

const VNPayPayment = ({route, navigation}) => {
  const {amount, selectedBookings} = route.params;
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createPayment = async () => {
      try {
        const response = await axios.post(
          `${url}API_DATN/API_User/Payment/vnpay_create_payment.php`,
          {
            amount: amount,
            bookingIds: selectedBookings,
          },
        );

        if (response.data.paymentUrl) {
          setPaymentUrl(response.data.paymentUrl);
        } else {
          Alert.alert('Lỗi', 'Không thể tạo URL thanh toán');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Lỗi khi tạo thanh toán:', error);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi kết nối với VNPay');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    createPayment();
  }, []);

  const handleNavigationStateChange = navState => {
    if (navState.url.includes('vnp_ResponseCode=00')) {
      navigation.replace('PaymentResult', {
        success: true,
        message: 'Thanh toán thành công qua VNPay',
      });
    } else if (
      navState.url.includes('vnp_ResponseCode') &&
      !navState.url.includes('vnp_ResponseCode=00')
    ) {
      navigation.replace('PaymentResult', {
        success: false,
        message: 'Thanh toán thất bại qua VNPay',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <WebView
      source={{uri: paymentUrl}}
      onNavigationStateChange={handleNavigationStateChange}
      style={styles.webview}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
});

export default VNPayPayment;
