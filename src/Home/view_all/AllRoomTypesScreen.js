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

const AllRoomTypesScreen = ({route}) => {
  const {userId} = route.params; // Nhận userId từ route params
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await fetch(
          `${url}API_DATN/API_User/Home/get_loai_cho_nghi.php`,
        );
        const result = await response.json();
        if (result.status === 'success') {
          setRoomTypes(result.data);
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const handleRoomTypePress = (roomTypeId, roomTypeName) => {
    navigation.navigate('RoomTypeHotels', {roomTypeId, roomTypeName, userId}); // Truyền userId cùng với roomTypeId và roomTypeName
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
        data={roomTypes}
        keyExtractor={item => item.id.toString()}
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
  roomTypeCard: {
    alignItems: 'center',
    marginBottom: 15,
  },
  roomTypeImage: {
    width: 130,
    height: 110,
    borderRadius: 10,
  },
  roomTypeName: {
    marginTop: 7,
    fontSize: 14,
    color: '#000',
  },
});

export default AllRoomTypesScreen;
