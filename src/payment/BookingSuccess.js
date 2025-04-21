import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BookingSuccess = ({route, navigation}) => {
  const {paymentInfo} = route.params;

  return (
    <View style={styles.container}>
      <Icon name="checkmark-circle-outline" size={100} color="#28a745" />
      <Text style={styles.title}>Thanh toán thành công!</Text>
      <Text style={styles.message}>
        Cảm ơn bạn đã đặt phòng. Chúng tôi đã ghi nhận đơn của bạn.
      </Text>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          Tổng tiền: {paymentInfo.totalAmount.toLocaleString()}đ
        </Text>
        <Text style={styles.detailText}>
          Phương thức: {paymentInfo.paymentMethod}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Về trang chính</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#28a745',
  },
  message: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#555',
  },
  details: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    width: '100%',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingSuccess;
