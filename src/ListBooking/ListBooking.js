// ListBooking.js
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox'; // Đảm bảo đã cài đặt thư viện này
import url from '../../ipconfig'; // Đường dẫn cấu hình IP của bạn

const POLLING_INTERVAL = 30000; // 30 giây cho việc làm mới tự động

const ListBooking = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const params = route.params || {};
  const {userId, userName: initialUserName} = params; // Lấy userId và userName từ params

  const [bookings, setBookings] = useState([]); // Danh sách các đặt phòng
  const [loading, setLoading] = useState(true); // Trạng thái tải lần đầu
  const [isPollingLoading, setIsPollingLoading] = useState(false); // Trạng thái tải khi polling
  const [selectedBookingsForPayment, setSelectedBookingsForPayment] = useState(
    [],
  ); // ID các booking được chọn để thanh toán
  const [countdowns, setCountdowns] = useState({}); // Thời gian đếm ngược cho mỗi booking

  const pollingRef = useRef(null); // Ref cho interval polling
  const countdownIntervalRef = useRef(null); // Ref cho interval đếm ngược

  // Hàm tính thời gian còn lại để thanh toán (24h kể từ ngay_cap_nhat)
  const calculateTimeLeft = useCallback(updatedAt => {
    if (!updatedAt)
      return {expired: true, hours: '00', minutes: '00', seconds: '00'};
    const now = new Date();
    const updatedTime = new Date(updatedAt);
    const deadline = new Date(updatedTime.getTime() + 24 * 60 * 60 * 1000); // 24 giờ sau khi cập nhật
    const diffInMs = deadline - now;

    if (diffInMs <= 0) {
      return {expired: true, hours: '00', minutes: '00', seconds: '00'};
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
  }, []);

  // Hàm tải danh sách đặt phòng từ API
  const fetchBookings = useCallback(
    async (isManualRefresh = false) => {
      if (!userId) {
        Alert.alert(
          'Lỗi',
          'Không có thông tin người dùng để tải danh sách đặt phòng.',
        );
        setLoading(false);
        // Cân nhắc điều hướng về màn hình chính hoặc login nếu không có userId
        navigation.navigate('HomeScreen', {
          userId: undefined, // Xóa userId nếu không hợp lệ
          userName: undefined,
        });
        return;
      }

      if (isManualRefresh)
        setLoading(
          true,
        ); // Chỉ hiển thị loading toàn màn hình khi làm mới thủ công
      else setIsPollingLoading(true); // Loading nhỏ hơn khi polling

      try {
        const response = await fetch(
          `${url}API_DATN/API_User/List_booking/get_booking.php?nguoi_dung_id=${userId}`,
        );
        const json = await response.json();
        if (json.status === 'success') {
          const fetchedBookings = json.data || [];
          const newCountdowns = {}; // Đếm ngược mới cho các booking có thể thanh toán

          // Xử lý dữ liệu booking, tính toán isPaid, canPay, timeLeft
          // Quan trọng: Nếu API get_booking.php đã được sửa để trả về 'khach_san_id',
          // thì mỗi 'booking' trong 'fetchedBookings' sẽ tự động có 'khach_san_id'.
          const updatedBookings = fetchedBookings.map(booking => {
            const isConfirmed = booking.trang_thai === 'confirmed';
            const isPaid = booking.trang_thai_thanh_toan === 'paid';
            let timeLeftInfo = null; // Đổi tên biến để rõ ràng hơn
            let canCurrentlyPay = false; // Đổi tên biến

            if (isConfirmed && !isPaid && booking.ngay_cap_nhat) {
              timeLeftInfo = calculateTimeLeft(booking.ngay_cap_nhat);
              canCurrentlyPay = !timeLeftInfo.expired;
              if (canCurrentlyPay && timeLeftInfo)
                newCountdowns[booking.id] = timeLeftInfo;
            }
            return {
              ...booking,
              isPaid,
              canPay: canCurrentlyPay,
              timeLeft: timeLeftInfo,
            };
          });

          setBookings(updatedBookings);
          setCountdowns(newCountdowns);
          // Reset lựa chọn khi tải lại danh sách (tuỳ theo yêu cầu UX)
          // setSelectedBookingsForPayment([]);
        } else {
          Alert.alert(
            'Lỗi tải dữ liệu',
            json.message || 'Không thể tải danh sách đặt phòng.',
          );
          setBookings([]); // Đặt lại danh sách nếu lỗi
        }
      } catch (error) {
        console.error('Lỗi API fetchBookings:', error);
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.',
        );
        setBookings([]); // Đặt lại danh sách nếu lỗi
      } finally {
        if (isManualRefresh) setLoading(false);
        setIsPollingLoading(false);
      }
    },
    [userId, calculateTimeLeft, navigation, url], // Thêm url vào dependencies nếu nó có thể thay đổi (ít khả năng)
  );

  // useEffect cho việc cập nhật đếm ngược mỗi giây
  useEffect(() => {
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      let shouldRefreshBookingsState = false; // Cờ để kiểm tra có cần cập nhật trạng thái canPay của booking không

      setCountdowns(prevCountdowns => {
        const updatedCds = {...prevCountdowns}; // Tạo bản sao để tránh mutate trực tiếp
        bookings.forEach(booking => {
          // Chỉ cập nhật countdown cho các booking đang chờ thanh toán và còn hạn
          if (
            booking.canPay && // Phải đang có thể thanh toán
            booking.timeLeft && // Phải có thông tin timeLeft
            !booking.timeLeft.expired && // Chưa hết hạn theo timeLeft trước đó
            booking.ngay_cap_nhat // Phải có ngay_cap_nhat để tính
          ) {
            const newTimeLeft = calculateTimeLeft(booking.ngay_cap_nhat);
            updatedCds[booking.id] = newTimeLeft;
            if (newTimeLeft.expired) {
              shouldRefreshBookingsState = true; // Nếu có booking hết hạn, cần cập nhật lại trạng thái canPay
            }
          } else if (booking.timeLeft?.expired) {
            // Nếu đã hết hạn thì giữ nguyên thông tin hết hạn
            updatedCds[booking.id] = booking.timeLeft;
          }
        });
        return updatedCds;
      });

      // Nếu có booking nào đó vừa hết hạn, cập nhật lại trạng thái `canPay` của nó trong `bookings`
      if (shouldRefreshBookingsState) {
        setBookings(prevBookings =>
          prevBookings.map(b => {
            if (b.id in countdowns && countdowns[b.id]?.expired && b.canPay) {
              // Nếu booking này có trong countdowns, đã hết hạn và trước đó canPay=true
              return {...b, canPay: false}; // Cập nhật canPay = false
            }
            return b;
          }),
        );
      }
    }, 1000); // Cập nhật mỗi giây

    return () => {
      // Cleanup khi component unmount
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [bookings, calculateTimeLeft, countdowns]); // Phụ thuộc vào bookings và calculateTimeLeft

  // useFocusEffect để tải dữ liệu khi màn hình được focus và thiết lập polling
  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        Alert.alert('Thiếu thông tin', 'Không tìm thấy thông tin người dùng.', [
          {text: 'Về Trang Chủ', onPress: () => handleGoBackToHome()}, // Sửa: thêm handleGoBackToHome
        ]);
        setLoading(false);
        return;
      }

      fetchBookings(true); // Tải lần đầu khi focus, coi như manual refresh

      const startPolling = () => {
        if (pollingRef.current) clearInterval(pollingRef.current); // Xóa interval cũ nếu có
        pollingRef.current = setInterval(
          () => fetchBookings(false), // Polling không hiển thị loading toàn màn hình
          POLLING_INTERVAL,
        );
      };
      startPolling();

      return () => {
        // Cleanup khi màn hình mất focus
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownIntervalRef.current)
          clearInterval(countdownIntervalRef.current); // Cũng nên clear countdown interval
      };
    }, [userId, fetchBookings]), // fetchBookings đã được bọc trong useCallback
  );

  const handleGoBackToHome = () => {
    // Hàm điều hướng về HomeScreen
    navigation.navigate('HomeScreen', {
      userId: userId, // Truyền lại userId và userName nếu cần
      userName: initialUserName,
    });
  };

  // Hàm render trạng thái của đơn đặt phòng
  const renderStatus = (status, paymentStatus, canPay) => {
    if (paymentStatus === 'paid') return 'Đã thanh toán';
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return canPay ? 'Chờ thanh toán' : 'Quá hạn thanh toán'; // Dựa vào canPay để hiển thị chính xác
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  };

  // Hàm xử lý việc chọn/bỏ chọn một booking để thanh toán
  const toggleBookingSelection = useCallback(
    bookingId => {
      const booking = bookings.find(b => b.id === bookingId);
      // Chỉ cho phép chọn nếu booking đã 'confirmed', chưa 'paid', và còn 'canPay'
      if (
        booking &&
        booking.trang_thai === 'confirmed' &&
        !booking.isPaid &&
        booking.canPay // Kiểm tra lại booking.canPay
      ) {
        setSelectedBookingsForPayment(
          prev =>
            prev.includes(bookingId)
              ? prev.filter(id => id !== bookingId) // Bỏ chọn
              : [...prev, bookingId], // Chọn
        );
      } else if (booking) {
        // Thông báo nếu không thể chọn
        let reason = 'Đặt phòng này không thể chọn để thanh toán.';
        if (booking.isPaid) reason = 'Đặt phòng đã được thanh toán.';
        else if (booking.trang_thai !== 'confirmed')
          reason = 'Đặt phòng chưa được xác nhận.';
        else if (!booking.canPay) reason = 'Đặt phòng đã quá hạn thanh toán.';
        Alert.alert('Thông báo', reason);
      }
    },
    [bookings], // Phụ thuộc vào danh sách bookings
  );

  // Hàm xử lý khi nhấn nút "Tiến hành thanh toán"
  const handleProceedToPayment = useCallback(() => {
    if (selectedBookingsForPayment.length === 0) {
      Alert.alert(
        'Thông báo',
        'Vui lòng chọn ít nhất một đặt phòng để thanh toán.',
      );
      return;
    }

    // Lấy chi tiết các booking đã chọn
    const selectedBookingDetails = bookings.filter(b =>
      selectedBookingsForPayment.includes(b.id),
    );

    // Kiểm tra lại xem tất cả các booking đã chọn có còn thanh toán được không
    const allStillPayable = selectedBookingDetails.every(b => b.canPay);
    if (!allStillPayable) {
      Alert.alert(
        'Lỗi',
        'Một hoặc nhiều đặt phòng đã chọn đã hết hạn thanh toán. Danh sách sẽ được làm mới.',
      );
      fetchBookings(true); // Làm mới danh sách
      setSelectedBookingsForPayment([]); // Reset lựa chọn
      return;
    }

    // Tính tổng số tiền cần thanh toán
    const totalAmount = selectedBookingDetails.reduce(
      (sum, b) => sum + parseFloat(b.tong_tien || 0),
      0,
    );

    // Điều hướng đến PaymentScreen, truyền theo các thông tin cần thiết
    // selectedBookingDetails ở đây sẽ chứa khach_san_id nếu API get_booking.php đã được sửa
    navigation.navigate('PaymentScreen', {
      userId,
      selectedBookings: selectedBookingDetails,
      totalAmount,
      userName: initialUserName,
    });
  }, [
    selectedBookingsForPayment,
    bookings,
    userId,
    navigation,
    fetchBookings, // fetchBookings cần thiết nếu có logic làm mới
    initialUserName,
  ]);

  // Hàm xử lý xóa đặt phòng
  const handleDelete = useCallback(
    bookingId => {
      const bookingToDelete = bookings.find(b => b.id === bookingId);
      if (!bookingToDelete) return;

      // Điều kiện cho phép xóa (ví dụ: pending, cancelled, hoặc confirmed nhưng đã quá hạn và chưa thanh toán)
      const canDelete =
        bookingToDelete.trang_thai === 'pending' ||
        bookingToDelete.trang_thai === 'cancelled' ||
        (bookingToDelete.trang_thai === 'confirmed' &&
          !bookingToDelete.isPaid &&
          !bookingToDelete.canPay); // Đã quá hạn

      if (!canDelete) {
        Alert.alert(
          'Thông báo',
          'Không thể xóa đặt phòng đã xác nhận và còn hạn thanh toán, hoặc đã được thanh toán.',
        );
        return;
      }

      Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa đặt phòng này?', [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${url}API_DATN/API_User/List_booking/delete_booking.php`,
                {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({booking_ids: [bookingId]}), // API có thể yêu cầu booking_id
                },
              );
              const result = await response.json();
              if (result.status === 'success') {
                Alert.alert('Thành công', 'Xóa đặt phòng thành công.');
                // Cập nhật lại UI
                setBookings(prev => prev.filter(item => item.id !== bookingId));
                setSelectedBookingsForPayment(prev =>
                  prev.filter(id => id !== bookingId),
                );
              } else {
                Alert.alert('Lỗi', result.message || 'Xóa không thành công.');
              }
            } catch (error) {
              console.error('Lỗi khi xóa đặt phòng:', error);
              Alert.alert('Lỗi', 'Đã xảy ra lỗi khi kết nối máy chủ để xóa.');
            }
          },
        },
      ]);
    },
    [bookings, url], // Phụ thuộc vào bookings và url
  );

  // Component con để render một mục đặt phòng
  const BookingItem = React.memo(
    ({item, onSelect, isSelected, currentCountdown}) => {
      const isSelectable =
        item.trang_thai === 'confirmed' && !item.isPaid && item.canPay;
      const statusText = renderStatus(
        item.trang_thai,
        item.trang_thai_thanh_toan,
        item.canPay,
      );

      let cardStyle = [styles.card];
      let textStyle = []; // Style cho text bị làm mờ
      if (item.isPaid) cardStyle.push(styles.paidCard);
      else if (item.trang_thai === 'cancelled')
        cardStyle.push(styles.cancelledCard);
      else if (item.trang_thai === 'pending')
        cardStyle.push(styles.pendingCard);
      else if (item.trang_thai === 'confirmed' && !item.canPay)
        // Đã xác nhận nhưng quá hạn
        cardStyle.push(styles.expiredConfirmedCard);

      // Làm mờ text nếu đã thanh toán, hủy, hoặc quá hạn
      if (
        item.isPaid ||
        item.trang_thai === 'cancelled' ||
        (item.trang_thai === 'confirmed' && !item.canPay)
      ) {
        textStyle.push(styles.dimmedText);
      }

      const roomNameToDisplay =
        item.ten_phong_chinh || 'Chưa có thông tin phòng';
      const totalRoomQuantity =
        item.chi_tiet_cac_phong?.reduce(
          (sum, roomDetail) =>
            sum + (parseInt(roomDetail.so_luong_phong, 10) || 0),
          0,
        ) || 0;
      const servicesDisplay =
        item.chi_tiet_cac_dich_vu
          ?.map(
            service =>
              `${service.ten_dich_vu}${
                parseInt(service.so_luong, 10) > 1
                  ? ` (x${service.so_luong})`
                  : ''
              }`,
          )
          .join(', ') || 'Không có dịch vụ';

      return (
        <View style={cardStyle}>
          {/* Checkbox chỉ hiển thị nếu có thể chọn để thanh toán */}
          {isSelectable && (
            <CheckBox
              value={isSelected}
              onValueChange={() => onSelect(item.id)}
              tintColors={{
                true: '#000000', // Màu khi được chọn
                false: '#000000', // Màu khi chưa chọn và có thể chọn
              }}
              style={styles.checkbox}
              disabled={!isSelectable} // Vô hiệu hóa nếu không thể chọn
            />
          )}
          {/* Placeholder để giữ layout nếu không có checkbox */}
          {!isSelectable && <View style={styles.checkboxPlaceholder} />}

          <View style={styles.cardContent}>
            <View style={styles.headerRow}>
              <Text style={[styles.hotelName, ...textStyle]}>
                {item.ten_khach_san || 'N/A'}
                {/* Nếu API get_booking.php trả về item.khach_san_id, bạn có thể dùng nó ở đây nếu cần */}
              </Text>
              {/* Nút xóa chỉ hiển thị cho các trạng thái cho phép xóa */}
              {(item.trang_thai === 'pending' ||
                item.trang_thai === 'cancelled' ||
                (item.trang_thai === 'confirmed' &&
                  !item.isPaid &&
                  !item.canPay)) && (
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Image
                    source={require('../assets/delete.png')} // Đảm bảo có ảnh này
                    style={styles.deleteImage}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.roomName, ...textStyle]}>
              Phòng: {roomNameToDisplay}
            </Text>
            {totalRoomQuantity > 0 && (
              <Text style={[styles.detailText, ...textStyle]}>
                Số lượng phòng: {totalRoomQuantity}
              </Text>
            )}
            <Text style={[styles.date, ...textStyle]}>
              {item.ngay_nhan_phong} ➜ {item.ngay_tra_phong}
            </Text>
            {item.chi_tiet_cac_dich_vu &&
              item.chi_tiet_cac_dich_vu.length > 0 && (
                <View style={styles.serviceContainer}>
                  <Text style={[styles.detailHeaderText, ...textStyle]}>
                    Dịch vụ:
                  </Text>
                  <Text style={[styles.detailText, ...textStyle]}>
                    {servicesDisplay}
                  </Text>
                </View>
              )}
            <Text
              style={[
                styles.status,
                item.isPaid
                  ? styles.statusPaid
                  : item.trang_thai === 'confirmed'
                  ? item.canPay
                    ? styles.statusConfirmedCanPay
                    : styles.statusConfirmedExpired
                  : item.trang_thai === 'cancelled'
                  ? styles.statusCancelled
                  : styles.statusPending,
                ...textStyle,
              ]}>
              Trạng thái: {statusText}
            </Text>
            {/* Hiển thị thời gian đếm ngược */}
            {item.trang_thai === 'confirmed' &&
              !item.isPaid &&
              item.ngay_cap_nhat && (
                <Text
                  style={[
                    item.canPay ? styles.canPayText : styles.expiredText,
                    ...textStyle,
                  ]}>
                  {
                    item.canPay && currentCountdown
                      ? `Còn: ${currentCountdown.hours}:${currentCountdown.minutes}:${currentCountdown.seconds}`
                      : !item.canPay
                      ? 'Đã quá hạn' // Chỉ hiển thị "Đã quá hạn" nếu canPay là false
                      : '' // Không hiển thị gì nếu không có countdown (ví dụ: vừa tải xong, chưa có state countdown)
                  }
                </Text>
              )}
            <Text style={[styles.price, ...textStyle]}>
              Tổng tiền: {Number(item.tong_tien || 0).toLocaleString()}đ
            </Text>
          </View>
        </View>
      );
    },
  );

  // Hiển thị loading nếu đang tải lần đầu và chưa có dữ liệu
  if (loading && bookings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Xử lý trường hợp không có userId (đã được kiểm tra trong useFocusEffect nhưng thêm guard ở đây)
  if (!userId && !loading) {
    // Chỉ hiển thị nếu không loading và không có userId
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBackToHome}>
            <Image
              source={require('../assets/back.png')}
              style={styles.backButton}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Đơn Đặt Chỗ Của Tôi</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Image
            source={require('../assets/empty-booking.png')}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>
            Không tìm thấy thông tin người dùng.
          </Text>
          <TouchableOpacity
            onPress={handleGoBackToHome}
            style={{marginTop: 10}}>
            <Text style={{color: '#007bff'}}>Về Trang Chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Component hiển thị khi danh sách rỗng
  const renderEmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../assets/empty-booking.png')}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyText}>Bạn chưa có đặt phòng nào.</Text>
    </View>
  );

  // Kiểm tra xem có booking nào có thể thanh toán không để hiển thị nút "Thanh toán"
  const payableBookingsExist = bookings.some(
    b => b.trang_thai === 'confirmed' && !b.isPaid && b.canPay,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBackToHome}>
          <Image
            source={require('../assets/back.png')}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Đơn Đặt Chỗ Của Tôi</Text>
        {/* Hiển thị loading nhỏ khi polling */}
        {isPollingLoading && !loading && (
          <ActivityIndicator
            size="small"
            color="#007bff"
            style={{marginLeft: 10}}
          />
        )}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <BookingItem
            item={item}
            onSelect={toggleBookingSelection}
            isSelected={selectedBookingsForPayment.includes(item.id)}
            currentCountdown={countdowns[item.id]} // Truyền countdown cụ thể cho item
          />
        )}
        contentContainerStyle={
          bookings.length === 0 ? styles.emptyListContainer : styles.listContent
        }
        ListEmptyComponent={!loading ? renderEmptyListComponent : null} // Chỉ hiển thị khi không loading
        refreshControl={
          // Kéo để làm mới
          <RefreshControl
            refreshing={loading && !isPollingLoading} // Chỉ hiển thị icon refresh khi tải thủ công
            onRefresh={() => fetchBookings(true)}
            colors={['#007bff']} // Màu cho Android
            tintColor={'#007bff'} // Màu cho iOS
          />
        }
      />

      {/* Nút thanh toán chỉ hiển thị nếu có booking đang chờ thanh toán và còn hạn */}
      {payableBookingsExist && (
        <TouchableOpacity
          style={[
            styles.paymentButton,
            selectedBookingsForPayment.length > 0 // Kích hoạt nút nếu có booking được chọn
              ? styles.paymentButtonActive
              : styles.paymentButtonInactive,
          ]}
          onPress={handleProceedToPayment}
          disabled={selectedBookingsForPayment.length === 0 || loading}>
          <Text style={styles.paymentButtonText}>
            Thanh toán ({selectedBookingsForPayment.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f4f6f8'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {width: 24, height: 24, marginRight: 16, tintColor: '#007bff'},
  title: {fontSize: 20, fontWeight: '600', color: '#333', flex: 1}, // Cho title co giãn
  listContent: {paddingHorizontal: 10, paddingVertical: 8, paddingBottom: 100}, // Tăng padding bottom
  emptyListContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'row',
    alignItems: 'flex-start', // Để checkbox và content thẳng hàng từ trên
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  paidCard: {backgroundColor: '#e6ffed', borderColor: '#b7e4c7'},
  cancelledCard: {
    backgroundColor: '#fff0f1',
    borderColor: '#f5c6cb',
    opacity: 0.7,
  },
  pendingCard: {backgroundColor: '#fff9e6', borderColor: '#ffeeba'},
  expiredConfirmedCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ced4da',
    opacity: 0.8,
  },
  checkbox: {marginRight: 10, alignSelf: 'center'}, // Canh giữa checkbox theo chiều dọc
  checkboxPlaceholder: {width: 24 + 10, height: 24}, // Giữ chỗ tương đương checkbox
  cardContent: {flex: 1},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hotelName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0056b3',
    flexShrink: 1,
    marginRight: 5,
  },
  roomName: {fontSize: 15, color: '#555', marginBottom: 3, fontStyle: 'italic'},
  date: {fontSize: 14, color: '#555', marginVertical: 3},
  detailText: {fontSize: 14, color: '#454545', marginBottom: 2},
  detailHeaderText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 1,
  },
  serviceContainer: {
    marginTop: 5,
    marginBottom: 3,
    paddingLeft: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
  status: {
    fontSize: 14,
    marginVertical: 5,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignSelf: 'flex-start', // Để background vừa với text
  },
  statusPaid: {color: '#155724', backgroundColor: '#d4edda'}, // Xanh lá
  statusConfirmedCanPay: {color: '#856404', backgroundColor: '#fff3cd'}, // Vàng nhạt
  statusConfirmedExpired: {color: '#721c24', backgroundColor: '#f8d7da'}, // Đỏ nhạt (Quá hạn)
  statusPending: {color: '#004085', backgroundColor: '#cce5ff'}, // Xanh dương nhạt
  statusCancelled: {color: '#721c24', backgroundColor: '#f8d7da'}, // Đỏ nhạt (Đã hủy)
  canPayText: {
    color: '#28a745',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  expiredText: {
    color: '#dc3545',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  price: {fontSize: 16, fontWeight: 'bold', marginTop: 8, color: '#000000'},
  dimmedText: {color: '#6c757d'}, // Màu cho text bị làm mờ
  deleteImage: {width: 22, height: 22, tintColor: '#dc3545'},
  paymentButton: {
    // position: 'absolute', // Bỏ absolute để nó nằm cuối ScrollView nếu không có nhiều item
    // bottom: 20,
    // left: 20,
    // right: 20,
    marginHorizontal: 20, // Canh lề nếu không absolute
    marginVertical: 15, // Canh lề nếu không absolute
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  paymentButtonActive: {backgroundColor: '#000000'},
  paymentButtonInactive: {backgroundColor: '#adb5bd'},
  paymentButtonText: {color: 'white', fontWeight: 'bold', fontSize: 16},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -50,
  },
  emptyImage: {width: 120, height: 120, marginBottom: 16, opacity: 0.6},
  emptyText: {fontSize: 17, color: '#777', textAlign: 'center'},
});

export default ListBooking;
