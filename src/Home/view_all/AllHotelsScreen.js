import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import url from '../../../ipconfig';
import SearchHotel from '../../components/SearchHotel';

const AllHotelsScreen = ({route}) => {
  const {userId, searchResults, isSearchResult} = route.params || {};
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState({});
  const [noResults, setNoResults] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        if (isSearchResult && searchResults) {
          setHotels(searchResults);
          setNoResults(searchResults.length === 0);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${url}API_DATN/API_User/Home/get_khach_san.php`,
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
  }, [isSearchResult, searchResults]);

  const handleHotelPress = hotelId => {
    navigation.navigate('HotelDetails', {hotelId, userId});
  };

  const toggleExpand = id => {
    setExpanded(prevState => ({...prevState, [id]: !prevState[id]}));
  };

  const handleSearchResults = results => {
    setHotels(results);
    setNoResults(results.length === 0);
    setShowSearchModal(false);
  };

  const renderDescription = (description, id) => {
    if (!description) return null;
    const isExpanded = expanded[id];
    const displayText = isExpanded
      ? description
      : `${description.slice(0, 100)}...`;
    const buttonText = isExpanded ? 'Thu gọn' : 'Xem thêm';

    return (
      <View>
        <Text style={styles.hotelDescription}>{displayText}</Text>
        {description.length > 100 && (
          <TouchableOpacity onPress={() => toggleExpand(id)}>
            <Text style={styles.expandText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.ten.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (noResults) {
    return (
      <View style={styles.noResultsContainer}>
        <Image
          source={require('../../assets/no-results.png')}
          style={styles.noResultsImage}
        />
        <Text style={styles.noResultsText}>
          Không tìm thấy khách sạn phù hợp
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>
          {isSearchResult ? 'Kết quả tìm kiếm' : 'Danh sách khách sạn'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Thanh tìm kiếm đơn giản */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => setShowSearchModal(true)}>
        <Image
          source={require('../../assets/search.png')}
          style={styles.searchIcon}
        />
        <Text style={styles.searchPlaceholder}>Tìm kiếm khách sạn...</Text>
      </TouchableOpacity>

      {/* Thanh tìm kiếm nhanh (tìm theo tên) */}
     

      {/* Hiển thị số lượng kết quả */}
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCountText}>
          {filteredHotels.length} khách sạn
        </Text>
      </View>

      {/* Danh sách khách sạn */}
      <FlatList
        data={filteredHotels}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => handleHotelPress(item.id)}>
            <View style={styles.hotelCard}>
              <Image source={{uri: item.hinh_anh}} style={styles.hotelImage} />
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{item.ten}</Text>
                {renderDescription(item.mo_ta, item.id)}
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
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              Không tìm thấy khách sạn phù hợp
            </Text>
          </View>
        }
      />

      {/* Modal tìm kiếm nâng cao */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={false}>
        <SearchHotel
          onSearch={handleSearchResults}
          onClose={() => setShowSearchModal(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 24,
    height: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    marginBottom: 0,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#666',
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  quickSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  quickSearchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  clearSearchButton: {
    padding: 5,
  },
  clearSearchIcon: {
    width: 16,
    height: 16,
    tintColor: '#999',
  },
  resultsCountContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  resultsCountText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hotelCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  hotelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  expandText: {
    color: '#007bff',
    fontSize: 14,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
    tintColor: '#666',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AllHotelsScreen;
