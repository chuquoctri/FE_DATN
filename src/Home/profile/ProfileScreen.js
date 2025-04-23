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

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params;

  useEffect(() => {
    if (!id) return;
    fetch(`${url}/API_DATN/API_User/profile/get_profile.php?id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setUser(data.data);
        }
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      });
  }, [id]);

  if (!user) return <Text style={styles.loading}>Đang tải thông tin...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Thông tin cá nhân</Text>

      <View style={styles.profileBox}>
        <Image
          source={{uri: user.anh_dai_dien || 'https://via.placeholder.com/60'}}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.ho_ten}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.detail}>
            {user.dia_chi || 'Địa chỉ...'} • {user.so_dien_thoai || 'SĐT...'}
          </Text>
        </View>
      </View>

      <View style={styles.menuBox}>
        <MenuItem
          title="Cập nhật thông tin cá nhân"
          onPress={() => navigation.navigate('CapNhatThongTin', {id})}
        />
        <MenuItem
          title="Lịch sử giao dịch"
          onPress={() => navigation.navigate('LichSuGiaoDich', {id})}
        />
        <MenuItem
          title="Đánh giá"
          onPress={() => navigation.navigate('DanhGia', {id})}
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
                // Nếu dùng AsyncStorage, bạn xóa token ở đây
                navigation.replace('DangNhap');
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

function MenuItem({title, onPress}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  loading: {
    padding: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profileBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  detail: {
    fontSize: 13,
    color: '#999',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
