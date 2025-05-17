import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import url from '../../../ipconfig';

const AllRoomTypesScreen = ({route}) => {
  const {userId} = route.params;
  const [roomTypes, setRoomTypes] = useState([]);
  const [filteredRoomTypes, setFilteredRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
          setFilteredRoomTypes(result.data);
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const handleSearch = query => {
    setSearchQuery(query);
    const filtered = roomTypes.filter(roomType =>
      roomType.ten.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredRoomTypes(filtered);
  };

  const handleRoomTypePress = (roomTypeId, roomTypeName) => {
    navigation.navigate('RoomTypeHotels', {roomTypeId, roomTypeName, userId});
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
          <Text style={styles.headerTitle}>Loại chỗ nghỉ</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search box */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBox}
            placeholder="Tìm kiếm theo tên loại chỗ nghỉ"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <Image
            source={require('../../assets/search.png')}
            style={styles.searchIcon}
          />
        </View>

        {/* Room types list */}
        <FlatList
          data={filteredRoomTypes}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleRoomTypePress(item.id, item.ten)}
              style={styles.roomTypeCard}>
              <Image
                source={{uri: item.hinh_anh}}
                style={styles.roomTypeImage}
                resizeMode="cover"
              />
              <View style={styles.roomTypeOverlay} />
              <Text style={styles.roomTypeName}>{item.ten}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy loại chỗ nghỉ</Text>
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
  listContainer: {
    paddingBottom: 20,
  },
  roomTypeCard: {
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
    backgroundColor: '#fff',
  },
  roomTypeImage: {
    width: '100%',
    height: '100%',
  },
  roomTypeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  roomTypeName: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    color: '#fff',
    fontSize: 16,
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

export default AllRoomTypesScreen;
