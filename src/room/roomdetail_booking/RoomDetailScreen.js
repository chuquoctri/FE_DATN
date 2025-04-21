import React, {useState, useEffect} from 'react';
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
import url from '../../../ipconfig';

const RoomDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {room, hotelId, userId} = route.params;

  // State management
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
  const [totalPrice, setTotalPrice] = useState(room.gia);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);

  const parseJSONSafely = text => {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON Parse Error:', error);
      return {status: 'error', message: 'Invalid JSON response'};
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch room images
        const imagesResponse = await fetch(
          `${url}API_DATN/API_User/Room/get_room_images.php?phong_id=${room.id}`,
        );
        const imagesData = parseJSONSafely(await imagesResponse.text());
        if (imagesData.status === 'success' && imagesData.data?.length > 0) {
          setRoomImages(imagesData.data);
          setMainImage(imagesData.data[0]);
        }

        // Fetch room amenities
        const amenitiesResponse = await fetch(
          `${url}API_DATN/API_User/Room/get_room_amenities.php?phong_id=${room.id}`,
        );
        const amenitiesData = parseJSONSafely(await amenitiesResponse.text());
        if (amenitiesData.status === 'success') {
          setRoomAmenities(amenitiesData.data || []);
        }

        // Fetch hotel services
        const servicesResponse = await fetch(
          `${url}API_DATN/API_User/Hotel_detail/get_hotel_services.php?hotel_id=${hotelId}`,
        );
        const servicesData = parseJSONSafely(await servicesResponse.text());

        if (servicesData.status === 'success') {
          const processedServices = servicesData.data.map(service => ({
            ...service,
            gia: parseFloat(service.gia) || 0,
          }));
          setHotelServices(processedServices);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [room.id, hotelId]);

  const handleDateChange = (type, selectedDate) => {
    if (type === 'checkin') {
      setShowCheckInPicker(false);
      if (selectedDate) {
        setCheckInDate(selectedDate);
        if (selectedDate >= checkOutDate) {
          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);
          setCheckOutDate(nextDay);
        }
      }
    } else {
      setShowCheckOutPicker(false);
      if (selectedDate) {
        setCheckOutDate(selectedDate);
      }
    }
    calculateTotalPrice();
  };

  const handleServiceToggle = service => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.id === service.id);
      if (existing) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const calculateTotalPrice = () => {
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
    );
    const servicesTotal = selectedServices.reduce(
      (sum, service) => sum + service.gia,
      0,
    );
    setTotalPrice(room.gia * nights + servicesTotal);
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedServices, checkInDate, checkOutDate]);

  const handleBookNow = async () => {
    if (checkOutDate <= checkInDate) {
      Alert.alert('Chú ý!', 'Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        nguoi_dung_id: userId,
        ngay_nhan_phong: checkInDate.toISOString().split('T')[0],
        ngay_tra_phong: checkOutDate.toISOString().split('T')[0],
        phong_id: room.id,
        dich_vu: selectedServices.map(service => ({
          id: service.id,
          so_luong: 1,
        })),
      };

      const response = await fetch(
        `${url}API_DATN/API_User/Room_detail/booking.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        },
      );

      const result = parseJSONSafely(await response.text());

      if (result.status === 'success') {
        setBookingInfo({
          totalPrice: totalPrice,
          roomName: room.ten,
          checkInDate: bookingData.ngay_nhan_phong,
          checkOutDate: bookingData.ngay_tra_phong,
        });
        setShowSuccessModal(true);
      } else {
        Alert.alert('Lỗi', result.message || 'Đặt phòng không thành công');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt phòng');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleModalOk = () => {
    setShowSuccessModal(false);
    // Sử dụng reset để về HomeScreen và xóa stack navigation trước đó
    navigation.reset({
      index: 0,
      routes: [{name: 'HomeScreen'}],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Phần ảnh phòng */}
        <View style={styles.imageSection}>
          <Image
            source={{uri: mainImage?.hinh_anh}}
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
                  key={`thumb-${index}`}
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

        {/* Thông tin phòng */}
        <View style={styles.detailSection}>
          <Text style={styles.roomTitle}>{room.ten}</Text>

          <View style={styles.priceSection}>
            <Text style={styles.priceText}>
              {new Intl.NumberFormat('vi-VN').format(room.gia)} VND/đêm
            </Text>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText}>{room.suc_chua} người</Text>
            </View>
          </View>
        </View>

        {/* Mô tả phòng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả phòng</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={showFullDescription ? undefined : 3}>
            {room.mo_ta}
          </Text>
          {room.mo_ta.length > 100 && (
            <TouchableOpacity
              onPress={() => setShowFullDescription(!showFullDescription)}
              style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>
                {showFullDescription ? 'Thu gọn' : 'Xem thêm...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tiện nghi phòng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện nghi phòng</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.amenitiesContainer}>
            {roomAmenities.map((item, index) => (
              <View key={`amenity-${index}`} style={styles.amenityItem}>
                <Image
                  source={{uri: item.hinh_anh}}
                  style={styles.amenityIcon}
                />
                <Text style={styles.amenityName}>{item.ten}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Chọn ngày */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowCheckInPicker(true)}>
              <Text style={styles.dateText}>
                Nhận phòng: {checkInDate.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowCheckOutPicker(true)}>
              <Text style={styles.dateText}>
                Trả phòng: {checkOutDate.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>
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
              minimumDate={checkInDate}
            />
          )}
        </View>

        {/* Dịch vụ đặt thêm (Không bắt buộc) */}
        {hotelServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Dịch vụ đặt thêm (Không bắt buộc)
            </Text>
            <View style={styles.servicesWrapper}>
              {hotelServices.map(item => {
                const selected = selectedServices.find(s => s.id === item.id);
                return (
                  <TouchableOpacity
                    key={`service-${item.id}`}
                    style={[
                      styles.serviceItem,
                      selected && styles.selectedService,
                    ]}
                    onPress={() => handleServiceToggle(item)}>
                    <Image
                      source={{uri: item.hinh_anh}}
                      style={styles.serviceIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{item.ten}</Text>
                      <Text style={styles.servicePrice}>
                        +{new Intl.NumberFormat('vi-VN').format(item.gia)} VND
                      </Text>
                    </View>
                    <Text style={styles.toggleButtonText}>
                      {selected ? '✓ Đã chọn' : 'Chọn'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedServices.length > 0 && (
              <Text style={styles.selectedServicesText}>
                Đã chọn: {selectedServices.length} dịch vụ (+
                {new Intl.NumberFormat('vi-VN').format(
                  selectedServices.reduce(
                    (sum, service) => sum + service.gia,
                    0,
                  ),
                )}{' '}
                VND)
              </Text>
            )}
          </View>
        )}

        {/* Tổng tiền và đặt phòng */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>
              {new Intl.NumberFormat('vi-VN').format(totalPrice)} VND
              {checkInDate.toDateString() === new Date().toDateString() &&
                checkOutDate.toDateString() ===
                  new Date(
                    new Date().setDate(new Date().getDate() + 1),
                  ).toDateString() &&
                selectedServices.length === 0 && (
                  <Text style={styles.defaultPriceNote}> (1 đêm)</Text>
                )}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.bookButton, bookingLoading && styles.disabledButton]}
            onPress={handleBookNow}
            disabled={bookingLoading}>
            {bookingLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>ĐẶT PHÒNG NGAY</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal thông báo đặt phòng thành công */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đặt phòng thành công</Text>
            </View>

            <View style={styles.modalBody}>
              <Image
                source={require('../../assets/success.png')}
                style={styles.successIcon}
              />
              <Text style={styles.modalText}>
                Bạn đã đặt phòng {bookingInfo?.roomName} thành công!
              </Text>
              <Text style={styles.modalText}>
                Tổng tiền:{' '}
                {new Intl.NumberFormat('vi-VN').format(
                  bookingInfo?.totalPrice || 0,
                )}{' '}
                VND
              </Text>
              <Text style={styles.modalText}>
                Ngày nhận phòng: {bookingInfo?.checkInDate}
              </Text>
              <Text style={styles.modalText}>
                Ngày trả phòng: {bookingInfo?.checkOutDate}
              </Text>
              <Text style={styles.modalNote}>
                Vui lòng kiểm tra email để thanh toán và xác nhận đặt phòng.
                Quản trị viên sẽ xét duyệt yêu cầu của bạn trong thời gian sớm
                nhất.
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    position: 'relative',
    marginBottom: 15,
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  thumbnailContent: {
    paddingHorizontal: 5,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  selectedThumbnail: {
    borderColor: '#000',
    transform: [{scale: 1}],
  },
  detailSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },
  capacityBadge: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  capacityText: {
    fontSize: 14,
    color: '#555',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  readMoreButton: {
    marginTop: 5,
  },
  readMoreText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  amenitiesContainer: {
    paddingVertical: 5,
  },
  amenityItem: {
    width: 80,
    alignItems: 'center',
    marginRight: 15,
  },
  amenityIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  amenityName: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 13,
    color: '#333',
  },
  servicesWrapper: {
    marginBottom: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedService: {
    borderColor: '#4a90e2',
    backgroundColor: '#f0f8ff',
  },
  serviceIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
    flex: 2,
  },
  servicePrice: {
    fontSize: 15,
    color: '#e74c3c',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  toggleButtonText: {
    color: '#FF5A5F',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedServicesText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    textAlign: 'right',
  },
  totalSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },
  defaultPriceNote: {
    fontSize: 14,
    color: '#777',
  },
  bookButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  modalNote: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoomDetailScreen;
