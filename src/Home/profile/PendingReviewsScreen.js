import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react'; // Thêm useLayoutEffect
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  Alert, // Vẫn giữ Alert cho các thông báo lỗi khác
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import url from '../../../ipconfig'; // Đường dẫn đến file ipconfig của bạn

// Component nhỏ cho việc chọn sao (Star Rating)
const StarRatingInput = ({
  rating,
  onRatingChange,
  maxStars = 5,
  starSize = 30,
}) => {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => onRatingChange(i)}
        style={styles.starButton}>
        <Text
          style={[
            styles.starText,
            {fontSize: starSize, color: i <= rating ? '#FFD700' : '#C0C0C0'},
          ]}>
          ★
        </Text>
      </TouchableOpacity>,
    );
  }
  return <View style={styles.starRatingContainer}>{stars}</View>;
};

const ReviewSubmitModal = ({isVisible, onClose, onSubmit, hotelName}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao đánh giá.');
      return;
    }
    onSubmit(rating, comment);
    // Reset form sau khi submit
    setRating(0);
    setComment('');
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Đánh giá cho {hotelName}</Text>

          <Text style={styles.inputLabel}>Số sao của bạn:</Text>
          <StarRatingInput rating={rating} onRatingChange={setRating} />

          <Text style={styles.inputLabel}>Bình luận (không bắt buộc):</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={4}
            placeholder="Chia sẻ cảm nhận của bạn..."
            placeholderTextColor="#777" // Thay đổi màu placeholder cho dễ nhìn hơn
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleClose}>
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}>
              <Text style={styles.modalButtonText}>Gửi Đánh Giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const PendingReviewsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params;

  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho thông báo thành công tạm thời
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('');

  // Thiết lập Header động
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Các mục chờ đánh giá', // Tên trang trên header
      headerTitleAlign: 'left', // Căn lề trái cho title nếu muốn nó gần nút back hơn
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackButton}>
          <Image
            // Đảm bảo đường dẫn này đúng với vị trí file back.png của bạn
            source={require('../../assets/back.png')}
            style={styles.headerBackImage}
          />
        </TouchableOpacity>
      ),
      // Bạn có thể tùy chỉnh thêm style cho header nếu cần
      // headerStyle: { backgroundColor: '#fff' },
      // headerTintColor: '#333',
      // headerTitleStyle: { fontWeight: 'bold' },
    });
  }, [navigation]);

  const fetchPendingReviews = useCallback(async () => {
    if (!userId) {
      setError('Không tìm thấy thông tin người dùng.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${url}API_DATN/API_User/review/get_pending_reviews.php?userId=${userId}`,
      );
      const result = await response.json();
      if (result.status === 'success') {
        setPendingReviews(result.data || []);
      } else {
        setError(result.message || 'Không thể tải danh sách đánh giá.');
        setPendingReviews([]);
      }
    } catch (e) {
      console.error('Fetch pending reviews error: ', e);
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
      setPendingReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  const handleOpenReviewModal = item => {
    setSelectedReviewItem(item);
    setIsReviewModalVisible(true);
  };

  const handleCloseReviewModal = () => {
    setSelectedReviewItem(null);
    setIsReviewModalVisible(false);
  };

  const handleSubmitReview = async (rating, comment) => {
    if (!selectedReviewItem || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        userId: userId,
        khachSanId: selectedReviewItem.khach_san_id,
        soSao: rating,
        binhLuan: comment,
        quyenDanhGiaId: selectedReviewItem.quyen_danh_gia_id,
      };

      const response = await fetch(
        `${url}API_DATN/API_User/review/submit_review.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();

      if (result.status === 'success') {
        handleCloseReviewModal();
        fetchPendingReviews(); // Tải lại danh sách

        // Hiển thị thông báo thành công tạm thời
        setSuccessMessageText(
          result.message || 'Đánh giá của bạn đã được gửi thành công!',
        );
        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessageText('');
          // Nếu bạn muốn tự động quay về ProfileScreen sau 5s, thêm vào đây:
          // navigation.navigate('ProfileScreen');
          // Hoặc nếu ProfileScreen cần userId:
          // navigation.navigate('ProfileScreen', { userId: userId });
        }, 5000); // Thông báo hiển thị trong 5 giây
      } else {
        Alert.alert(
          'Lỗi',
          result.message || 'Không thể gửi đánh giá. Vui lòng thử lại.',
        );
      }
    } catch (e) {
      console.error('Submit review error:', e);
      Alert.alert('Lỗi', 'Lỗi kết nối khi gửi đánh giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReviewItem = ({item}) => (
    <View style={styles.itemContainer}>
      <Image
        source={
          item.anh_dai_dien_ks
            ? {uri: item.anh_dai_dien_ks}
            : // Đảm bảo đường dẫn này đúng
              require('../../assets/home.png')
        }
        style={styles.hotelImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.hotelName}>{item.ten_khach_san}</Text>
        <Text style={styles.bookingInfo}>
          Mã đặt phòng: {item.ma_dat_phong_id}
        </Text>
        <Text style={styles.bookingInfo}>
          Ngày ở: {item.ngay_nhan_phong} - {item.ngay_tra_phong}
        </Text>
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => handleOpenReviewModal(item)}>
          <Text style={styles.reviewButtonText}>Viết đánh giá</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Đang tải danh sách chờ đánh giá...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={fetchPendingReviews}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (pendingReviews.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Bạn không có mục nào cần đánh giá.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={pendingReviews}
        renderItem={renderReviewItem}
        keyExtractor={item => item.quyen_danh_gia_id.toString()}
        contentContainerStyle={styles.listContentContainer}
        // ListHeaderComponent này có thể không cần thiết nữa nếu bạn đã có title ở navigation header
        // Hoặc bạn có thể giữ lại nếu muốn có một tiêu đề phụ bên trong list.
        // ListHeaderComponent={
        //   <Text style={styles.screenTitle}>Các mục chờ đánh giá</Text>
        // }
      />
      {selectedReviewItem && (
        <ReviewSubmitModal
          isVisible={isReviewModalVisible}
          onClose={handleCloseReviewModal}
          onSubmit={handleSubmitReview}
          hotelName={selectedReviewItem.ten_khach_san}
        />
      )}
      {isSubmitting && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.submittingText}>Đang gửi đánh giá...</Text>
        </View>
      )}

      {/* Component hiển thị thông báo thành công */}
      {showSuccessMessage && (
        <View style={styles.successMessageOverlay}>
          <Text style={styles.successMessageText}>{successMessageText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  // Bỏ screenTitle nếu không dùng ListHeaderComponent nữa, hoặc điều chỉnh
  // screenTitle: {
  //   fontSize: 22,
  //   fontWeight: 'bold',
  //   color: '#333',
  //   paddingHorizontal: 16,
  //   paddingTop: 20,
  //   paddingBottom: 10,
  // },
  headerBackButton: {
    marginLeft: 10, // Khoảng cách từ mép trái cho nút back
    padding: 5, // Tăng vùng chạm
  },
  headerBackImage: {
    width: 24, // Kích thước ảnh back
    height: 24, // Kích thước ảnh back
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 10, // Thêm padding top cho Android nếu header mặc định không có nhiều không gian
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  hotelName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookingInfo: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  reviewButton: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  inputLabel: {
    fontSize: 15,
    color: '#444',
    marginBottom: 5,
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000000',
    borderRadius: 5,
    padding: 10,
    fontSize: 15,
    minHeight: 80,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top', // Đảm bảo placeholder và text bắt đầu từ trên cùng cho Android
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#000000',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  starButton: {
    paddingHorizontal: 4,
  },
  starText: {
    // Kích thước và màu được đặt inline
  },
  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  submittingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  // Styles cho thông báo thành công tạm thời
  successMessageOverlay: {
    position: 'absolute',
    bottom: 70, // Vị trí từ dưới lên
    left: 20,
    right: 20,
    alignItems: 'center', // Căn giữa nội dung bên trong (Text)
    zIndex: 2000, // Đảm bảo nó nổi lên trên
  },
  successMessageText: {
    backgroundColor: 'rgba(40, 167, 69, 0.9)', // Màu xanh lá cây, hơi trong suốt
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25, // Bo tròn nhiều hơn cho giống toast
    fontSize: 15,
    textAlign: 'center',
    elevation: 6, // Shadow cho Android
    shadowColor: '#000', // Shadow cho iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default PendingReviewsScreen;
