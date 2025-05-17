import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import url from '../../ipconfig';

const SearchForm = ({hotelId, onSearch, onClose}) => {
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [capacity, setCapacity] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Room/get_amenities.php`,
          {
            headers: {
              Accept: 'application/json',
            },
          },
        );
        const text = await response.text();
        const result = JSON.parse(text);

        if (result.status === 'success' && Array.isArray(result.data)) {
          setAmenities(result.data);
        } else {
          console.error('Lỗi khi lấy danh sách tiện nghi:', result.message);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      }
    };
    fetchAmenities();
  }, []);

  const handleSearch = async () => {
    const searchParams = {
      khach_san_id: hotelId,
      min_gia: priceMin ? parseFloat(priceMin.replace(/\D/g, '')) : null,
      max_gia: priceMax ? parseFloat(priceMax.replace(/\D/g, '')) : null,
      suc_chua: capacity ? parseInt(capacity) : null,
      tien_nghi_ids: selectedAmenities.length > 0 ? selectedAmenities : null,
      checkin: checkInDate.toISOString().split('T')[0],
      checkout: checkOutDate.toISOString().split('T')[0],
    };

    try {
      const response = await fetch(
        `${url}API_DATN/API_User/Room/search_room.php`,
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
      const result = JSON.parse(text);

      if (result.status === 'success') {
        onSearch(Array.isArray(result.data) ? result.data : []);
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy phòng phù hợp');
        onSearch([]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tìm kiếm');
      onSearch([]);
    }
    onClose();
  };

  const toggleAmenity = (amenityId, isChecked) => {
    setSelectedAmenities(prev =>
      isChecked ? [...prev, amenityId] : prev.filter(id => id !== amenityId),
    );
  };

  const formatCurrency = value => {
    if (!value) return '';
    return (
      value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' VND'
    );
  };

  const renderAmenity = ({item: amenity}) => (
    <View key={amenity.id} style={styles.amenityContainer}>
      <BouncyCheckbox
        isChecked={selectedAmenities.includes(amenity.id)}
        onPress={isChecked => toggleAmenity(amenity.id, isChecked)}
        fillColor="black"
        size={20}
        iconStyle={{
          borderColor: 'black',
          borderRadius: 50,
        }}
        innerIconStyle={{
          borderWidth: 1,
          borderRadius: 50,
        }}
        unfillColor="white"
        textStyle={{textDecorationLine: 'none'}}
        style={styles.checkbox}
      />
      {amenity.hinh_anh ? (
        <Image source={{uri: amenity.hinh_anh}} style={styles.amenityImage} />
      ) : null}
      <Text style={[styles.amenityText, styles.blackText]}>
        {amenity.ten || 'Không có tên'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Room</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Image
            source={require('../assets/x.png')} // Make sure the path is correct
            style={styles.closeIcon}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, styles.blackText]}>Khoảng giá (VND):</Text>
      <View style={styles.priceContainer}>
        <TextInput
          style={[styles.input, styles.blackText]}
          value={priceMin}
          onChangeText={value => setPriceMin(formatCurrency(value))}
          placeholder="Từ"
          placeholderTextColor="#000"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.blackText]}
          value={priceMax}
          onChangeText={value => setPriceMax(formatCurrency(value))}
          placeholder="Đến"
          placeholderTextColor="#000"
          keyboardType="numeric"
        />
      </View>

      <Text style={[styles.label, styles.blackText]}>Sức chứa:</Text>
      <TextInput
        style={[styles.input, styles.blackText]}
        value={capacity}
        onChangeText={setCapacity}
        placeholder="Số người"
        placeholderTextColor="#000"
        keyboardType="numeric"
      />

      <Text style={[styles.label, styles.blackText]}>Tiện nghi:</Text>
      <View style={{height: 200, borderWidth: 1, borderColor: '#ccc'}}>
        <FlatList
          data={amenities}
          renderItem={renderAmenity}
          keyExtractor={(item, index) => item.id || index.toString()}
          numColumns={2}
          extraData={selectedAmenities}
        />
      </View>

      <Text style={[styles.label, styles.blackText]}>Ngày check-in:</Text>
      <TouchableOpacity onPress={() => setShowCheckInPicker(true)}>
        <TextInput
          style={[styles.input, styles.blackText]}
          value={checkInDate.toISOString().split('T')[0]}
          editable={false}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#000"
        />
      </TouchableOpacity>
      {showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || checkInDate;
            setShowCheckInPicker(false);
            setCheckInDate(currentDate);
          }}
        />
      )}

      <Text style={[styles.label, styles.blackText]}>Ngày check-out:</Text>
      <TouchableOpacity onPress={() => setShowCheckOutPicker(true)}>
        <TextInput
          style={[styles.input, styles.blackText]}
          value={checkOutDate.toISOString().split('T')[0]}
          editable={false}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#000"
        />
      </TouchableOpacity>
      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || checkOutDate;
            setShowCheckOutPicker(false);
            setCheckOutDate(currentDate);
          }}
        />
      )}

      <Button title="Tìm kiếm" onPress={handleSearch} color="black" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5, // Add padding for better touch area
  },
  closeIcon: {
    width: 24, // Adjust size as needed
    height: 24, // Adjust size as needed
    tintColor: '#000', // Optional: if you want to change the color
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flex: 1,
    marginRight: 5,
    backgroundColor: 'white',
  },
  blackText: {
    color: '#000',
  },
  amenitiesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  checkbox: {
    marginRight: 8,
  },
  amenityImage: {
    width: 30,
    height: 30,
    marginRight: 8,
    marginLeft: -120,
  },
  amenityText: {
    color: '#000',
    fontSize: 14,
    flex: 1,
  },
});

export default SearchForm;
