import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Linking,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import url from '../../ipconfig';

const HotelDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {hotelId, userId} = route.params;

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Home/get_khach_san_chi_tiet.php?hotel_id=${hotelId}`,
        );
        const result = await response.json();
        if (result.status === 'success') {
          setHotel(result.data);
        }
      } catch (error) {
        console.error('Error fetching hotel details:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchHotelReviews = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Hotel_detail/get_hotel_reviews.php?hotel_id=${hotelId}`,
        );
        const result = await response.json();
        if (result.status === 'success') {
          setReviews(result.data);
          const totalStars = result.data.reduce(
            (sum, review) => sum + review.so_sao,
            0,
          );
          const average = totalStars / result.data.length;
          setAverageRating(average);
        }
      } catch (error) {
        console.error('Error fetching hotel reviews:', error);
      }
    };

    const fetchHotelServices = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Hotel_detail/get_hotel_services.php?hotel_id=${hotelId}`,
        );
        const result = await response.json();
        if (result.status === 'success') {
          setServices(result.data);
        }
      } catch (error) {
        console.error('Error fetching hotel services:', error);
      }
    };

    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Hotel_detail/check_favorite.php?nguoi_dung_id=${userId}&khach_san_id=${hotelId}`,
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error response: ${text}`);
        }
        const result = await response.json();
        setIsFavorite(result.status === 'favorite');
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    fetchHotelDetails();
    fetchHotelReviews();
    fetchHotelServices();
    checkFavoriteStatus();
  }, [hotelId, userId]);

  const toggleFavorite = async () => {
    const toggleFavoriteUrl = `${url}API_DATN/API_User/Hotel_detail/toggle_favorite.php`;
    try {
      const response = await fetch(toggleFavoriteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `nguoi_dung_id=${userId}&khach_san_id=${hotelId}`,
      });

      const responseText = await response.text();
      const result = JSON.parse(responseText);
      if (result.status === 'success') {
        setIsFavorite(!isFavorite);
      } else {
        console.error('Error toggling favorite status:', result.message);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy thông tin khách sạn.</Text>
      </View>
    );
  }

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const openGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hotel.vi_do},${hotel.kinh_do}`;
    Linking.openURL(googleMapsUrl);
  };

  const renderMap = () => {
    if (!hotel.vi_do || !hotel.kinh_do) {
      return (
        <Text style={styles.errorText}>
          Không thể hiển thị bản đồ, dữ liệu vị trí không hợp lệ.
        </Text>
      );
    }

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${hotel.kinh_do},${hotel.vi_do},${hotel.kinh_do},${hotel.vi_do}&layer=mapnik&marker=${hotel.vi_do},${hotel.kinh_do}`;

    return (
      <TouchableOpacity onPress={openGoogleMaps} activeOpacity={0.8}>
        <View style={styles.mapContainer}>
          <WebView
            source={{uri: mapUrl}}
            style={styles.map}
            scalesPageToFit={true}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderStars = rating => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Image
          key={i}
          source={
            i < rating
              ? require('../assets/star_filled.png')
              : require('../assets/star_empty.png')
          }
          style={styles.starIcon}
        />,
      );
    }
    return stars;
  };

  const renderReviewItem = ({item}) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image
          source={require('../assets/user.png')}
          style={styles.userAvatar}
        />
        <View style={styles.reviewInfo}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.userName}>
              {item.ten_nguoi_dung || 'Ẩn danh'}
            </Text>
            <Text style={styles.reviewDate}>
              {new Date(item.ngay_danh_gia).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.ratingContainer}>{renderStars(item.so_sao)}</View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.binh_luan}</Text>
    </View>
  );

  const renderServiceItem = ({item}) => (
    <View style={styles.serviceItem}>
      <Image source={{uri: item.hinh_anh}} style={styles.serviceImage} />
      <Text style={styles.serviceName}>{item.ten}</Text>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <Image source={{uri: hotel.hinh_anh}} style={styles.hotelImage} />
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.actionButton}>
              <Image
                source={require('../assets/back.png')}
                style={styles.actionButtonIcon}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite}>
            <View style={styles.actionButton}>
              <Image
                source={require('../assets/heart.png')}
                style={[
                  styles.actionButtonIcon,
                  isFavorite && styles.favoriteIcon,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
        {/*địa chỉ */}
        <View style={styles.detailsContainer}>
          <Text style={styles.hotelName}>{hotel.ten}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.hotelAddress}>
              <Text style={{fontWeight: 'bold', fontSize: 15, color: '#000'}}>
                Địa chỉ:{' '}
              </Text>
              {hotel.dia_chi}
            </Text>
          </View>

          {/*gioi thieu */}
          <View>
            <Text style={styles.hotelDescription}>
              <Text style={{fontWeight: 'bold', fontSize: 15, color: '#000'}}>
                Giới thiệu:{' '}
              </Text>
              {expanded ? hotel.mo_ta : `${hotel.mo_ta.slice(0, 100)}...`}
            </Text>
            {hotel.mo_ta.length > 100 && (
              <TouchableOpacity onPress={toggleExpand}>
                <Text style={styles.expandText}>
                  {expanded ? 'Thu gọn' : 'Xem thêm'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Hiển thị dịch vụ của khách sạn */}
          <View style={styles.servicesContainer}>
            <Text style={styles.servicesTitle}>Dịch vụ</Text>
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={item => item.id.toString()}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* Hiển thị bản đồ OpenStreetMap */}
          <Text
            style={{
              color: '#000',
              marginTop: 10,
              marginBottom: -15,
              fontWeight: 'bold',
              fontSize: 15,
            }}>
            Vị trí
          </Text>
          {renderMap()}

          {/* Hiển thị đánh giá khách sạn */}
          <View style={styles.reviewsContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.reviewsTitle}>
                Đánh giá ({reviews.length})
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../assets/star_empty.png')}
                  style={styles.starRiviews}
                />
                <Text style={styles.reviewsTitle}>
                  {averageRating.toFixed(1)}
                </Text>
              </View>
            </View>
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={item => item.id.toString()}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
        <View style={styles.footer}>
          <View style={{marginLeft: 15}}>
            <Text style={{color: '#000', fontSize: 13}}>
              <Text style={{color: '#000', fontSize: 25, fontWeight: 'bold'}}>
                Đặt ngay!
              </Text>
            </Text>
            <Text style={{color: '#000', fontSize: 13}}>
              Đã bao gồm tất cả chi phí thuế 
            </Text>
          </View>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => {
              // Chuyển đến trang hiển thị tất cả các phòng khách sạn
              navigation.navigate('AllRoomsScreen', {hotelId, userId});
            }}>
            <Text style={styles.footerButtonText}>Xem phòng trống</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hotelImage: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  actionButtons: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    width: 25,
    height: 25,
  },
  favoriteIcon: {
    tintColor: 'red',
  },
  detailsContainer: {
    padding: 20,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  hotelAddress: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
  },
  hotelDescription: {
    fontSize: 15,
    color: '#666',
    marginTop: -10,
  },
  expandText: {
    color: '#007bff',
    marginTop: 5,
  },
  servicesContainer: {
    marginTop: 20,
  },
  servicesTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  serviceItem: {
    borderRadius: 10,
    padding: 5,
    marginRight: 15,
    alignItems: 'center',
  },
  serviceImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#f2f2f2',
  },
  serviceName: {
    marginTop: 5,
    fontSize: 13,
    color: '#000',
  },
  mapContainer: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    height: 150,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
    color: 'red',
  },
  reviewsContainer: {
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  reviewItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    width: 250,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 25,
    height: 25,
    borderRadius: 25,
    marginRight: 10,
  },
  starRiviews: {
    width: 20,
    height: 20,
    marginTop: -13,
    marginLeft: 205,
    marginRight: 10,
  },
  reviewInfo: {
    flex: 1,
  },
  userName: {
    width: '70%',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    width: '100%',
    height: 100,
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },

  footerButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 40,
  },

  footerButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HotelDetailsScreen;
