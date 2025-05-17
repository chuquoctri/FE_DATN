import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import url from '../../../ipconfig';

const RoomTypeHotelsScreen = ({route}) => {
  const {roomTypeId, roomTypeName, userId} = route.params;
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Home/get_khach_san_theo_loai_cho_nghi.php?room_type_id=${roomTypeId}`,
        );
        const result = await response.json();
        if (result.status === 'success') {
          setHotels(result.data);
          setFilteredHotels(result.data);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [roomTypeId]);

  const handleSearch = query => {
    setSearchQuery(query);
    const filtered = hotels.filter(hotel =>
      hotel.ten.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredHotels(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with back button and title */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Image
              source={require('../../assets/back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{roomTypeName}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search box */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBox}
            placeholder="Tìm kiếm theo tên khách sạn"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <Image
            source={require('../../assets/search.png')}
            style={styles.searchIcon}
          />
        </View>

        {/* Hotels list */}
        <FlatList
          data={filteredHotels}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('HotelDetails', {hotelId: item.id, userId})
              }
              style={styles.hotelCard}>
              <Image
                source={{uri: item.hinh_anh}}
                style={styles.hotelImage}
                resizeMode="cover"
              />
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
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Không tìm thấy khách sạn phù hợp'
                  : 'Không có khách sạn nào'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingVertical: 12,
    paddingLeft: 45,
    paddingRight: 20,
    fontSize: 16,
    color: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    top: 12,
    width: 20,
    height: 20,
    tintColor: '#999',
  },
  listContainer: {
    paddingBottom: 20,
  },
  hotelCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#666',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RoomTypeHotelsScreen;
