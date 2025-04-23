import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import url from '../../../ipconfig';

const SavedScreen = () => {
  const route = useRoute();
  const {userId} = route.params; // Nhận userId từ route params
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFavoriteHotels = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Home/get_yeuthich.php?nguoi_dung_id=${userId}`,
        );
        const data = await response.json();

        if (data.success) {
          setFavoriteHotels(data.data);
        } else {
          setError(data.message || 'Không có khách sạn yêu thích');
        }
      } catch (err) {
        setError('Lỗi khi tải dữ liệu');
        console.error('Error fetching favorite hotels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteHotels();
  }, [userId]);

  const renderHotelItem = ({item}) => (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() =>
        navigation.navigate('HotelDetails', {hotelId: item.id, userId})
      }>
      <Image source={{uri: item.hinh_anh}} style={styles.hotelImage} />
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.ten}</Text>
        <Text style={styles.hotelAddress}>{item.dia_chi}</Text>
        <View style={styles.ratingContainer}>
          <Image
            source={require('../../assets/star_empty.png')}
            style={styles.starIcon}
          />
          <Text style={styles.ratingText}>{item.so_sao}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            source={require('../../assets/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            source={require('../../assets/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Khách sạn yêu thích</Text>
      </View>

      {/* Content */}
      {favoriteHotels.length > 0 ? (
        <FlatList
          data={favoriteHotels}
          renderItem={renderHotelItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/star_empty.png')}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>Bạn chưa có khách sạn yêu thích</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    marginBottom: 10,
  },
  backIcon: {width: 24, height: 24, tintColor: '#333'},
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '600',
    color: '#333',
    marginTop: -20,
    marginRight: 24, // để cân bằng khoảng trống trái cho back icon
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
  hotelCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  hotelImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  hotelInfo: {
    flex: 1,
    padding: 12,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  hotelAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor:'f5f5f5',
    paddingBottom: 10,
    marginTop: 10,
  },
});

export default SavedScreen;
