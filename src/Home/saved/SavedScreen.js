import React, {useEffect, useState, useLayoutEffect} from 'react'; // Thêm useLayoutEffect nếu cần cho header động từ navigation options
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert, // Thêm Alert
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import url from '../../../ipconfig';

// Giả sử bạn có một icon trash hoặc heart_filled
const trashIcon = require('../../assets/delete.png'); // Đảm bảo bạn có icon này
const backIcon = require('../../assets/back.png'); // Icon back đã có

const SavedScreen = () => {
  const route = useRoute();
  const {userId} = route.params;
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Thiết lập header động (nếu bạn muốn dùng navigation.setOptions)
  // Nếu header hiện tại đã OK thì không cần useLayoutEffect
  // Tuy nhiên, header hiện tại của bạn là một View tùy chỉnh trong JSX, không phải header của navigator
  // nên useLayoutEffect ở đây sẽ không ảnh hưởng đến header hiện tại đó.

  const fetchFavoriteHotels = async () => {
    setLoading(true); // Đặt loading true mỗi khi fetch
    try {
      // Sửa "favorie" thành "favorite" nếu API của bạn đã được đổi tên cho nhất quán
      const response = await fetch(
        `${url}API_DATN/API_User/favorite/get_yeuthich.php?nguoi_dung_id=${userId}`,
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setFavoriteHotels(data.data || []); // Đảm bảo data.data là một mảng
        setError(null); // Xóa lỗi cũ nếu fetch thành công
      } else {
        // Nếu data.success là false nhưng không có data.data, hoặc API trả lỗi khác
        setFavoriteHotels([]); // Xóa danh sách cũ
        setError(data.message || 'Không có khách sạn yêu thích hoặc lỗi tải.');
      }
    } catch (err) {
      setFavoriteHotels([]);
      setError('Lỗi kết nối khi tải dữ liệu. Vui lòng thử lại.');
      console.error('Error fetching favorite hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Gọi khi màn hình được focus (quay lại từ trang khác) để cập nhật
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFavoriteHotels();
    });

    fetchFavoriteHotels(); // Gọi lần đầu khi component mount

    return unsubscribe; // Hủy listener khi component unmount
  }, [userId, navigation]);

  const handleUnfavorite = async hotelIdToUnfavorite => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa khách sạn này khỏi danh sách yêu thích?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              // Đảm bảo URL và cấu trúc body đúng với API remove_favorite.php
              const response = await fetch(
                `${url}API_DATN/API_User/favorite/remove_favorite.php`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    nguoi_dung_id: userId,
                    khach_san_id: hotelIdToUnfavorite,
                  }),
                },
              );
              const data = await response.json();

              if (response.ok && data.success) {
                // Cập nhật lại danh sách yêu thích trên UI
                setFavoriteHotels(prevHotels =>
                  prevHotels.filter(hotel => hotel.id !== hotelIdToUnfavorite),
                );
                // Alert.alert("Thành công", "Đã xóa khỏi danh sách yêu thích."); // Hoặc dùng toast
              } else {
                Alert.alert(
                  'Lỗi',
                  data.message || 'Không thể bỏ yêu thích khách sạn này.',
                );
              }
            } catch (err) {
              Alert.alert(
                'Lỗi',
                'Lỗi kết nối khi thực hiện thao tác. Vui lòng thử lại.',
              );
              console.error('Error unfavoriting hotel:', err);
            }
          },
          style: 'destructive', // Màu đỏ cho nút xóa (iOS)
        },
      ],
    );
  };

  const renderHotelItem = ({item}) => (
    <View style={styles.hotelCardOuterContainer}>
      <TouchableOpacity
        style={styles.hotelCardContent}
        onPress={() =>
          navigation.navigate('HotelDetails', {hotelId: item.id, userId})
        }>
        <Image source={{uri: item.hinh_anh}} style={styles.hotelImage} />
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName} numberOfLines={2}>
            {item.ten}
          </Text>
          <Text style={styles.hotelAddress} numberOfLines={1}>
            {item.dia_chi}
          </Text>
          <View style={styles.ratingContainer}>
            <Image
              source={require('../../assets/star_empty.png')} // Icon sao của bạn
              style={styles.starIcon}
            />
            <Text style={styles.ratingText}>{item.so_sao}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.unfavoriteButton}
        onPress={() => handleUnfavorite(item.id)} // item.id ở đây là khach_san_id
      >
        <Image source={trashIcon} style={styles.unfavoriteIcon} />
      </TouchableOpacity>
    </View>
  );

  if (loading && favoriteHotels.length === 0) {
    // Chỉ hiển thị loading toàn màn hình khi chưa có dữ liệu
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Header tùy chỉnh
  const CustomHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Image source={backIcon} style={styles.backIcon} />
      </TouchableOpacity>
      <Text style={styles.headerText}>Khách sạn yêu thích</Text>
    </View>
  );

  if (error && favoriteHotels.length === 0) {
    // Chỉ hiển thị lỗi toàn màn hình khi không có dữ liệu
    return (
      <View style={styles.container}>
        <CustomHeader />
        <View style={styles.errorContainerFullPage}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={fetchFavoriteHotels}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader />
      {favoriteHotels.length > 0 ? (
        <FlatList
          data={favoriteHotels}
          renderItem={renderHotelItem}
          keyExtractor={item => item.id.toString()} // item.id là khach_san_id
          contentContainerStyle={styles.listContainer}
          refreshing={loading} // Hiển thị icon refresh khi đang fetch lại
          onRefresh={fetchFavoriteHotels} // Cho phép kéo để làm mới
        />
      ) : (
        // Hiển thị thông báo rỗng nếu không loading và không có lỗi nhưng danh sách rỗng
        !loading &&
        !error && (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../assets/touch.png')} // Icon rỗng của bạn
              style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>
              Bạn chưa có khách sạn yêu thích nào.
            </Text>
          </View>
        )
      )}
      {/* Hiển thị lỗi nhỏ nếu đã có danh sách nhưng fetch mới bị lỗi */}
      {error && favoriteHotels.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={fetchFavoriteHotels}>
            <Text style={styles.errorBannerRetryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Màu nền nhẹ nhàng hơn
  },
  // Header Styles (nếu bạn dùng header tùy chỉnh này)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff', // Header có nền trắng
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5, // Tăng vùng chạm
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  headerText: {
    flex: 1, // Cho phép text chiếm không gian còn lại
    textAlign: 'center', // Căn giữa tiêu đề
    fontSize: 20, // Giảm kích thước một chút
    fontWeight: '600',
    color: '#333',
    // marginRight: 34, // Điều chỉnh lại nếu cần, hoặc bỏ đi nếu flex:1 và textAlign:center đã đủ
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainerFullPage: {
    // Style cho lỗi toàn trang
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  // Error banner (khi đã có data nhưng fetch mới lỗi)
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    color: '#c62828',
    fontSize: 14,
  },
  errorBannerRetryText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  // Card Styles
  hotelCardOuterContainer: {
    flexDirection: 'row', // Để card content và nút xóa nằm trên 1 hàng
    backgroundColor: '#fff',
    borderRadius: 10, // Bo tròn hơn
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, // Giảm shadow
    shadowRadius: 5,
    elevation: 2, // Giảm elevation
    marginHorizontal: 16, // Thêm margin ngang cho list
  },
  hotelCardContent: {
    flex: 1, // Cho phép phần nội dung chính chiếm phần lớn không gian
    flexDirection: 'row',
  },
  hotelImage: {
    width: 100, // Giảm kích thước ảnh một chút
    height: 110, // Điều chỉnh chiều cao để phù hợp
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  hotelInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between', // Căn đều không gian
  },
  hotelName: {
    fontSize: 17, // Giảm một chút
    fontWeight: 'bold',
    color: '#333',
  },
  hotelAddress: {
    fontSize: 13,
    color: '#777', // Màu nhạt hơn
    marginVertical: 4, // Thêm margin dọc
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 15,
    height: 15,
    marginRight: 5,
    tintColor: '#FFC107', // Màu vàng cho sao
  },
  ratingText: {
    fontSize: 14,
    color: '#FFC107', // Màu vàng cho sao
    fontWeight: 'bold',
  },
  unfavoriteButton: {
    padding: 12, // Tăng vùng chạm
    justifyContent: 'center', // Căn giữa icon
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    // backgroundColor: '#ffebee', // Màu nền nhẹ cho nút xóa (tùy chọn)
  },
  unfavoriteIcon: {
    width: 22, // Kích thước icon xóa
    height: 22,
    tintColor: '#dc3545', // Màu đỏ cho icon xóa
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyImage: {
    width: 120, // Điều chỉnh kích thước
    height: 120,
    marginBottom: 20,
    opacity: 0.6, // Làm mờ icon một chút
  },
  emptyText: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
  },
  // List Styles
  listContainer: {
    paddingVertical: 10, // Thêm padding dọc cho list
    // backgroundColor:'#f5f5f5', // Không cần thiết nếu container đã có màu nền
  },
});

export default SavedScreen;
