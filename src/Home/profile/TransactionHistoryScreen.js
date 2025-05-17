import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import url from '../../../ipconfig'; // Đường dẫn đến file ipconfig của bạn

// Helper function to format currency (Vietnamese Dong)
const formatCurrency = amount => {
  if (amount === null || amount === undefined) return 'N/A';
  return parseFloat(amount).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};

// Helper function to format date
const formatDate = dateString => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    //toLocaleDateString might not be fully supported or consistent on older RN versions for all locales.
    //Consider using a library like date-fns if more complex formatting is needed.
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString; // return original if parsing fails
  }
};

const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params; // Giả sử userId được truyền qua params

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Lịch sử giao dịch',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Image
            source={require('../../assets/back.png')} // Đảm bảo đường dẫn đúng
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchTransactionHistory = useCallback(async () => {
    if (!userId) {
      setError('Không tìm thấy thông tin người dùng.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Thay thế bằng đường dẫn API của bạn
      const response = await fetch(
        `${url}API_DATN/API_User/history/get_transaction_history.php?userId=${userId}`,
      );
      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setTransactions(result.data || []);
      } else {
        setError(result.message || 'Không thể tải lịch sử giao dịch.');
        setTransactions([]);
      }
    } catch (e) {
      console.error('Fetch transaction history error: ', e);
      setError('Lỗi kết nối máy chủ khi tải lịch sử. Vui lòng thử lại.');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactionHistory();
  }, [fetchTransactionHistory]);

  const renderBookingDetailItem = ({item}) => (
    <View style={styles.bookingDetailItem}>
      <Text style={styles.hotelNameText}>
        {item.ten_khach_san || 'Thông tin khách sạn không có'}
      </Text>
      <Text style={styles.detailText}>
        Ngày nhận phòng: {formatDate(item.ngay_nhan_phong)}
      </Text>
      <Text style={styles.detailText}>
        Ngày trả phòng: {formatDate(item.ngay_tra_phong)}
      </Text>
      <Text style={styles.detailText}>
        Số tiền: {formatCurrency(item.so_tien_trong_thanh_toan_nay)}
      </Text>
    </View>
  );

  const renderTransactionItem = ({item}) => (
    <View style={styles.transactionItemContainer}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionDate}>
          Ngày tạo: {formatDate(item.ngay_tao_thanh_toan)}
        </Text>
        <Text
          style={[
            styles.statusText,
            styles[`status_${item.trang_thai_thanh_toan?.toLowerCase()}`],
          ]}>
          {item.trang_thai_thanh_toan === 'completed'
            ? 'Hoàn thành'
            : item.trang_thai_thanh_toan === 'pending'
            ? 'Chờ xử lý'
            : item.trang_thai_thanh_toan === 'failed'
            ? 'Thất bại'
            : item.trang_thai_thanh_toan || 'N/A'}
        </Text>
      </View>

      <Text style={styles.infoText}>
        Tổng tiền:{' '}
        <Text style={styles.amountText}>
          {formatCurrency(item.tong_tien_thanh_toan)}
        </Text>
      </Text>
      {parseFloat(item.tien_giam_voucher) > 0 && (
        <Text style={styles.infoText}>
          Giảm giá voucher: {formatCurrency(item.tien_giam_voucher)}
        </Text>
      )}
      <Text style={styles.infoText}>Hình thức: {item.hinh_thuc || 'N/A'}</Text>
      {item.ngay_thanh_toan && (
        <Text style={styles.infoText}>
          Ngày thanh toán: {formatDate(item.ngay_thanh_toan)}
        </Text>
      )}
      {item.vnp_txn_ref && (
        <Text style={styles.infoText}>
          Mã giao dịch VNPay: {item.vnp_txn_ref}
        </Text>
      )}

      {item.chi_tiet_bookings && item.chi_tiet_bookings.length > 0 && (
        <View style={styles.bookingDetailsContainer}>
          <Text style={styles.detailsTitle}>Chi tiết đặt phòng:</Text>
          <FlatList
            data={item.chi_tiet_bookings}
            renderItem={renderBookingDetailItem}
            keyExtractor={detail => detail.dat_phong_id.toString()}
            // scrollEnabled={false} // If inside another scrollview, but here it's fine
          />
        </View>
      )}
      {item.chi_tiet_bookings_error && (
        <Text style={styles.errorTextSmall}>
          Lỗi tải chi tiết: {item.chi_tiet_bookings_error}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Đang tải lịch sử giao dịch...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={fetchTransactionHistory}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Không có lịch sử giao dịch nào.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.thanh_toan_id.toString()}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  headerButton: {
    marginLeft: 10,
    padding: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  errorTextSmall: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  listContentContainer: {
    padding: 16,
  },
  transactionItemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#555',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden', // for borderRadius to work on Text on Android
  },
  status_completed: {
    color: '#28a745', // Green
    backgroundColor: '#e9f7ef',
  },
  status_pending: {
    color: '#ffc107', // Yellow
    backgroundColor: '#fff8e1',
  },
  status_failed: {
    color: '#dc3545', // Red
    backgroundColor: '#fbebed',
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  amountText: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 10,
    marginBottom: 5,
  },
  bookingDetailsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  bookingDetailItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  hotelNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  detailText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8, // Indent details slightly
  },
});

export default TransactionHistoryScreen;
