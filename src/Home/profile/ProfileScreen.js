// ProfileScreen.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator, // Thêm ActivityIndicator
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import url from '../../../ipconfig';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Thêm state loading
  const navigation = useNavigation();
  const route = useRoute();
  // Nhận cả userId và userName từ params
  const {userId, userName: initialUserName} = route.params || {}; // Thêm fallback {}

  useEffect(() => {
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID người dùng. Vui lòng quay lại.');
      // Cân nhắc điều hướng về Login nếu userId là bắt buộc ở app level
      // navigation.replace('Login');
      setLoading(false);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      return;
    }

    setLoading(true);
    fetch(`${url}/API_DATN/API_User/profile/get_profile.php?id=${userId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.status === 'success' && data.data) {
          setUser(data.data);
        } else {
          Alert.alert(
            'Lỗi',
            data.message || 'Không thể tải thông tin người dùng.',
          );
        }
      })
      .catch(err => {
        console.error('Fetch profile error:', err);
        Alert.alert(
          'Lỗi',
          'Lỗi kết nối hoặc không thể tải thông tin người dùng.',
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, navigation]); // Thêm navigation vào dependencies nếu dùng trong effect

  if (loading) {
    // Hiển thị loading indicator
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!user) {
    // Nếu fetch xong mà vẫn không có user (do lỗi hoặc user rỗng)
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Không thể tải thông tin người dùng.
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            // else navigation.replace('Login'); // Fallback nếu không thể goBack
          }}>
          <Text style={styles.retryText}>Thử lại hoặc Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Sử dụng user.ho_ten làm userName chính, hoặc initialUserName nếu user.ho_ten chưa có
  const currentUserName = user?.ho_ten || initialUserName;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/back.png')}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Trang cá nhân</Text>
        {/* Đảm bảo không có text hay khoảng trắng nào nằm trực tiếp ở đây */}
      </View>

      <View style={styles.profileBox}>
        <Image
          source={
            user.anh_dai_dien
              ? {uri: user.anh_dai_dien}
              : require('../../assets/user.png')
          }
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.name}>{user.ho_ten || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Image
              source={require('../../assets/email.png')}
              style={styles.infoIcon}
            />
            <Text style={styles.email}>{user.email || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Image
              source={require('../../assets/pin.png')}
              style={styles.infoIcon}
            />
            <Text style={styles.detail}>
              {user.dia_chi || 'Chưa cập nhật địa chỉ'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Image
              source={require('../../assets/phone-call.png')}
              style={styles.infoIcon}
            />
            <Text style={styles.detail}>
              {user.so_dien_thoai || 'Chưa cập nhật số điện thoại'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.menuBox}>
        <MenuItem
          icon={require('../../assets/edit-text.png')}
          title="Cập nhật thông tin cá nhân"
          onPress={() =>
            navigation.navigate('UpdateProfile', {
              userId,
              userName: currentUserName,
            })
          }
        />
        <MenuItem
          icon={require('../../assets/history.png')}
          title="Lịch sử giao dịch"
          onPress={() =>
            navigation.navigate('TransactionHistoryScreen', {
              userId,
              userName: currentUserName,
            })
          }
        />
        <MenuItem
          icon={require('../../assets/star.png')}
          title="Đánh giá"
          // Truyền cả userId và userName (currentUserName) cho PendingReviews
          onPress={() =>
            navigation.navigate('PendingReviews', {
              userId,
              userName: currentUserName,
            })
          }
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
            {text: 'Hủy', style: 'cancel'},
            {
              text: 'Đăng xuất',
              onPress: () => {
                // Xử lý thêm: xóa token, clear user state global nếu có
                navigation.replace('Login');
              },
              style: 'destructive',
            },
          ]);
        }}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
      {/* Đảm bảo không có text hay khoảng trắng nào nằm trực tiếp ở đây */}
    </ScrollView>
  );
}

function MenuItem({icon, title, onPress}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <Image source={icon} style={styles.menuIcon} />
          <Text style={styles.menuText}>{title}</Text>
        </View>
        <Image
          source={require('../../assets/chevron.png')}
          style={styles.arrowIcon}
        />
      </View>
    </TouchableOpacity>
  );
}

// Thêm style cho loading và error states
const styles = StyleSheet.create({
  centered: {
    // Dùng cho loading và error full screen
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryText: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
    padding: 10,
  },
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 24,
    height: 24,
    marginRight: 15, // Đảm bảo có khoảng cách với title
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    // backgroundColor: 'white', // Nếu muốn header có nền riêng
    // paddingBottom: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  profileBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start', // Căn các item từ trên xuống
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center', // Căn giữa thông tin nếu avatar cao hơn
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#555', // Màu cho icon
  },
  name: {
    fontSize: 22, // Tăng kích thước tên
    fontWeight: '600',
    color: '#000', // Màu đậm hơn cho tên
    marginBottom: 4, // Khoảng cách nhỏ với dòng email
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1, // Cho phép text thu nhỏ nếu quá dài
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden', // Cần thiết nếu các item con có border radius
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Màu border nhạt hơn
  },
  // Bỏ border cho item cuối cùng
  // menuItem:last-child { // CSS selector này không dùng trực tiếp trong React Native StyleSheet
  //   borderBottomWidth: 0,
  // }
  // Bạn có thể style riêng cho item cuối nếu cần, hoặc để FlatList/SectionList xử lý
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 20, // Kích thước icon menu
    height: 20,
    marginRight: 12,
    tintColor: '#555',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#999', // Màu cho mũi tên
  },
  logoutButton: {
    // marginTop: 16, // Bỏ margin top nếu muốn nó sát hơn
    backgroundColor: 'black', // Màu nút đăng xuất
    paddingVertical: 14,
    borderRadius: 16, // Bo tròn đồng bộ
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
