// PaymentScreen.js
import React, {useState, useEffect, useCallback} from 'react'; // useCallback đã được thêm
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import url from '../../ipconfig';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const params = route.params || {};
  const {
    userId, // Sẽ được log và kiểm tra
    selectedBookings = [],
    totalAmount: initialTotalAmount = 0,
    userName, // Sẽ được log và kiểm tra
    // paymentOutcome, // Các params này được xử lý bởi VnpayWebView
    // orderId: returnedOrderId,
    // vnpayResponseCode,
  } = params;

  // DEBUG LOG: Kiểm tra params PaymentScreen nhận được khi nó được tải/focus
  useEffect(() => {
    console.log('--- [PaymentScreen] ---');
    console.log(
      'Received route.params -> userId:',
      userId,
      '| userName:',
      userName,
    );
    if (!userId) {
      console.error(
        '[PaymentScreen] LỖI KHỞI TẠO: `userId` là undefined hoặc null khi PaymentScreen tải. Vui lòng kiểm tra màn hình điều hướng đến PaymentScreen (ví dụ: ListBooking).',
      );
      // Cân nhắc hiển thị Alert và điều hướng về nếu userId là bắt buộc ngay từ đầu
      // Alert.alert('Lỗi nghiêm trọng', 'Không có thông tin người dùng để thanh toán.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  }, [userId, userName]); // Theo dõi sự thay đổi của userId và userName từ params

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [finalTotalAmount, setFinalTotalAmount] = useState(initialTotalAmount);
  const [voucherListExpanded, setVoucherListExpanded] = useState(false);
  const VOUCHERS_DISPLAY_LIMIT = 2;

  useEffect(() => {
    setFinalTotalAmount(initialTotalAmount);
    setSelectedVoucher(null);
    setAppliedDiscount(0);
  }, [initialTotalAmount]);

  const fetchUserVouchersInternal = useCallback(
    async hotelIdToFetchWith => {
      if (!userId) {
        console.warn(
          '[PaymentScreen] fetchUserVouchers: userId không có, bỏ qua tải voucher.',
        );
        setIsLoadingVouchers(false);
        setAvailableVouchers([]);
        return;
      }
      setIsLoadingVouchers(true);
      try {
        const response = await fetch(
          `${url}/API_DATN/API_User/apply_voucher/get_user_vouchers.php`,
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId: userId, hotelId: hotelIdToFetchWith}),
          },
        );
        const result = await response.json();
        if (result.status === 'success') {
          setAvailableVouchers(result.data || []);
        } else {
          console.log('[PaymentScreen] Lỗi khi tải voucher:', result.message);
          setAvailableVouchers([]);
        }
      } catch (error) {
        console.error('[PaymentScreen] Lỗi kết nối khi tải voucher:', error);
        setAvailableVouchers([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    },
    [userId, url],
  ); // Thêm url vào dependency array của useCallback

  useEffect(() => {
    if (userId && selectedBookings.length > 0 && initialTotalAmount >= 0) {
      const firstBooking = selectedBookings[0];
      const hotelIdForFetching = firstBooking?.khach_san_id;
      if (hotelIdForFetching) {
        fetchUserVouchersInternal(hotelIdForFetching);
      } else {
        console.warn(
          "[PaymentScreen] Booking đầu tiên không có 'khach_san_id'.",
        );
        setAvailableVouchers([]);
      }
    } else {
      setAvailableVouchers([]);
    }
  }, [userId, selectedBookings, initialTotalAmount, fetchUserVouchersInternal]);

  // useEffect xử lý paymentOutcome (đã được khuyên bỏ đi nếu VnpayWebView xử lý)
  // Nếu bạn vẫn muốn giữ lại để debug hoặc cho mục đích khác, hãy đảm bảo nó không xung đột.
  const paymentOutcomeFromParams = params.paymentOutcome; // Lấy riêng để tránh warning dependency
  const returnedOrderIdFromParams = params.orderId;
  const vnpayResponseCodeFromParams = params.vnpayResponseCode;

  useEffect(() => {
    if (paymentOutcomeFromParams) {
      console.log(
        `[PaymentScreen] (useEffect cũ) Nhận kết quả paymentOutcome = ${paymentOutcomeFromParams}, orderId = ${returnedOrderIdFromParams}, responseCode = ${vnpayResponseCodeFromParams}`,
      );
      // Xử lý Alert tại đây nếu VnpayWebView điều hướng ngược lại PaymentScreen với các params này
      // Tuy nhiên, luồng khuyến nghị là VnpayWebView xử lý và điều hướng thẳng tới HomeScreen/PaymentResult
      navigation.setParams({
        // Xóa params để tránh trigger lại
        paymentOutcome: undefined,
        orderId: undefined,
        vnpayResponseCode: undefined,
      });
    }
  }, [
    paymentOutcomeFromParams,
    returnedOrderIdFromParams,
    vnpayResponseCodeFromParams,
    navigation,
  ]);

  const getHotelIdForVoucherApplication = useCallback(() => {
    if (!selectedBookings || selectedBookings.length === 0) return null;
    const hotelIds = new Set(
      selectedBookings.map(b => b.khach_san_id).filter(id => id != null),
    );
    return hotelIds.size === 1 ? hotelIds.values().next().value : null;
  }, [selectedBookings]);

  const handleApplyNewVoucher = useCallback(
    async voucherToApply => {
      if (!userId || !voucherToApply || !voucherToApply.id) {
        Alert.alert('Lỗi', 'Thông tin voucher hoặc người dùng không hợp lệ.');
        return;
      }
      const hotelIdParam = getHotelIdForVoucherApplication();
      setLoadingPayment(true);
      try {
        const response = await fetch(/* ... */); // giữ nguyên fetch của bạn
        // ... xử lý result ...
      } catch (error) {
        /* ... */
      } finally {
        setLoadingPayment(false);
      }
    },
    [userId, initialTotalAmount, getHotelIdForVoucherApplication, url],
  );

  const handleRemoveVoucher = useCallback(() => {
    setSelectedVoucher(null);
    setAppliedDiscount(0);
    setFinalTotalAmount(initialTotalAmount);
  }, [initialTotalAmount]);

  const handleVoucherItemPress = useCallback(
    voucherItem => {
      if (loadingPayment) return;
      if (selectedVoucher && selectedVoucher.id === voucherItem.id) {
        handleRemoveVoucher();
      } else {
        handleApplyNewVoucher(voucherItem);
      }
    },
    [
      loadingPayment,
      selectedVoucher,
      handleRemoveVoucher,
      handleApplyNewVoucher,
    ],
  );

  const handleGoBackToListBooking = () => {
    navigation.goBack();
  };

  // Hàm này (handleGoToHomeAfterPayment) có thể không còn được gọi nếu useEffect trên bị loại bỏ
  const handleGoToHomeAfterPayment = () => {
    console.log(
      '[PaymentScreen] handleGoToHomeAfterPayment called. Navigating to HomeScreen with userId:',
      userId,
      'userName:',
      userName,
    );
    navigation.navigate('HomeScreen', {userId, userName});
  };

  const handleConfirmPayment = async () => {
    if (loadingPayment) return;

    console.log('--- [PaymentScreen] ---');
    console.log(
      'handleConfirmPayment: Bắt đầu xử lý. Kiểm tra giá trị truyền đi:',
    );
    console.log('userId:', userId);
    console.log('userName:', userName);
    console.log('finalTotalAmount:', finalTotalAmount);

    if (!userId) {
      Alert.alert(
        'Lỗi Thiếu Thông Tin',
        'Không thể tiến hành thanh toán do thiếu ID người dùng. Vui lòng thử lại.',
      );
      return;
    }
    // userName có thể không bắt buộc cho API backend nhưng quan trọng cho HomeScreen
    if (userName === undefined) {
      // Phân biệt với userName là null hoặc chuỗi rỗng
      console.warn(
        '[PaymentScreen] handleConfirmPayment: userName hiện tại là undefined.',
      );
    }

    setLoadingPayment(true);
    const apiBookings = selectedBookings.map(booking => ({
      id: booking.id,
      price: booking.tong_tien,
    }));

    try {
      const response = await fetch(
        `${url}API_DATN/API_User/Payment/create_payment_vnpay.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userId: userId,
            totalAmount: finalTotalAmount,
            bookings: apiBookings,
          }),
        },
      );
      const resultText = await response.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (e) {
        console.error(
          '[PaymentScreen] Lỗi parse JSON từ create_payment_vnpay:',
          resultText,
          e,
        );
        Alert.alert('Lỗi tạo thanh toán', 'Phản hồi từ máy chủ không hợp lệ.');
        setLoadingPayment(false);
        return;
      }

      if (result.status === 'success' && result.payment_url) {
        console.log('[PaymentScreen] API create_payment_vnpay thành công.');
        // === LOG QUAN TRỌNG ĐỂ KIỂM TRA DỮ LIỆU GỬI ĐI ===
        const paramsToVnpayWebView = {
          paymentUrl: result.payment_url,
          orderId: result.order_id,
          userId: userId, // << Đảm bảo userId này có giá trị
          userName: userName, // << Đảm bảo userName này có giá trị
        };
        console.log(
          '[PaymentScreen] Chuẩn bị điều hướng đến VnpayWebView với params:',
          JSON.stringify(paramsToVnpayWebView, null, 2),
        );
        navigation.navigate('VnpayWebView', paramsToVnpayWebView);
      } else {
        Alert.alert(
          'Lỗi tạo thanh toán',
          result.message || 'Không thể tạo yêu cầu thanh toán VNPay từ server.',
        );
      }
    } catch (error) {
      console.error(
        '[PaymentScreen] Lỗi khi gọi API tạo thanh toán VNPay:',
        error,
      );
      Alert.alert(
        'Lỗi Hệ Thống',
        'Không thể kết nối đến máy chủ thanh toán: ' + error.message,
      );
    } finally {
      setLoadingPayment(false);
    }
  };

  // Render guard: Kiểm tra dữ liệu đầu vào cơ bản
  if (
    !userId ||
    !selectedBookings ||
    selectedBookings.length === 0 ||
    !(initialTotalAmount >= 0)
  ) {
    // Màn hình này sẽ hiển thị nếu userId là falsy (undefined, null, 0, '', false)
    // useEffect ban đầu đã có console.error nếu userId ban đầu là undefined/null
    console.warn(
      '[PaymentScreen] Render guard: Điều kiện không thỏa mãn, hiển thị lỗi dữ liệu. userId:',
      userId,
    );
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBackToListBooking}>
            <Image
              source={require('../assets/back.png')}
              style={styles.backButton}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Lỗi Dữ Liệu</Text>
        </View>
        <View style={styles.centeredMessage}>
          <Text style={styles.centeredMessageText}>
            Thông tin đặt phòng hoặc người dùng không hợp lệ để thanh toán. Vui
            lòng quay lại và thử lại.
          </Text>
        </View>
      </View>
    );
  }

  const vouchersToDisplay = voucherListExpanded
    ? availableVouchers
    : availableVouchers.slice(0, VOUCHERS_DISPLAY_LIMIT);

  const renderVoucherItem = (item, index) => {
    const isSelected = selectedVoucher && selectedVoucher.id === item.id;
    const displayVoucher =
      isSelected && selectedVoucher.originalVoucherData
        ? selectedVoucher.originalVoucherData
        : item;
    return (
      <TouchableOpacity
        key={item.id.toString()}
        style={[
          styles.voucherItemContainer,
          isSelected && styles.voucherItemSelected,
        ]}
        onPress={() => handleVoucherItemPress(item)}
        disabled={loadingPayment || isLoadingVouchers}>
        <View style={styles.voucherInfo}>
          <Text
            style={[
              styles.voucherCode,
              isSelected && styles.voucherCodeSelected,
            ]}>
            {displayVoucher.ma_voucher}
          </Text>
          <Text style={styles.voucherDesc}>
            Giảm:{' '}
            {displayVoucher.loai_giam === 'phan_tram'
              ? `${displayVoucher.gia_tri_giam}%`
              : `${Number(displayVoucher.gia_tri_giam).toLocaleString()}đ`}
            {displayVoucher.dieu_kien_don_hang_toi_thieu > 0 &&
              ` (Đơn tối thiểu: ${Number(
                displayVoucher.dieu_kien_don_hang_toi_thieu,
              ).toLocaleString()}đ)`}
          </Text>
          <Text style={styles.voucherExpiry}>
            HSD:{' '}
            {new Date(displayVoucher.ngay_ket_thuc).toLocaleDateString('vi-VN')}
          </Text>
          {displayVoucher.khachsan_id && (
            <Text style={styles.voucherCondition}>
              Áp dụng cho khách sạn cụ thể
            </Text>
          )}
        </View>
        <View style={styles.voucherTickArea}>
          <View
            style={[
              styles.tickCircle,
              isSelected && styles.tickCircleSelected,
            ]}>
            {isSelected && <Text style={styles.tickMark}>✓</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBackToListBooking}>
          <Image
            source={require('../assets/back.png')}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Xác Nhận Thanh Toán</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentScroll}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Chi tiết đơn hàng:</Text>
          {selectedBookings.map(booking => {
            const roomNameToDisplay =
              booking.ten_phong_chinh || 'Chưa có thông tin phòng';
            const totalRoomQuantity =
              booking.chi_tiet_cac_phong?.reduce(
                (sum, roomDetail) =>
                  sum + (parseInt(roomDetail.so_luong_phong, 10) || 0),
                0,
              ) || 0;
            const servicesDisplay =
              booking.chi_tiet_cac_dich_vu
                ?.map(
                  service =>
                    `${service.ten_dich_vu}${
                      parseInt(service.so_luong, 10) > 1
                        ? ` (x${service.so_luong})`
                        : ''
                    }`,
                )
                .join(', ') || '';
            return (
              <View key={booking.id.toString()} style={styles.bookingItem}>
                <Text style={styles.hotelName}>
                  {booking.ten_khach_san || 'N/A'}
                </Text>
                <Text style={styles.roomName}>Phòng: {roomNameToDisplay}</Text>
                {totalRoomQuantity > 0 && (
                  <Text style={styles.detailText}>
                    Số lượng phòng: {totalRoomQuantity}
                  </Text>
                )}
                <Text style={styles.dates}>
                  Ngày: {booking.ngay_nhan_phong} - {booking.ngay_tra_phong}
                </Text>
                {servicesDisplay && servicesDisplay !== '' && (
                  <View style={styles.serviceContainer}>
                    <Text style={styles.detailHeaderText}>
                      Dịch vụ kèm theo:
                    </Text>
                    <Text style={styles.detailText}>{servicesDisplay}</Text>
                  </View>
                )}
                <Text style={styles.itemPrice}>
                  Giá: {Number(booking.tong_tien || 0).toLocaleString()}đ
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.voucherSection}>
          <Text style={styles.voucherSectionTitle}>Chọn voucher của bạn</Text>
          {isLoadingVouchers ? (
            <ActivityIndicator
              size="small"
              color="#007bff"
              style={{marginVertical: 10}}
            />
          ) : availableVouchers.length > 0 ? (
            <>
              {vouchersToDisplay.map((voucher, index) =>
                renderVoucherItem(voucher, index),
              )}
              {availableVouchers.length > VOUCHERS_DISPLAY_LIMIT && (
                <TouchableOpacity
                  onPress={() => setVoucherListExpanded(!voucherListExpanded)}
                  style={styles.toggleVoucherListButton}>
                  <Text style={styles.toggleVoucherListText}>
                    {voucherListExpanded
                      ? 'Thu gọn'
                      : `Xem thêm ${
                          availableVouchers.length - VOUCHERS_DISPLAY_LIMIT
                        } voucher`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.noVouchersText}>
              Bạn không có voucher nào khả dụng (cho khách sạn này hoặc chung).
            </Text>
          )}
        </View>

        <View style={styles.totalContainer}>
          {appliedDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Tạm tính:</Text>
              <Text style={styles.totalAmountOriginal}>
                {Number(initialTotalAmount || 0).toLocaleString()}đ
              </Text>
            </View>
          )}
          {appliedDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalTextDiscount}>
                Giảm giá{selectedVoucher ? ` (${selectedVoucher.name})` : ''}:
              </Text>
              <Text style={styles.totalAmountDiscount}>
                -{Number(appliedDiscount || 0).toLocaleString()}đ
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={[styles.totalText, styles.finalTotalText]}>
              Tổng cộng:
            </Text>
            <Text style={[styles.totalAmount, styles.finalTotalAmountValue]}>
              {Number(finalTotalAmount || 0).toLocaleString()}đ
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (loadingPayment || finalTotalAmount < 0) &&
              styles.payButtonDisabled,
          ]}
          onPress={handleConfirmPayment}
          disabled={loadingPayment || finalTotalAmount < 0}>
          {loadingPayment ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.payButtonText}>Tiến hành thanh toán VNPay</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... (styles của bạn giữ nguyên) ...
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f4f6f8'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {width: 24, height: 24, marginRight: 16, tintColor: '#007bff'},
  title: {fontSize: 20, fontWeight: '600', color: '#333'},
  contentScroll: {paddingBottom: Platform.OS === 'ios' ? 120 + 30 : 120},
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  bookingItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hotelName: {fontSize: 16, fontWeight: '600', color: '#0056b3'},
  roomName: {fontSize: 14, color: '#4A4A4A', marginTop: 4, fontStyle: 'italic'},
  dates: {fontSize: 13, color: '#666', marginTop: 2},
  itemPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
    marginTop: 8,
    textAlign: 'right',
  },
  detailText: {fontSize: 13, color: '#555', marginTop: 3},
  detailHeaderText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 5,
  },
  serviceContainer: {marginTop: 4, marginBottom: 2},
  voucherSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  voucherSectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noVouchersText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#666',
    marginVertical: 15,
  },
  voucherItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  voucherItemSelected: {borderColor: '#007bff', backgroundColor: '#e7f3ff'},
  voucherInfo: {flex: 1, marginRight: 8},
  voucherCode: {fontSize: 15, fontWeight: 'bold', color: '#007bff'},
  voucherCodeSelected: {color: '#0056b3'},
  voucherDesc: {fontSize: 13, color: '#444', marginTop: 3},
  voucherExpiry: {fontSize: 11, color: '#777', marginTop: 2},
  voucherCondition: {
    fontSize: 11,
    color: 'orangered',
    marginTop: 2,
    fontStyle: 'italic',
  },
  voucherTickArea: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#adb5bd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickCircleSelected: {borderColor: '#007bff', backgroundColor: '#007bff'},
  tickMark: {color: '#fff', fontSize: 12, fontWeight: 'bold'},
  toggleVoucherListButton: {paddingVertical: 10, alignItems: 'center'},
  toggleVoucherListText: {color: '#007bff', fontSize: 14, fontWeight: '500'},
  totalContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalText: {fontSize: 16, fontWeight: '500', color: '#555'},
  totalAmountOriginal: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    textDecorationLine: 'line-through',
  },
  totalTextDiscount: {fontSize: 16, fontWeight: '500', color: '#e74c3c'},
  totalAmountDiscount: {fontSize: 16, fontWeight: '500', color: '#e74c3c'},
  finalTotalText: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  totalAmount: {fontSize: 18, fontWeight: 'bold', color: '#28a745'},
  finalTotalAmountValue: {fontSize: 20, fontWeight: 'bold', color: '#28a745'},
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  payButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {backgroundColor: '#a0cfff', opacity: 0.8},
  payButtonText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centeredMessageText: {fontSize: 16, color: '#555', textAlign: 'center'},
});
export default PaymentScreen;
