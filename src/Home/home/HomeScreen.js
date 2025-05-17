// HomeScreen.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './home_css';
import SearchHotel from '../../components/SearchHotel';
import url from '../../../ipconfig';

const HomeScreen = () => {
  const route = useRoute();
  // Thêm fallback || {} để tránh lỗi nếu params undefined ban đầu
  const {userName, userId} = route.params || {};

  // Các state giữ nguyên
  const [allCities, setAllCities] = useState([]);
  const [citiesByCategory, setCitiesByCategory] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [cachedCities, setCachedCities] = useState({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (!userId) {
      // userName cũng có thể được kiểm tra ở đây nếu nó là bắt buộc
      console.warn(
        '[HomeScreen] userId không có trong route.params:',
        route.params,
      );
      Alert.alert(
        'Lỗi',
        'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.',
        [
          {text: 'OK', onPress: () => navigation.replace('Login')}, // Điều hướng về Login nếu thiếu
        ],
      );
      setLoading(false); // Dừng loading
      return; // Không fetch data nếu thiếu userId
    }
    fetchInitialData();
  }, [userId]); // Chỉ phụ thuộc vào userId để fetch lại nếu nó thay đổi và có giá trị

  const categoryImages = {
    1: require('../../assets/cityscape.png'),
    2: require('../../assets/vacations.png'),
    3: require('../../assets/landscape.png'),
    4: require('../../assets/yoga.png'),
    5: require('../../assets/cheers.png'),
    6: require('../../assets/cloche.png'),
  };

  const HotelCard = ({hotel}) => {
    return (
      <TouchableOpacity
        onPress={() =>
          // Đảm bảo truyền đủ userId và userName
          navigation.navigate('HotelDetails', {
            hotelId: hotel.id,
            userId,
            userName,
          })
        }>
        <View style={styles.hotelCard}>
          <Image source={{uri: hotel.hinh_anh}} style={styles.hotelImage} />
          <Text style={styles.hotelName} numberOfLines={2}>
            {hotel.ten}
          </Text>
          <View style={styles.hotelMetaContainer}>
            <View style={styles.metaItem}>
              <Image
                source={require('../../assets/pin.png')}
                style={styles.metaIcon}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {hotel.ten_thanh_pho}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Image
                source={require('../../assets/star.png')}
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{hotel.so_sao}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const fetchInitialData = async () => {
    // ... (logic fetchInitialData giữ nguyên như bạn đã cung cấp, đảm bảo nó chạy ổn định) ...
    setLoading(true);
    try {
      const [categoriesRes, allCitiesRes, hotelsRes, roomTypesRes] =
        await Promise.all([
          fetch(`${url}API_DATN/API_User/Home/getDanhMucThanhPho.php`).then(
            res => res.json(),
          ),
          fetch(`${url}API_DATN/API_User/Home/get_cities.php`).then(res =>
            res.json(),
          ),
          fetch(`${url}API_DATN/API_User/Home/get_khach_san.php`).then(res =>
            res.json(),
          ),
          fetch(`${url}API_DATN/API_User/Home/get_loai_cho_nghi.php`).then(
            res => res.json(),
          ),
        ]);

      if (
        categoriesRes.status === 'success' &&
        categoriesRes.data &&
        categoriesRes.data.length > 0
      ) {
        setCategories(categoriesRes.data);
        const firstCategoryId = Number(categoriesRes.data[0].id);
        setSelectedCategoryId(firstCategoryId);

        const citiesCache = {};
        await Promise.all(
          categoriesRes.data.map(async category => {
            try {
              const citiesRes = await fetch(
                `${url}API_DATN/API_User/Home/getThanhPhoTheoDanhMuc.php?danh_muc_id=${category.id}`,
              ).then(res => res.json());
              if (citiesRes.status === 'success' && citiesRes.data) {
                citiesCache[Number(category.id)] = citiesRes.data;
              } else {
                citiesCache[Number(category.id)] = [];
              }
            } catch (catCityError) {
              console.error(
                `Error fetching cities for category ${category.id}:`,
                catCityError,
              );
              citiesCache[Number(category.id)] = [];
            }
          }),
        );
        setCachedCities(citiesCache);
        setCitiesByCategory(citiesCache[firstCategoryId] || []);
      } else {
        setCategories([]);
        setCitiesByCategory([]);
      }
      setAllCities(
        allCitiesRes.status === 'success' && allCitiesRes.data
          ? allCitiesRes.data
          : [],
      );
      setHotels(
        hotelsRes.status === 'success' && hotelsRes.data ? hotelsRes.data : [],
      );
      setRoomTypes(
        roomTypesRes.status === 'success' && roomTypesRes.data
          ? roomTypesRes.data
          : [],
      );
    } catch (error) {
      console.error('Error fetching initial data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu ban đầu. Vui lòng thử lại.');
      setCategories([]);
      setAllCities([]);
      setHotels([]);
      setRoomTypes([]);
      setCitiesByCategory([]);
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => { // Bỏ fetchInitialData khỏi dependency array của chính nó
  //   if (userId) {
  //       fetchInitialData();
  //   } else {
  //       setLoading(false);
  //   }
  // }, [userId]); // Chỉ chạy lại khi userId thay đổi

  const handleCategoryPress = id => {
    if (id !== selectedCategoryId) {
      setSelectedCategoryId(id);
      setCitiesByCategory(cachedCities[id] || []);
    }
  };

  const handleCityPress = (cityId, cityName) => {
    navigation.navigate('CityHotels', {cityId, cityName, userId, userName});
  };

  const handleRoomTypePress = (roomTypeId, roomTypeName) => {
    navigation.navigate('RoomTypeHotels', {
      roomTypeId,
      roomTypeName,
      userId,
      userName,
    });
  };

  const handleViewAllCities = () => {
    navigation.navigate('AllCities', {cities: allCities, userId, userName});
  };

  const handleViewAllRoomTypes = () => {
    navigation.navigate('AllRoomTypes', {
      roomTypes: roomTypes,
      userId,
      userName,
    });
  };

  const handleViewAllHotels = () => {
    navigation.navigate('AllHotels', {
      initialHotels: hotels.slice(0, 10), // Chỉ gửi 10 khách sạn ví dụ
      userId,
      userName,
    });
  };

  const handleSearchBarPress = () => {
    setShowSearchModal(true);
  };

  const handleSearchResults = results => {
    setShowSearchModal(false);
    navigation.navigate('AllHotels', {
      userId,
      userName, // Thêm userName
      searchResults: results,
      isSearchResult: true,
    });
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!userId) {
    // Kiểm tra lại userId sau khi loading xong
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy thông tin người dùng.</Text>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={{color: '#007bff', marginTop: 10}}>Đăng nhập lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      {/* Header cố định */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/bgr_home.jpg')}
          style={styles.backgroundImage}
        />
        <View style={styles.overlayContent}>
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={
                () => navigation.navigate('ProfileScreen', {userId, userName}) // Đã có userName
              }>
              <Image
                source={require('../../assets/user.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                /* Xử lý thông báo */
              }}>
              <Image
                source={require('../../assets/notification.png')}
                style={styles.locationIcon}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.greetingText}>Hello, {userName || 'Bạn'}</Text>
          <Text style={styles.questionText}>
            Chào mừng bạn đến với Booking Hotel!
          </Text>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={handleSearchBarPress}>
            <Image
              source={require('../../assets/search.png')}
              style={styles.searchIcon}
            />
            <Text style={styles.searchPlaceholder}>Nhập nơi bạn muốn đến!</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nội dung có thể cuộn */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* ----- 1. KHÁM PHÁ VIỆT NAM ----- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khám phá Việt Nam</Text>
            <TouchableOpacity onPress={handleViewAllCities}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={allCities}
            keyExtractor={item => `all-city-${item.id.toString()}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => handleCityPress(item.id, item.ten)}>
                <View style={styles.cityCard}>
                  <Image
                    source={{uri: item.hinh_anh}}
                    style={styles.cityImage}
                  />
                  <Text style={styles.cityName}>{item.ten}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>Không có thành phố.</Text>
            }
          />

          {/* ----- 2. LÊN KẾ HOẠCH DỄ DÀNG VÀ NHANH CHÓNG ----- */}
          <View style={styles.sectionHeader_1}>
            <Text style={styles.sectionTitle}>
              Lên kế hoạch dễ dàng và nhanh chóng
            </Text>
            <Text style={styles.sectionTitle_2}>
              Khám phá các điểm đến hàng đầu tại Việt Nam
            </Text>
          </View>
          <FlatList
            data={categories}
            keyExtractor={item => `category-${item.id.toString()}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                style={
                  Number(item.id) === selectedCategoryId
                    ? styles.selectedCategory
                    : styles.category
                }
                onPress={() => handleCategoryPress(Number(item.id))}>
                <Image
                  source={categoryImages[Number(item.id)]}
                  style={styles.categoryImage}
                />
                <Text
                  style={
                    Number(item.id) === selectedCategoryId
                      ? styles.selectedCategoryText
                      : styles.categoryText
                  }>
                  {item.ten}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>Không có danh mục.</Text>
            }
          />

          {selectedCategoryId &&
            citiesByCategory &&
            citiesByCategory.length > 0 && (
              <FlatList
                data={citiesByCategory}
                keyExtractor={item => `city-by-cat-${item.id.toString()}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{marginTop: 10}}
                contentContainerStyle={{
                  paddingLeft: styles.container.padding,
                  paddingRight: styles.container.padding
                    ? styles.container.padding - 10
                    : 5,
                }}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => handleCityPress(item.id, item.ten)}>
                    <View style={styles.cityCard}>
                      <Image
                        source={{uri: item.hinh_anh}}
                        style={styles.cityImage}
                      />
                      <Text style={styles.cityName}>{item.ten}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.emptyListText,
                      {paddingHorizontal: styles.container.padding || 15},
                    ]}>
                    Không có TP cho mục này.
                  </Text>
                }
              />
            )}

          {/* ----- 3. TÌM THEO LOẠI CHỖ NGHỈ ----- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tìm theo loại chỗ nghỉ</Text>
            <TouchableOpacity onPress={handleViewAllRoomTypes}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={roomTypes}
            keyExtractor={item => `room-type-${item.id.toString()}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => handleRoomTypePress(item.id, item.ten)}>
                <View style={styles.roomTypeCard}>
                  <Image
                    source={{uri: item.hinh_anh}}
                    style={styles.roomTypeImage}
                  />
                  <Text style={styles.roomTypeName}>{item.ten}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>Không có loại chỗ nghỉ.</Text>
            }
          />

          {/* ----- 4. KHÁCH SẠN PHỔ BIẾN ----- */}
          <View style={styles.sectionHeader_hotel}>
            <Text style={styles.sectionTitle}>Khách sạn phổ biến</Text>
            <TouchableOpacity onPress={handleViewAllHotels}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={hotels.slice(0, 5)}
            keyExtractor={item => `hotel-${item.id.toString()}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => <HotelCard hotel={item} />}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>Không có khách sạn.</Text>
            }
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation cố định */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('HomeScreen', {userId, userName})}>
          <Image
            source={require('../../assets/home.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('VoucherScreen', {userId, userName})
          }>
          <Image
            source={require('../../assets/vouchers.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Ưu đãi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('SavedScreen', {userId, userName})
          }>
          <Image
            source={require('../../assets/saved.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Yêu thích</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            if (!userId) {
              Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
              return;
            }
            navigation.navigate('ListBooking', {userId, userName}); // Đã có userName
          }}>
          <Image
            source={require('../../assets/shopping-bag.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Đơn đặt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate('ProfileScreen', {userId, userName})
          }>
          <Image
            source={require('../../assets/profile.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Cá nhân</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={false}
        onRequestClose={closeSearchModal}>
        <SearchHotel
          onSearch={handleSearchResults}
          onClose={closeSearchModal}
          userId={userId}
          // userName={userName} // Truyền nếu SearchHotel cần
        />
      </Modal>
    </View>
  );
};

export default HomeScreen;
