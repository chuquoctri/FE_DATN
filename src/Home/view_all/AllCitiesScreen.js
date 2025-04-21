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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import url from '../../../ipconfig';

const AllCitiesScreen = ({route}) => {
  const {userId} = route.params; // Nhận userId từ route params
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
    navigation.navigate('CityHotels', {cityId, cityName, userId}); // Truyền userId cùng với cityId và cityName
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBox}
        placeholder="Tìm kiếm theo tên thành phố"
        placeholderTextColor="#888888"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredCities}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => handleCityPress(item.id, item.ten)}>
            <View style={styles.cityCard}>
              <Image source={{uri: item.hinh_anh}} style={styles.cityImage} />
              <Text style={styles.cityName}>{item.ten}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    color: '#000',
  },
  cityCard: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cityImage: {
    width: 130,
    height: 110,
    borderRadius: 10,
  },
  cityName: {
    marginTop: 7,
    fontSize: 14,
    color: '#000',
  },
});

export default AllCitiesScreen;
