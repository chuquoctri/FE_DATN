import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import url from '../../ipconfig';

const POLLING_INTERVAL = 30000;

const ListBooking = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {userId} = route.params;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const pollingRef = useRef(null);

  const calculateTimeLeft = updatedAt => {
    const now = new Date();
    const updatedTime = new Date(updatedAt);
    const deadline = new Date(updatedTime.getTime() + 24 * 60 * 60 * 1000);
    const diffInMs = deadline - now;

    if (diffInMs <= 0) {
      return {expired: true};
    }

    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      expired: false,
    };
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${url}API_DATN/API_User/List_booking/get_booking.php?nguoi_dung_id=${userId}`,
      );
      const json = await response.json();

      if (json.status === 'success') {
        const updatedBookings = json.data.map(booking => {
          const isConfirmed = booking.trang_thai === 'confirmed';
          const timeLeft = isConfirmed
            ? calculateTimeLeft(booking.ngay_cap_nhat)
            : null;

          return {
            ...booking,
            canPay: isConfirmed && timeLeft && !timeLeft.expired,
            timeLeft,
          };
        });

        setBookings(updatedBookings);

        const newCountdowns = {};
        updatedBookings
          .filter(b => b.trang_thai === 'confirmed')
          .forEach(b => {
            newCountdowns[b.id] = calculateTimeLeft(b.ngay_cap_nhat);
          });
        setCountdowns(newCountdowns);
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newCountdowns = {};
      let needRefresh = false;

      bookings.forEach(b => {
        if (b.trang_thai === 'confirmed') {
          const timeLeft = calculateTimeLeft(b.ngay_cap_nhat);
          newCountdowns[b.id] = timeLeft;

          if (b.canPay && timeLeft.expired) {
            needRefresh = true;
          }
        }
      });

      setCountdowns(newCountdowns);

      if (needRefresh) {
        fetchBookings();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [bookings]);

  const startPolling = () => {
    pollingRef.current = setInterval(fetchBookings, POLLING_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  };

  useEffect(() => {
    fetchBookings();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [userId]);

  const renderStatus = status => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const toggleBookingSelection = bookingId => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId],
    );
  };

  const handlePayment = () => {
    if (selectedBookings.length === 0) {
      Alert.alert(
        'Thông báo',
        'Vui lòng chọn ít nhất một đặt phòng để thanh toán',
      );
      return;
    }

    // Lấy thông tin chi tiết các đơn đã chọn
    const selectedBookingDetails = bookings.filter(b =>
      selectedBookings.includes(b.id),
    );

    // Tính tổng tiền
    const totalAmount = selectedBookingDetails.reduce(
      (sum, booking) => sum + parseFloat(booking.tong_tien),
      0,
    );

    // Chuẩn bị thông tin thanh toán
    const paymentInfo = {
      userId: userId,
      totalAmount: totalAmount,
      bookings: selectedBookingDetails.map(booking => ({
        id: booking.id,
        roomName: booking.ten_phong,
        hotelName: booking.ten_khach_san,
        checkInDate: booking.ngay_nhan_phong,
        checkOutDate: booking.ngay_tra_phong,
        price: booking.tong_tien,
        status: booking.trang_thai,
      })),
      paymentMethod: 'VNPay',
    };

    // Chuyển sang trang thanh toán
    navigation.navigate('PaymentScreen', {paymentInfo});
  };

  const handleDelete = bookingId => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa đặt phòng này?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            const response = await fetch(
              `${url}API_DATN/API_User/List_booking/delete_booking.php`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  booking_ids: [bookingId],
                }),
              },
            );

            const result = await response.json();

            if (result.status === 'success') {
              setBookings(prev => prev.filter(item => item.id !== bookingId));
              // Xóa khỏi danh sách chọn nếu có
              setSelectedBookings(prev => prev.filter(id => id !== bookingId));
              Alert.alert('Thành công', 'Xóa đặt phòng thành công');
            } else {
              Alert.alert('Lỗi', result.message || 'Xóa không thành công');
            }
          } catch (error) {
            console.error('Lỗi khi xóa:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xóa đặt phòng');
          }
        },
      },
    ]);
  };

  const BookingItem = ({item}) => (
    <View
      style={[
        styles.card,
        item.trang_thai !== 'confirmed' && styles.unconfirmedCard,
      ]}>
      <CheckBox
        value={selectedBookings.includes(item.id)}
        onValueChange={() =>
          item.trang_thai === 'confirmed' && toggleBookingSelection(item.id)
        }
        tintColors={{
          true: '#28a745',
          false: item.trang_thai === 'confirmed' ? '#aaa' : '#eee',
        }}
        style={styles.checkbox}
        disabled={item.trang_thai !== 'confirmed'}
      />

      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.hotelName,
              item.trang_thai !== 'confirmed' && styles.unconfirmedText,
            ]}>
            {item.ten_khach_san}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Image
              source={require('../assets/delete.png')}
              style={styles.deleteImage}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.roomName,
            item.trang_thai !== 'confirmed' && styles.unconfirmedText,
          ]}>
          Phòng: {item.ten_phong}
        </Text>

        <Text
          style={[
            styles.date,
            item.trang_thai !== 'confirmed' && styles.unconfirmedText,
          ]}>
          {item.ngay_nhan_phong} ➜ {item.ngay_tra_phong}
        </Text>

        <Text
          style={[
            styles.status,
            item.trang_thai === 'confirmed'
              ? styles.statusConfirmed
              : item.trang_thai === 'cancelled'
              ? styles.statusCancelled
              : styles.statusPending,
            item.trang_thai !== 'confirmed' && styles.unconfirmedText,
          ]}>
          Trạng thái: {renderStatus(item.trang_thai)}
        </Text>

        {item.trang_thai === 'confirmed' && (
          <Text
            style={[
              item.canPay ? styles.canPayText : styles.expiredText,
              item.trang_thai !== 'confirmed' && styles.unconfirmedText,
            ]}>
            {item.canPay
              ? `Có thể thanh toán (còn: ${
                  countdowns[item.id]?.hours || '00'
                }:${countdowns[item.id]?.minutes || '00'}:${
                  countdowns[item.id]?.seconds || '00'
                })`
              : 'Đã quá thời hạn thanh toán'}
          </Text>
        )}

        <Text
          style={[
            styles.price,
            item.trang_thai !== 'confirmed' && styles.unconfirmedText,
          ]}>
          Tổng tiền: {Number(item.tong_tien).toLocaleString()}đ
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../assets/empty-booking.png')}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyText}>Bạn chưa có đặt phòng nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách đặt phòng</Text>

      <FlatList
        data={bookings}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <BookingItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchBookings}
      />

      {bookings.some(b => b.trang_thai === 'confirmed') && (
        <TouchableOpacity
          style={[
            styles.paymentButton,
            selectedBookings.length > 0
              ? styles.paymentButtonActive
              : styles.paymentButtonInactive,
          ]}
          onPress={handlePayment}
          disabled={selectedBookings.length === 0}>
          <Text style={styles.paymentButtonText}>
            Thanh toán ({selectedBookings.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#f8f9fa',
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  unconfirmedCard: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  checkbox: {
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#007bff',
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    color: '#6c757d',
    marginVertical: 4,
  },
  status: {
    fontSize: 15,
    marginVertical: 6,
    fontWeight: '500',
  },
  statusConfirmed: {
    color: '#28a745',
  },
  statusPending: {
    color: '#ffc107',
  },
  statusCancelled: {
    color: '#dc3545',
  },
  canPayText: {
    color: '#28a745',
    fontSize: 14,
    marginBottom: 4,
  },
  expiredText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#e67e22',
  },
  paymentButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  paymentButtonActive: {
    backgroundColor: '#28a745',
  },
  paymentButtonInactive: {
    backgroundColor: '#cccccc',
  },
  paymentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  unconfirmedText: {
    color: '#888',
  },
  deleteImage: {
    width: 24,
    height: 24,
    tintColor: '#dc3545',
  },
});

export default ListBooking;
