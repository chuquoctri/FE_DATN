import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import url from '../../ipconfig';

const SearchHotel = ({onSearch, onClose}) => {
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [capacity, setCapacity] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [address, setAddress] = useState('');
  const [starRating, setStarRating] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${url}API_DATN/API_User/Room/get_amenities.php`,
        );
        const text = await response.text();
        const result = JSON.parse(text);

        if (result.status === 'success' && Array.isArray(result.data)) {
          setAmenities(result.data);
        } else {
          console.error('Lỗi khi lấy tiện nghi:', result.message);
        }
      } catch (error) {
        console.error('Lỗi API:', error);
        Alert.alert('Lỗi', 'Không thể lấy danh sách tiện nghi');
      } finally {
        setLoading(false);
      }
    };
    fetchAmenities();
  }, []);

  const handleSearch = async () => {
    if (checkInDate > checkOutDate) {
      Alert.alert('Lỗi', 'Ngày trả phòng phải sau hoặc bằng ngày nhận phòng');
      return;
    }

    setLoading(true);
    const searchParams = {
      min_gia: priceMin ? parseFloat(priceMin.replace(/\D/g, '')) : null,
      max_gia: priceMax ? parseFloat(priceMax.replace(/\D/g, '')) : null,
      suc_chua: capacity ? parseInt(capacity) : null,
      tien_nghi_ids: selectedAmenities.length > 0 ? selectedAmenities : [],
      checkin: checkInDate.toISOString().split('T')[0],
      checkout: checkOutDate.toISOString().split('T')[0],
      ten_khach_san: hotelName || null,
      dia_chi: address || null,
      so_sao: starRating || null,
    };

    console.log('Dữ liệu gửi đi:', JSON.stringify(searchParams, null, 2));

    try {
      const response = await fetch(
        `${url}API_DATN/API_User/Search_hotel/Search_hotel.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(searchParams),
        },
      );

      const text = await response.text();
      console.log('Phản hồi từ API:', text);

      const result = JSON.parse(text);

      if (result.status === 'success') {
        onSearch(Array.isArray(result.data) ? result.data : []);
      } else {
        Alert.alert(
          'Thông báo',
          result.message || 'Không tìm thấy khách sạn phù hợp',
        );
        onSearch([]);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm khách sạn');
      onSearch([]);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const toggleAmenity = (amenityId, isChecked) => {
    setSelectedAmenities(prev =>
      isChecked ? [...prev, amenityId] : prev.filter(id => id !== amenityId),
    );
  };

  const formatCurrency = value => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderAmenity = ({item}) => (
    <View style={styles.amenityContainer}>
      <BouncyCheckbox
        isChecked={selectedAmenities.includes(item.id)}
        onPress={isChecked => toggleAmenity(item.id, isChecked)}
        fillColor="#000"
        size={20}
        iconStyle={{borderColor: '#000', borderRadius: 4}}
        innerIconStyle={{borderWidth: 1, borderRadius: 4}}
        textStyle={{textDecorationLine: 'none'}}
      />
      {item.hinh_anh && (
        <Image source={{uri: item.hinh_anh}} style={styles.amenityImage} />
      )}
      <Text style={styles.amenityText}>{item.ten}</Text>
    </View>
  );

  const renderStarRating = () => {
    return (
      <View style={styles.starRatingContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => setStarRating(star === starRating ? null : star)}>
            <Text
              style={[styles.star, star <= starRating && styles.selectedStar]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tìm kiếm khách sạn</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Image source={require('../assets/x.png')} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Tên khách sạn:</Text>
        <TextInput
          style={styles.input}
          value={hotelName}
          onChangeText={setHotelName}
          placeholder="Nhập tên khách sạn"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Địa chỉ:</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Số sao:</Text>
        {renderStarRating()}

        <Text style={styles.label}>Nhập khoảng giá:</Text>
        <View style={styles.priceContainer}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            value={priceMin}
            onChangeText={value => setPriceMin(formatCurrency(value))}
            placeholder="Giá thấp nhất"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.priceInput]}
            value={priceMax}
            onChangeText={value => setPriceMax(formatCurrency(value))}
            placeholder="Giá cao nhất"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Sức chứa:</Text>
        <TextInput
          style={styles.input}
          value={capacity}
          onChangeText={setCapacity}
          placeholder="Nhập sức chứa"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Ngày nhận phòng:</Text>
        <TouchableOpacity onPress={() => setShowCheckInPicker(true)}>
          <TextInput
            style={styles.input}
            value={checkInDate.toISOString().split('T')[0]}
            editable={false}
            placeholder="Chọn ngày nhận phòng"
            placeholderTextColor="#999"
          />
        </TouchableOpacity>
        {showCheckInPicker && (
          <DateTimePicker
            value={checkInDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowCheckInPicker(false);
              if (selectedDate) {
                setCheckInDate(selectedDate);
                // Không tự động thay đổi ngày trả phòng nữa
              }
            }}
          />
        )}

        <Text style={styles.label}>Ngày trả phòng:</Text>
        <TouchableOpacity onPress={() => setShowCheckOutPicker(true)}>
          <TextInput
            style={styles.input}
            value={checkOutDate.toISOString().split('T')[0]}
            editable={false}
            placeholder="Chọn ngày trả phòng"
            placeholderTextColor="#999"
          />
        </TouchableOpacity>
        {showCheckOutPicker && (
          <DateTimePicker
            value={checkOutDate}
            mode="date"
            display="default"
            minimumDate={checkInDate}
            onChange={(event, selectedDate) => {
              setShowCheckOutPicker(false);
              if (selectedDate) {
                setCheckOutDate(selectedDate);
              }
            }}
          />
        )}

        <Text style={styles.label}>Tiện nghi phòng:</Text>
        {loading && amenities.length === 0 ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <FlatList
            data={amenities}
            renderItem={renderAmenity}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.amenitiesList}
            ListEmptyComponent={
              <Text style={styles.noAmenitiesText}>Không có tiện nghi nào</Text>
            }
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// Giữ nguyên phần styles không thay đổi
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  starRatingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    fontSize: 28,
    color: '#ccc',
    marginRight: 8,
  },
  selectedStar: {
    color: '#FFD700',
  },
  amenitiesList: {
    paddingTop: 8,
  },
  amenityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    marginRight: '4%',
  },
  amenityImage: {
    width: 24,
    height: 24,
    marginLeft: 8,
    marginRight: 8,
    marginLeft: -120,
  },
  amenityText: {
    fontSize: 14,
    color: '#555',
    flexShrink: 1,
  },
  noAmenitiesText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 16,
  },
  searchButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 24,
  },
});

export default SearchHotel;
