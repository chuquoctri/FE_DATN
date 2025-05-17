import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import url from '../../../ipconfig';

const {width} = Dimensions.get('window');

const VoucherScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {userId} = route.params;

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVouchers = async () => {
    try {
      const response = await fetch(
        `${url}API_DATN/API_User/Vouchers/get_vouchers.php?user_id=${userId}`,
      );
      const data = await response.json();

      if (data.status === 'success') {
        setVouchers(data.data);
      } else {
        Alert.alert('Lỗi', data.message || 'Không thể tải voucher');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSaveVoucher = async voucherId => {
    try {
      const response = await fetch(
        `${url}API_DATN/API_User/Vouchers/save_vouchers.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({user_id: userId, voucher_id: voucherId}),
        },
      );
      const result = await response.json();
      if (result.status === 'success') {
        // Alert.alert('Thành công', result.message);
        fetchVouchers();
      } else {
        Alert.alert('Lỗi', result.message);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu voucher');
    }
  };

  const renderVoucherItem = ({item}) => {
    const imageUrl =
      item.hinh_anh_voucher ||
      item.hinh_anh_khachsan ||
      'https://via.placeholder.com/300x150?text=No+Image';

    return (
      <View style={styles.voucherContainer}>
        <ImageBackground
          source={{uri: imageUrl}}
          style={styles.voucherImage}
          imageStyle={styles.imageStyle}
          resizeMode="cover">
          <View style={styles.overlay} />

          <View style={styles.voucherContent}>
            <View style={styles.voucherHeader}>
              <Text style={styles.voucherCode}>{item.ma_voucher}</Text>
              <View
                style={[
                  styles.statusBadge,
                  item.trang_thai_hien_thi === 'Đang diễn ra' &&
                    styles.activeBadge,
                  item.trang_thai_hien_thi === 'Sắp diễn ra' &&
                    styles.upcomingBadge,
                  item.trang_thai_hien_thi === 'Đã kết thúc' &&
                    styles.expiredBadge,
                ]}>
                <Text style={styles.statusText}>
                  {item.trang_thai_hien_thi}
                </Text>
              </View>
            </View>

            <Text style={styles.voucherDesc} numberOfLines={2}>
              {item.mo_ta}
            </Text>

            <View style={styles.voucherValue}>
              <Text style={styles.valueText}>
                {item.loai_giam === 'phan_tram'
                  ? `GIẢM ${item.gia_tri_giam}%`
                  : `GIẢM ${new Intl.NumberFormat('vi-VN').format(
                      item.gia_tri_giam,
                    )}Đ`}
              </Text>
            </View>

            {item.ten_khachsan && (
              <View style={styles.applicableContainer}>
                <Text style={styles.applicableText}>
                  Áp dụng khi đặt phòng tại: {item.ten_khachsan}
                </Text>
              </View>
            )}

            <View style={styles.voucherFooter}>
              <Text style={styles.voucherDate}>
                {new Date(item.ngay_bat_dau).toLocaleDateString('vi-VN')} –{' '}
                {new Date(item.ngay_ket_thuc).toLocaleDateString('vi-VN')}
              </Text>

              {item.da_luu ? (
                <TouchableOpacity
                  style={[styles.saveButton, styles.savedButton]}
                  disabled>
                  <Text style={styles.savedButtonText}>Đã lưu</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSaveVoucher(item.id)}>
                  <Text style={styles.saveButtonText}>Lưu voucher</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header với back button và tiêu đề */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ưu đãi của bạn</Text>
      </View>

      <FlatList
        data={vouchers}
        renderItem={renderVoucherItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchVouchers();
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có voucher nào</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backIcon: {width: 24, height: 24, tintColor: '#333'},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '600',
    color: '#333',
    marginRight: 24, // để cân bằng khoảng trống trái cho back icon
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  voucherImage: {width: '100%', height: 200, justifyContent: 'center'},
  imageStyle: {borderRadius: 12},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  voucherContent: {padding: 16},
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voucherCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#555',
  },
  activeBadge: {backgroundColor: '#4CAF50'},
  upcomingBadge: {backgroundColor: '#FF9800'},
  expiredBadge: {backgroundColor: '#F44336'},
  statusText: {fontSize: 12, color: '#FFF', fontWeight: '500'},
  voucherDesc: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  applicableContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  applicableText: {fontSize: 9, color: '#FFF', fontStyle: 'italic'},
  voucherValue: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  valueText: {color: '#FFF', fontWeight: 'bold', fontSize: 18},
  voucherFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherDate: {
    fontSize: 12,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#000',
  },
  saveButtonText: {color: '#FFF', fontSize: 14, fontWeight: '500'},
  savedButton: {backgroundColor: '#FFF', borderColor: '#000'},
  savedButtonText: {color: '#000', fontSize: 14, fontWeight: '500'},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {fontSize: 18, color: '#666', marginTop: 16},
  listContainer: {paddingVertical: 16},
});

export default VoucherScreen;
