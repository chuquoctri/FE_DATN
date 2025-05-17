import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import url from '../../../ipconfig'; // Đảm bảo đường dẫn này chính xác

// Hàm helper để định dạng Date object thành chuỗi 'YYYY-MM-DD'
const formatDateToYYYYMMDD = date => {
  if (!(date instanceof Date) || isNaN(date.valueOf())) {
    console.warn('formatDateToYYYYMMDD received an invalid date:', date);
    const today = new Date(); // Fallback to today
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RoomDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {room, hotelId, userId} = route.params || {};

  const [roomImages, setRoomImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [roomAmenities, setRoomAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1)),
  );
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [hotelServices, setHotelServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [numberOfNights, setNumberOfNights] = useState(1);
  const [availableRoomsForDates, setAvailableRoomsForDates] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const parseJSONSafely = text => {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON Parse Error:', error, 'Raw text:', text);
      return {status: 'error', message: 'Phản hồi không hợp lệ từ máy chủ.'};
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!room?.id) {
        setLoading(false);
        Alert.alert('Lỗi', 'Không có thông tin chi tiết phòng.');
        navigation.goBack();
        return;
      }
      try {
        setLoading(true);
        const imagePromise = fetch(
          `${url}API_DATN/API_User/Room/get_room_images.php?phong_id=${room.id}`,
        );
        const amenityPromise = fetch(
          `${url}API_DATN/API_User/Room/get_room_amenities.php?phong_id=${room.id}`,
        );
        const servicePromise = hotelId
          ? fetch(
              `${url}API_DATN/API_User/Hotel_detail/get_hotel_services.php?hotel_id=${hotelId}`,
            )
          : Promise.resolve(null);
        const [imagesResponse, amenitiesResponse, servicesResponse] =
          await Promise.all([imagePromise, amenityPromise, servicePromise]);

        const imagesText = await imagesResponse.text();
        const imagesData = parseJSONSafely(imagesText);
        if (imagesData.status === 'success' && imagesData.data?.length > 0) {
          setRoomImages(imagesData.data);
          setMainImage(imagesData.data[0]);
        } else {
          console.warn('Không tải được ảnh phòng hoặc không có ảnh.');
        }

        const amenitiesText = await amenitiesResponse.text();
        const amenitiesData = parseJSONSafely(amenitiesText);
        if (amenitiesData.status === 'success') {
          setRoomAmenities(amenitiesData.data || []);
        }

        if (servicesResponse) {
          const servicesText = await servicesResponse.text();
          const servicesData = parseJSONSafely(servicesText);
          if (servicesData.status === 'success' && servicesData.data) {
            setHotelServices(
              servicesData.data.map(s => ({...s, gia: parseFloat(s.gia) || 0})),
            );
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu chi tiết phòng.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [room?.id, hotelId, navigation]);

  const checkRoomAvailabilityForDates = useCallback(
    async (roomId, checkInDt, checkOutDt) => {
      const formattedCheckIn = formatDateToYYYYMMDD(checkInDt);
      const formattedCheckOut = formatDateToYYYYMMDD(checkOutDt);
      if (new Date(formattedCheckOut) <= new Date(formattedCheckIn)) {
        setAvailableRoomsForDates(null);
        setRoomQuantity(1);
        return;
      }
      setIsCheckingAvailability(true);
      setAvailableRoomsForDates(null);
      try {
        const availabilityUrl = `${url}API_DATN/API_User/Room_detail/check_room_availability.php?phong_id=${roomId}&ngay_nhan_phong=${formattedCheckIn}&ngay_tra_phong=${formattedCheckOut}`;
        const response = await fetch(availabilityUrl);
        const responseText = await response.text();
        const result = parseJSONSafely(responseText);
        if (
          result.status === 'success' &&
          result.data &&
          typeof result.data.available_rooms === 'number'
        ) {
          setAvailableRoomsForDates(result.data.available_rooms);
        } else {
          console.warn(
            'Lỗi khi kiểm tra số phòng trống:',
            result.message || 'Không rõ lỗi',
          );
          setAvailableRoomsForDates(-1);
        }
      } catch (error) {
        console.error('Lỗi mạng khi kiểm tra số phòng trống:', error);
        setAvailableRoomsForDates(-1);
      } finally {
        setIsCheckingAvailability(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (room?.id && checkInDate && checkOutDate) {
      const handler = setTimeout(() => {
        checkRoomAvailabilityForDates(room.id, checkInDate, checkOutDate);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [checkInDate, checkOutDate, room?.id, checkRoomAvailabilityForDates]);

  useEffect(() => {
    if (availableRoomsForDates !== null && availableRoomsForDates >= 0) {
      if (roomQuantity > availableRoomsForDates) {
        setRoomQuantity(Math.max(1, availableRoomsForDates));
      }
    }
  }, [availableRoomsForDates]); // Bỏ roomQuantity khỏi dependency để tránh vòng lặp vô hạn nếu có lỗi logic

  const handleDateChange = (type, selectedDate) => {
    const currentDate = selectedDate;
    if (type === 'checkin') {
      setShowCheckInPicker(false);
      if (currentDate) {
        setCheckInDate(currentDate);
        if (currentDate >= checkOutDate) {
          const nextDay = new Date(currentDate);
          nextDay.setDate(nextDay.getDate() + 1);
          setCheckOutDate(nextDay);
        }
      }
    } else {
      setShowCheckOutPicker(false);
      if (currentDate) {
        if (currentDate <= checkInDate) {
          const dayAfterCheckIn = new Date(checkInDate);
          dayAfterCheckIn.setDate(dayAfterCheckIn.getDate() + 1);
          setCheckOutDate(dayAfterCheckIn);
          Alert.alert('Lưu ý', 'Ngày trả phòng phải sau ngày nhận phòng.');
        } else {
          setCheckOutDate(currentDate);
        }
      }
    }
  };

  const handleServiceToggle = service => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.id === service.id);
      if (existing) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, {...service, so_luong: 1}];
    });
  };

  const calculateTotalPrice = useCallback(() => {
    const ciDate = new Date(checkInDate);
    const coDate = new Date(checkOutDate);
    let nights = 0;
    if (coDate > ciDate) {
      nights = Math.ceil(
        (coDate.getTime() - ciDate.getTime()) / (1000 * 60 * 60 * 24),
      );
    }
    setNumberOfNights(nights > 0 ? nights : 0);
    const servicesTotal = selectedServices.reduce(
      (sum, srv) => sum + (parseFloat(srv.gia) || 0) * (srv.so_luong || 1),
      0,
    );
    const roomBasePrice = parseFloat(room?.gia) || 0;
    const roomTotal = roomBasePrice * nights * roomQuantity;
    setTotalPrice(roomTotal + servicesTotal);
  }, [checkInDate, checkOutDate, selectedServices, roomQuantity, room?.gia]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  const incrementQuantity = () => {
    let maxAllowed = room?.tong_so_luong_phong || 10;
    if (availableRoomsForDates !== null && availableRoomsForDates >= 0) {
      maxAllowed = availableRoomsForDates;
    }
    if (roomQuantity < maxAllowed) {
      setRoomQuantity(prevQuantity => prevQuantity + 1);
    } else {
      if (availableRoomsForDates === 0 && maxAllowed === 0) {
        Alert.alert('Thông báo', `Đã hết phòng cho ngày đã chọn.`);
      } else {
        Alert.alert(
          'Thông báo',
          `Số lượng phòng tối đa có thể đặt là ${maxAllowed}.`,
        );
      }
    }
  };

  const decrementQuantity = () => {
    if (roomQuantity > 1) {
      setRoomQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const handleBookNow = async () => {
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      Alert.alert('Chú ý!', 'Ngày trả phòng phải sau ngày nhận phòng.');
      return;
    }
    if (numberOfNights <= 0) {
      Alert.alert('Chú ý!', 'Số đêm nghỉ phải lớn hơn 0.');
      return;
    }
    if (
      availableRoomsForDates !== null &&
      availableRoomsForDates < roomQuantity &&
      availableRoomsForDates !== -1
    ) {
      Alert.alert(
        'Chú ý!',
        `Chỉ còn ${availableRoomsForDates} phòng trống. Vui lòng giảm số lượng.`,
      );
      return;
    }
    if (availableRoomsForDates === 0) {
      Alert.alert('Chú ý!', `Đã hết phòng. Vui lòng chọn ngày khác.`);
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        nguoi_dung_id: userId,
        ngay_nhan_phong: formatDateToYYYYMMDD(checkInDate),
        ngay_tra_phong: formatDateToYYYYMMDD(checkOutDate),
        phongs: [{phong_id: room.id, so_luong: roomQuantity}],
        dich_vu: selectedServices.map(s => ({
          id: s.id,
          so_luong: s.so_luong || 1,
        })),
      };
      const response = await fetch(
        `${url}API_DATN/API_User/Room_detail/booking.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(bookingData),
        },
      );
      const responseText = await response.text();
      const result = parseJSONSafely(responseText);
      if (result.status === 'success') {
        setBookingInfo({
          dat_phong_id: result.dat_phong_id,
          totalPrice: result.tong_tien,
          roomName: room.ten,
          roomQuantity: roomQuantity,
          checkInDate: bookingData.ngay_nhan_phong,
          checkOutDate: bookingData.ngay_tra_phong,
          numberOfNights: numberOfNights,
        });
        setShowSuccessModal(true);
      } else {
        Alert.alert('Lỗi đặt phòng', result.message || 'Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt phòng.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleModalOk = () => {
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [{name: 'ListBooking', params: {userId: userId, refresh: true}}],
    });
  };

  const renderAvailabilityInfo = () => {
    if (isCheckingAvailability) {
      return (
        <ActivityIndicator
          size="small"
          color="#007bff"
          style={styles.availabilityText}
        />
      );
    }
    if (availableRoomsForDates === null) {
      return (
        <Text style={styles.availabilityText}>
          Chọn ngày để xem số phòng trống.
        </Text>
      );
    }
    if (availableRoomsForDates === -1) {
      return (
        <Text style={[styles.availabilityText, styles.availabilityError]}>
          Không thể kiểm tra phòng trống.
        </Text>
      );
    }
    if (availableRoomsForDates === 0) {
      return (
        <Text style={[styles.availabilityText, styles.availabilityError]}>
          Hết phòng cho ngày đã chọn!
        </Text>
      );
    }
    return (
      <Text style={[styles.availabilityText, styles.availabilitySuccess]}>
        Còn {availableRoomsForDates} phòng trống.
      </Text>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }
  if (!room?.id) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy thông tin phòng.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <Image
            source={
              mainImage?.hinh_anh
                ? {uri: mainImage.hinh_anh}
                : require('../../assets/back.png')
            }
            style={styles.mainImage}
            resizeMode="cover"
          />
          {roomImages.length > 1 && (
            <ScrollView
              horizontal
              style={styles.thumbnailContainer}
              contentContainerStyle={styles.thumbnailContent}
              showsHorizontalScrollIndicator={false}>
              {roomImages.map((item, index) => (
                <TouchableOpacity
                  key={
                    item.id ? `roomImage-${item.id}` : `roomImage-idx-${index}`
                  }
                  onPress={() => setMainImage(item)}>
                  <Image
                    source={{uri: item.hinh_anh}}
                    style={[
                      styles.thumbnail,
                      mainImage?.id === item.id && styles.selectedThumbnail,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.roomTitle}>{room.ten || 'Tên phòng'}</Text>
          <View style={styles.priceSection}>
            <Text style={styles.priceText}>
              {new Intl.NumberFormat('vi-VN').format(parseFloat(room.gia) || 0)}{' '}
              VND/đêm
            </Text>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText}>
                {room.suc_chua || 0} người
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả phòng</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={showFullDescription ? undefined : 3}>
            {room.mo_ta || 'Không có mô tả.'}
          </Text>
          {(room.mo_ta?.length || 0) > 100 && (
            <TouchableOpacity
              onPress={() => setShowFullDescription(!showFullDescription)}
              style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>
                {showFullDescription ? 'Thu gọn' : 'Xem thêm...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {roomAmenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện nghi phòng</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.amenitiesContainer}>
              {roomAmenities.map((item, index) => (
                <View
                  key={item.id ? `amenity-${item.id}` : `amenity-idx-${index}`}
                  style={styles.amenityItem}>
                  <Image
                    source={
                      item.hinh_anh
                        ? {uri: item.hinh_anh}
                        : require('../../assets/back.png')
                    }
                    style={styles.amenityIcon}
                  />
                  <Text style={styles.amenityName}>{item.ten}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ===== KHU VỰC CHỌN NGÀY, SỐ LƯỢNG, SỐ ĐÊM (THAY ĐỔI BỐ CỤC) ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn thông tin đặt phòng</Text>
          {/* Hàng 1: Chọn ngày */}
          <View style={styles.datePickerRow}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowCheckInPicker(true)}>
              <Text style={styles.dateLabel}>Nhận phòng:</Text>
              <Text style={styles.dateTextValue}>
                {formatDateToYYYYMMDD(checkInDate)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowCheckOutPicker(true)}>
              <Text style={styles.dateLabel}>Trả phòng:</Text>
              <Text style={styles.dateTextValue}>
                {formatDateToYYYYMMDD(checkOutDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hàng 2: Thông tin số phòng trống */}
          <View style={styles.availabilityInfoContainer}>
            {renderAvailabilityInfo()}
          </View>

          {/* Hàng 3: Số lượng phòng và Số đêm */}
          <View style={styles.quantityAndNightsRow}>
            <View style={styles.quantityControlContainer}>
              <Text style={styles.quantityLabel}>Số lượng phòng:</Text>
              <View style={styles.quantityStepper}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decrementQuantity}
                  disabled={roomQuantity <= 1}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{roomQuantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={incrementQuantity}
                  disabled={
                    (availableRoomsForDates !== null &&
                      availableRoomsForDates >= 0 &&
                      roomQuantity >= availableRoomsForDates) ||
                    availableRoomsForDates === 0
                  }>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.nightsDisplayContainer}>
              <Text style={styles.numberOfNightsText}>
                Số đêm: {numberOfNights}
              </Text>
            </View>
          </View>

          {showCheckInPicker && (
            <DateTimePicker
              value={checkInDate}
              mode="date"
              display="default"
              onChange={(e, d) => handleDateChange('checkin', d)}
              minimumDate={new Date()}
            />
          )}
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutDate}
              mode="date"
              display="default"
              onChange={(e, d) => handleDateChange('checkout', d)}
              minimumDate={
                new Date(
                  new Date(checkInDate).setDate(checkInDate.getDate() + 1),
                )
              }
            />
          )}
        </View>
        {/* ===== KẾT THÚC KHU VỰC CHỌN NGÀY, SỐ LƯỢNG, SỐ ĐÊM ===== */}

        {/* Phần chọn số lượng phòng cũ đã được XÓA */}

        {hotelServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dịch vụ đặt thêm</Text>
            <View style={styles.servicesWrapper}>
              {hotelServices.map((item, index) => {
                const isSelected = selectedServices.find(s => s.id === item.id);
                return (
                  <TouchableOpacity
                    key={
                      item.id ? `service-${item.id}` : `service-idx-${index}`
                    }
                    style={[
                      styles.serviceItem,
                      isSelected && styles.selectedService,
                    ]}
                    onPress={() => handleServiceToggle(item)}>
                    <Image
                      source={
                        item.hinh_anh
                          ? {uri: item.hinh_anh}
                          : require('../../assets/back.png')
                      }
                      style={styles.serviceIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName} numberOfLines={1}>
                        {item.ten}
                      </Text>
                      <Text style={styles.servicePrice}>
                        +
                        {new Intl.NumberFormat('vi-VN').format(
                          parseFloat(item.gia) || 0,
                        )}{' '}
                        VND
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}>
                      {isSelected && (
                        <Text style={styles.checkboxCheck}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedServices.length > 0 && (
              <Text style={styles.selectedServicesText}>
                Đã chọn: {selectedServices.length} dịch vụ (+
                {new Intl.NumberFormat('vi-VN').format(
                  selectedServices.reduce(
                    (sum, srv) =>
                      sum + (parseFloat(srv.gia) || 0) * (srv.so_luong || 1),
                    0,
                  ),
                )}{' '}
                VND)
              </Text>
            )}
          </View>
        )}
        <View style={{height: 80}} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>
            {new Intl.NumberFormat('vi-VN').format(
              totalPrice < 0 ? 0 : totalPrice,
            )}{' '}
            VND
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (bookingLoading ||
              numberOfNights <= 0 ||
              (availableRoomsForDates !== null &&
                availableRoomsForDates < roomQuantity &&
                availableRoomsForDates !== -1) ||
              availableRoomsForDates === 0) &&
              styles.disabledButton,
          ]}
          onPress={handleBookNow}
          disabled={
            bookingLoading ||
            numberOfNights <= 0 ||
            (availableRoomsForDates !== null &&
              availableRoomsForDates < roomQuantity &&
              availableRoomsForDates !== -1) ||
            availableRoomsForDates === 0
          }>
          {bookingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>ĐẶT NGAY</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đặt phòng thành công!</Text>
            </View>
            <View style={styles.modalBody}>
              <Image
                source={require('../../assets/success.png')}
                style={styles.successIcon}
              />
              <Text style={styles.modalText}>
                Bạn đã yêu cầu đặt {bookingInfo?.roomQuantity} phòng{' '}
                {bookingInfo?.roomName}.
              </Text>
              <Text style={styles.modalText}>
                Mã đơn đặt: #{bookingInfo?.dat_phong_id}
              </Text>
              <Text style={styles.modalText}>
                Tổng tiền:{' '}
                {new Intl.NumberFormat('vi-VN').format(
                  bookingInfo?.totalPrice || 0,
                )}{' '}
                VND
              </Text>
              <Text style={styles.modalText}>
                Nhận phòng: {bookingInfo?.checkInDate}
              </Text>
              <Text style={styles.modalText}>
                Trả phòng: {bookingInfo?.checkOutDate}
              </Text>
              <Text style={styles.modalText}>
                Số đêm: {bookingInfo?.numberOfNights}
              </Text>
              <Text style={styles.modalNote}>
                Yêu cầu của bạn đã được gửi đi. Vui lòng kiểm tra email và chờ
                xác nhận từ khách sạn.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalOk}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},
  contentContainer: {paddingBottom: 10},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageSection: {position: 'relative', marginBottom: 8},
  mainImage: {width: '100%', height: 280},
  thumbnailContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 5,
  },
  thumbnailContent: {paddingHorizontal: 10},
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {borderColor: '#007bff', transform: [{scale: 1.05}]},
  detailSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  roomTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {fontSize: 20, fontWeight: 'bold', color: '#000000'},
  capacityBadge: {
    backgroundColor: '#e9ecef',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  capacityText: {fontSize: 13, color: '#495057', fontWeight: '500'},
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 12,
  },
  descriptionText: {fontSize: 14, lineHeight: 21, color: '#555'},
  readMoreButton: {marginTop: 8, alignSelf: 'flex-start'},
  readMoreText: {color: '#007bff', fontSize: 14, fontWeight: '500'},
  amenitiesContainer: {paddingBottom: 5},
  amenityItem: {alignItems: 'center', marginRight: 20, width: 70},
  amenityIcon: {width: 36, height: 36, marginBottom: 6},
  amenityName: {fontSize: 12, color: '#495057', textAlign: 'center'},
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  }, // Tăng marginBottom
  dateInput: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  dateLabel: {fontSize: 13, color: '#6c757d', marginBottom: 4},
  dateTextValue: {fontSize: 15, color: '#2c3e50', fontWeight: '500'},
  availabilityInfoContainer: {
    marginTop: 0,
    marginBottom: 12,
    alignItems: 'center',
  }, // Tăng marginBottom
  availabilityText: {fontSize: 14, fontStyle: 'italic', color: '#000000'},
  availabilitySuccess: {color: '#000000', fontWeight: 'bold'},
  availabilityError: {color: '#dc3545', fontWeight: 'bold'},

  // --- Styles mới cho hàng Số lượng & Số đêm ---
  quantityAndNightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10, // Khoảng cách với phần trên
    marginBottom: 5, // Khoảng cách với phần dưới (DateTimePicker nếu có)
  },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2, // Cho phép chiếm nhiều không gian hơn
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
    fontWeight: '500',
  },
  quantityStepper: {
    // Thay thế cho quantitySelector cũ
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 33,
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  quantityButtonText: {color: '#000000', fontSize: 18, fontWeight: 'bold'},
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 25,
    textAlign: 'center',
  },
  nightsDisplayContainer: {
    flex: 1, // Chiếm không gian còn lại
    alignItems: 'flex-end', // Căn phải
  },
  numberOfNightsText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500' /* Bỏ textAlign: 'right' */,
  },
  // --- Kết thúc styles mới ---

  servicesWrapper: {},
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  selectedService: {borderColor: '#000000', backgroundColor: '#fff'},
  serviceIcon: {width: 36, height: 36, marginRight: 12},
  serviceInfo: {flex: 1, justifyContent: 'center'},
  serviceName: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 2,
  },
  servicePrice: {fontSize: 13, color: '#000000', fontWeight: '600'},
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkboxSelected: {backgroundColor: '#000000'},
  checkboxCheck: {color: '#fff', fontWeight: 'bold'},
  selectedServicesText: {
    fontSize: 13,
    color: '#000000',
    marginTop: 10,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalPriceContainer: {flex: 1},
  totalLabel: {fontSize: 14, color: '#6c757d', marginBottom: 2},
  totalValue: {fontSize: 20, fontWeight: 'bold', color: '#000000'},
  bookButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  disabledButton: {backgroundColor: '#000000', opacity: 0.7},
  bookButtonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  modalHeader: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalTitle: {color: 'white', fontSize: 18, fontWeight: '600'},
  modalBody: {padding: 20, alignItems: 'center'},
  successIcon: {width: 50, height: 50, marginBottom: 15},
  modalText: {
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
    color: '#343a40',
    lineHeight: 22,
  },
  modalNote: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 19,
  },
  modalButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalButtonText: {color: 'white', fontSize: 16, fontWeight: '600'},
});

export default RoomDetailScreen;
