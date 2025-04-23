import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './home_css'; // Import file CSS riêng biệt

import url from '../../../ipconfig';

const HomeScreen = () => {
  const route = useRoute();
  const {userName, userId} = route.params; // Nhận tên người dùng và userId từ route params
  const [allCities, setAllCities] = useState([]);
  const [citiesByCategory, setCitiesByCategory] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [cachedCities, setCachedCities] = useState({}); // Cache dữ liệu thành phố
  const navigation = useNavigation();

  // Đối tượng ánh xạ id danh mục tới đường dẫn ảnh
  const categoryImages = {
    1: require('../../assets/cityscape.png'),
    2: require('../../assets/vacations.png'),
    3: require('../../assets/landscape.png'),
    4: require('../../assets/yoga.png'),
    5: require('../../assets/cheers.png'),
    6: require('../../assets/cloche.png'),
    // Thêm các ánh xạ khác ở đây
  };

  const HotelCard = ({hotel}) => {
    return (
      <TouchableOpacity
        onPress={
          () => navigation.navigate('HotelDetails', {hotelId: hotel.id, userId}) // Truyền userId cùng với hotelId
        }>
        <View style={styles.hotelCard}>
          <Image source={{uri: hotel.hinh_anh}} style={styles.hotelImage} />
          <Text style={styles.hotelName}>{hotel.ten}</Text>
          <View style={styles.hotelMetaContainer}>
            <View style={styles.metaItem}>
              <Image
                source={require('../../assets/pin.png')}
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{hotel.ten_thanh_pho}</Text>
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

  useEffect(() => {
    const fetchInitialData = async () => {
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
          categoriesRes.data.length > 0
        ) {
          setCategories(categoriesRes.data);
          setSelectedCategoryId(Number(categoriesRes.data[0].id));

          // Fetch all cities for each category
          const citiesCache = {};
          await Promise.all(
            categoriesRes.data.map(async category => {
              const citiesRes = await fetch(
                `${url}API_DATN/API_User/Home/getThanhPhoTheoDanhMuc.php?danh_muc_id=${category.id}`,
              ).then(res => res.json());
              if (citiesRes.status === 'success') {
                citiesCache[category.id] = citiesRes.data;
              }
            }),
          );

          setCachedCities(citiesCache);
          setCitiesByCategory(citiesCache[categoriesRes.data[0].id]);
        }

        if (allCitiesRes.status === 'success') {
          setAllCities(allCitiesRes.data);
        }

        if (hotelsRes.status === 'success') {
          setHotels(hotelsRes.data);
        }

        if (roomTypesRes.status === 'success') {
          setRoomTypes(roomTypesRes.data);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCategoryPress = id => {
    if (id !== selectedCategoryId) {
      setSelectedCategoryId(id);
      setCitiesByCategory(cachedCities[id]);
    }
  };

  const handleCityPress = (cityId, cityName) => {
    navigation.navigate('CityHotels', {cityId, cityName, userId});
  };

  const handleRoomTypePress = (roomTypeId, roomTypeName) => {
    navigation.navigate('RoomTypeHotels', {roomTypeId, roomTypeName, userId});
  };

  const handleViewAllCities = () => {
    navigation.navigate('AllCities', {userId});
  };

  const handleViewAllRoomTypes = () => {
    navigation.navigate('AllRoomTypes', {userId});
  };

  const handleViewAllHotels = () => {
    navigation.navigate('AllHotels', {userId});
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      {/* Header */}
      <View style={styles.header}>
        {/* Ảnh nền */}
        <Image
          source={require('../../assets/bgr_home.jpg')}
          style={styles.backgroundImage}
        />

        {/* Nội dung trên ảnh nền */}
        <View style={styles.overlayContent}>
          {/* Hàng trên cùng: icon user + vị trí */}
          <View style={styles.topRow}>
            <Image
              source={require('../../assets/user.png')}
              style={styles.icon}
            />
            <View style={styles.locationContainer}>
              <Image
                source={require('../../assets/notification.png')}
                style={styles.locationIcon}
              />
            </View>
          </View>

          {/* Lời chào */}
          <Text style={styles.greetingText}>Hello, {userName}</Text>
          <Text style={styles.questionText}>
            Chào mừng bạn đến với Booking Hotel!
          </Text>

          {/* Thanh tìm kiếm */}
          <View style={styles.searchBar}>
            <Image
              source={require('../../assets/search.png')}
              style={styles.searchIcon}
            />
            <Text style={styles.searchPlaceholder}>Nhập nơi bạn muốn đến!</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container_scrollview}>
        <View style={styles.container}>
          {/* Danh sách tất cả các thành phố */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khám phá Việt Nam</Text>
            <TouchableOpacity onPress={handleViewAllCities}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={allCities}
            keyExtractor={item => item.id.toString()}
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
          />

          {/* Danh sách loại chỗ nghỉ */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tìm theo loại chỗ nghỉ</Text>
            <TouchableOpacity onPress={handleViewAllRoomTypes}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={roomTypes}
            keyExtractor={item => item.id.toString()}
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
          />

          {/* Danh sách khách sạn */}
          <View style={styles.sectionHeader_hotel}>
            <Text style={styles.sectionTitle}>Khách sạn phổ biến</Text>
            <TouchableOpacity onPress={handleViewAllHotels}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={hotels}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => <HotelCard hotel={item} />}
          />

          {/* Danh mục thành phố */}
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
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                style={
                  item.id === selectedCategoryId
                    ? styles.selectedCategory
                    : styles.category
                }
                onPress={() => handleCategoryPress(item.id)}>
                <Image
                  source={categoryImages[item.id]}
                  style={styles.categoryImage}
                />
                <Text
                  style={
                    item.id === selectedCategoryId
                      ? styles.selectedCategoryText
                      : styles.categoryText
                  }>
                  {item.ten}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Danh sách thành phố theo danh mục */}
        <FlatList
          data={citiesByCategory}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleCityPress(item.id, item.ten)}>
              <View style={styles.cityCard}>
                <Image source={{uri: item.hinh_anh}} style={styles.cityImage} />
                <Text style={styles.cityName}>{item.ten}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* Thanh công cụ ở dưới cùng */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home', {userId})}>
          <Image
            source={require('../../assets/home.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('VoucherScreen', {userId})}>
          <Image
            source={require('../../assets/vouchers.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Ưu đãi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('SavedScreen', {userId})}>
          <Image
            source={require('../../assets/saved.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Yêu thích</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ListBooking', {userId})}>
          <Image
            source={require('../../assets/shopping-bag.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ProfileScreen', {userId})}>
          <Image
            source={require('../../assets/profile.png')}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
