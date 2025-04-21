import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import url from '../../../ipconfig';

const CityHotelsScreen = ({route}) => {
  const {cityId, cityName, userId} = route.params; // Nhận userId từ route params
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Home/get_khach_san_theo_thanh_pho.php?city_id=${cityId}`,
        );
        const result = await response.json();
        if (result.status === 'success') {
          setHotels(result.data);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [cityId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <Text style={styles.headerTitle}>Khách sạn trong {cityName}</Text>
      <FlatList
        data={hotels}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={
              () =>
                navigation.navigate('HotelDetails', {hotelId: item.id, userId}) // Truyền userId cùng với hotelId
            }>
            <View style={styles.hotelCard}>
              <Image source={{uri: item.hinh_anh}} style={styles.hotelImage} />
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{item.ten}</Text>
                <View style={styles.metaContainer}>
                  <View style={styles.metaItem}>
                    <Image
                      source={require('../../assets/pin.png')}
                      style={styles.metaIcon}
                    />
                    <Text style={styles.metaText}>{item.ten_thanh_pho}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Image
                      source={require('../../assets/star.png')}
                      style={styles.metaIcon}
                    />
                    <Text style={styles.metaText}>{item.so_sao} sao</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
    color: '#000',
  },
  hotelCard: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 10,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  metaText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CityHotelsScreen;
