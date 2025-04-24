import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import url from '../../../ipconfig';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params;

  useEffect(() => {
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID người dùng');
      navigation.goBack();
      return;
    }

    fetch(`${url}/API_DATN/API_User/profile/get_profile.php?id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setUser(data.data);
        } else {
          Alert.alert(
            'Lỗi',
            data.message || 'Không thể tải thông tin người dùng',
          );
        }
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      });
  }, [userId]);

  if (!user) return <Text style={styles.loading}>Đang tải thông tin...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../../assets/back.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.title}>Trang cá nhân</Text>
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
            {/* <Image
              source={require('../../assets/profile.png')}
              style={styles.infoIcon}
            /> */}
            <Text style={styles.name}>{user.ho_ten}</Text>
          </View>

          <View style={styles.infoRow}>
            <Image
              source={require('../../assets/email.png')}
              style={styles.infoIcon}
            />
            <Text style={styles.email}>{user.email}</Text>
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
          onPress={() => navigation.navigate('UpdateProfile', {userId})}
        />
        <MenuItem
          icon={require('../../assets/history.png')}
          title="Lịch sử giao dịch"
          onPress={() => navigation.navigate('LichSuGiaoDich', {userId})}
        />
        <MenuItem
          icon={require('../../assets/star.png')}
          title="Đánh giá"
          onPress={() => navigation.navigate('DanhGia', {userId})}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
            {text: 'Hủy'},
            {
              text: 'Đăng xuất',
              onPress: () => {
                // Xóa token nếu sử dụng AsyncStorage
                navigation.replace('Login');
              },
              style: 'destructive',
            },
          ]);
        }}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    flexGrow: 1,
  },
  loading: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
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
    tintColor: '#555',
  },
  name: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
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
    borderBottomColor: '#f0f0f0',
  },
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
    width: 20,
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
    tintColor: '#999',
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: 'black',
    paddingVertical: 14,
    borderRadius: 16,
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
