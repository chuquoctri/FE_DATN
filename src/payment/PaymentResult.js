import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const PaymentResult = ({route, navigation}) => {
  const {success, paymentInfo} = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={
          success
            ? require('../assets/payment_success.png')
            : require('../assets/payment_failed.png')
        }
        style={styles.image}
      />

      <Text style={styles.title}>
        {success ? 'Thanh toán thành công!' : 'Thanh toán không thành công'}
      </Text>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Thông tin thanh toán:</Text>
        <Text style={styles.infoText}>
          Số tiền: {paymentInfo.totalAmount.toLocaleString()}đ
        </Text>
        <Text style={styles.infoText}>
          Phương thức: {paymentInfo.paymentMethod}
        </Text>
        <Text style={styles.infoText}>
          Số phòng: {paymentInfo.bookings.length}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HomeScreen')}>
        <Text style={styles.buttonText}>Về trang chủ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  infoSection: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#007bff',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentResult;
