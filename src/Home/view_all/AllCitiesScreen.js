import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import url from '../../../ipconfig';

const AllCitiesScreen = ({route}) => {
  const {userId} = route.params;
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Home/get_cities.php`,
        );
        const result = await response.json();
        if (result.status === 'success') {
          setCities(result.data);
          setFilteredCities(result.data);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleSearch = query => {
    setSearchQuery(query);
    const filtered = cities.filter(city =>
      city.ten.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredCities(filtered);
  };

  const handleCityPress = (cityId, cityName) => {
    navigation.navigate('CityHotels', {cityId, cityName, userId});
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
          <Text style={styles.headerTitle}>Khám phá thành phố</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search box */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBox}
            placeholder="Tìm kiếm thành phố..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <Image
            source={require('../../assets/search.png')}
            style={styles.searchIcon}
          />
        </View>

        {/* Cities list */}
        <FlatList
          data={filteredCities}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleCityPress(item.id, item.ten)}
              style={styles.cityCard}>
              <Image
                source={{uri: item.hinh_anh}}
                style={styles.cityImage}
                resizeMode="cover"
              />
              <View style={styles.cityOverlay} />
              <Text style={styles.cityName}>{item.ten}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy thành phố</Text>
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
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
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
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cityCard: {
    width: '48%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cityImage: {
    width: '100%',
    height: '100%',
  },
  cityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cityName: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
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

export default AllCitiesScreen;
