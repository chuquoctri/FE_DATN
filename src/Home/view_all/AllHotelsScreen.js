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
import {useNavigation} from '@react-navigation/native';
import url from '../../../ipconfig';

const AllHotelsScreen = ({route}) => {
  const {userId} = route.params; // Nhận userId từ route params
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchHotels = async () => {
      try {
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
  }, []);

  const handleHotelPress = hotelId => {
    navigation.navigate('HotelDetails', {hotelId, userId}); // Truyền userId cùng với hotelId
  };

  const toggleExpand = id => {
    setExpanded(prevState => ({...prevState, [id]: !prevState[id]}));
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={hotels}
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
  hotelCard: {
    marginBottom: 15,
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
  hotelDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  expandText: {
    color: '#007bff',
    marginTop: 5,
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

export default AllHotelsScreen;
