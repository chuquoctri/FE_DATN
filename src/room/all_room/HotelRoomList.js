import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import url from '../../../ipconfig';
import SearchForm from '../../components/SearchForm';

const HotelRoomList = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {hotelId, userId} = route.params;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomAmenities, setRoomAmenities] = useState({});
  const [roomImages, setRoomImages] = useState({});
  const [searchVisible, setSearchVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const apiUrl = `${url}API_DATN/API_User/Room/get_rooms.php?khach_san_id=${hotelId}`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/json',
        },
      });

      const text = await response.text();
      const result = JSON.parse(text);

      if (result.status === 'success' && Array.isArray(result.data)) {
        setRooms(result.data);
      } else {
        console.error('Error fetching rooms:', result.message);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoomDetails = async () => {
      const roomsToFetch = isSearching ? searchResults : rooms;
      for (const room of roomsToFetch) {
        if (!roomAmenities[room.id]) {
          fetchRoomAmenities(room.id);
        }
        if (!roomImages[room.id]) {
          fetchRoomImages(room.id);
        }
      }
    };

    if ((isSearching ? searchResults : rooms).length > 0) {
      fetchRoomDetails();
    }
  }, [rooms, searchResults, isSearching]);

  const fetchRoomAmenities = async roomId => {
    try {
      const response = await fetch(
        `${url}API_DATN/API_User/Room/get_room_amenities.php?phong_id=${roomId}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      const text = await response.text();
      const result = JSON.parse(text);

      if (result.status === 'success') {
        setRoomAmenities(prev => ({
          ...prev,
          [roomId]: result.data || [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching amenities for room ${roomId}:`, error);
    }
  };

  const fetchRoomImages = async roomId => {
    try {
      const response = await fetch(
        `${url}API_DATN/API_User/Room/get_room_images.php?phong_id=${roomId}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      const text = await response.text();
      const result = JSON.parse(text);

      if (result.status === 'success') {
        setRoomImages(prev => ({
          ...prev,
          [roomId]: result.data || [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching images for room ${roomId}:`, error);
    }
  };

  const handleSearch = results => {
    setIsSearching(true);
    setSearchResults(results);
    setSearchVisible(false);
  };
  const showAllRooms = () => {
    setIsSearching(false);
  };

  const resetSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
  };

  const displayRooms = isSearching ? searchResults : rooms;

  const renderRoom = ({item}) => {
    const amenities = roomAmenities[item.id] || [];
    const images = roomImages[item.id] || [];
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(item.gia);

    return (
      <View style={styles.roomContainer}>
        {images.length > 0 ? (
          <View>
            <Image
              source={{
                uri: images[0]?.hinh_anh ?? 'https://via.placeholder.com/150',
              }}
              style={styles.roomImage}
            />
            <View style={styles.roomAvailabilityContainer}>
              <Text style={styles.roomAvailabilityText}>Còn {item.so_luong} phòng</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.imagePlaceholder}>No Image</Text>
        )}

        <Text style={styles.roomTitle}>{item.ten}</Text>
        <View style={styles.amenitiesContainer}>
          {amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityContainer}>
              <Image
                source={{uri: amenity.hinh_anh}}
                style={styles.amenityImage}
              />
              <Text style={styles.amenityText}>{amenity.ten}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceAndButtonContainer}>
          <View style={{flexDirection: 'column', alignItems: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.price}>{formattedPrice}</Text>
              <Text style={{fontSize: 14, color: '#1a1a1a'}}>/đêm</Text>
            </View>
            <View style={styles.metaContainer}>
              <Image
                source={require('../../assets/succhua.png')}
                style={styles.metaIcon}
              />
              <Text style={styles.roomCapacity}>: {item.suc_chua} người</Text>
            </View>
          </View>

          <View>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() =>
                navigation.navigate('RoomDetailScreen', {
                  room: item,
                  hotelId: hotelId,
                  userId: userId,
                  roomAmenities: amenities,
                  roomImages: images,
                })
              }>
              <Text style={styles.bookButtonText}>Xem phòng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header với nút back và tiêu đề */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách phòng</Text>
      </View>

      {/* Nút tìm kiếm và menu */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchVisible(true)}>
          <Text style={styles.searchButtonText}>Tìm kiếm phòng</Text>
        </TouchableOpacity>

        {/* Nút menu LUÔN HIỂN THỊ */}
        <TouchableOpacity
          onPress={showAllRooms}
          style={[styles.menuButton, isSearching && styles.activeMenuButton]}>
          <Image
            source={require('../../assets/menu.png')}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Danh sách phòng */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : displayRooms.length === 0 ? (
        <Text style={styles.noDataText}>
          {isSearching ? 'Không tìm thấy phòng phù hợp' : 'No rooms available'}
        </Text>
      ) : (
        <FlatList
          data={displayRooms}
          keyExtractor={item => item.id.toString()}
          renderItem={renderRoom}
          extraData={displayRooms}
        />
      )}

      {/* Modal tìm kiếm */}
      <Modal
        visible={searchVisible}
        animationType="slide"
        onRequestClose={() => setSearchVisible(false)}>
        <SearchForm
          hotelId={hotelId}
          onSearch={handleSearch}
          onClose={() => setSearchVisible(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backIcon: {
    backgroundColor: '#FAEBD7',
    borderRadius: 50,
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 25,
    color: '#000',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#FAEBD7',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  searchButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuIcon: {
    width: 25,
    height: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    marginTop: 20,
  },
  roomContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  roomImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  roomAvailabilityContainer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    borderRadius: 20,
    padding: 5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 0.5,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Đổ bóng nhẹ
},
  roomAvailabilityText: {
    color: 'black',
    fontSize: 14,
  },
  imagePlaceholder: {
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  roomTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  metaIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  roomCapacity: {
    fontSize: 14,
    color: '#444',
  },
  amenitiesContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  amenityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '45%',
    marginLeft: 10,
  },
  amenityImage: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  amenityText: {
    fontSize: 16,
    color: '#444',
  },
  priceAndButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  bookButton: {
    backgroundColor: 'black',
    padding: 10,
    width: 180,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HotelRoomList;
