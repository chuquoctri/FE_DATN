import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import url from '../../ipconfig';

const PaymentScreen = ({route, navigation}) => {
  const {paymentInfo} = route.params;
  const [loading, setLoading] = useState(false);

  const handleMoMoPayment = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${url}API_DATN/API_User/Payment/momo_create_payment.php`,
        {
          amount: paymentInfo.totalAmount,
          bookingIds: paymentInfo.bookings.map(b => b.id),
          userId: paymentInfo.userId,
          bookingDetails: paymentInfo.bookings,
        },
      );

      if (response.data && response.data.payUrl) {
        navigation.navigate('MoMoWebView', {
          paymentUrl: response.data.payUrl,
          paymentInfo: paymentInfo,
        });
      } else {
        Alert.alert('Lỗi', 'Không thể khởi tạo thanh toán MoMo');
      }
    } catch (error) {
      console.error('Lỗi thanh toán MoMo:', error);
      Alert.alert('Lỗi', 'Thanh toán MoMo thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Xác nhận thanh toán</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin đặt phòng</Text>
        {paymentInfo.bookings.map((booking, index) => (
          <View key={index} style={styles.bookingItem}>
            <Text style={styles.bookingText}>Phòng: {booking.roomName}</Text>
            <Text style={styles.bookingText}>
              Khách sạn: {booking.hotelName}
            </Text>
            <Text style={styles.bookingText}>
              Ngày nhận: {booking.checkInDate}
            </Text>
            <Text style={styles.bookingText}>
              Ngày trả: {booking.checkOutDate}
            </Text>
            <Text style={styles.bookingText}>
              Giá: {booking.price.toLocaleString()}đ
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Tổng cộng: {paymentInfo.totalAmount.toLocaleString()}đ
        </Text>
        <Text style={styles.summaryText}>
          Phương thức: {paymentInfo.paymentMethod}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.payButton}
        onPress={handleMoMoPayment}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.payButtonText}>Thanh toán bằng MoMo</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#007bff',
  },
  bookingItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  bookingText: {
    fontSize: 15,
    marginBottom: 5,
    color: '#555',
  },
  summary: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  payButton: {
    backgroundColor: '#a50064',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
