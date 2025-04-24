import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import url from '../../../ipconfig';

export default function UpdateProfile() {
  const [user, setUser] = useState({});
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [ngaySinh, setNgaySinh] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');

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
          setHoTen(data.data.ho_ten);
          setSoDienThoai(data.data.so_dien_thoai);
          setDiaChi(data.data.dia_chi);
          // Chuyển đổi ngày sinh từ string sang Date object
          if (data.data.ngay_sinh) {
            const dateParts = data.data.ngay_sinh.split('-');
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            setNgaySinh(date);
          }
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

  const handleUpdateProfile = () => {
    if (!hoTen || !soDienThoai || !diaChi) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin cá nhân');
      return;
    }

    // Kiểm tra mật khẩu nếu có thay đổi
    if (matKhauCu || matKhauMoi || xacNhanMatKhau) {
      if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin đổi mật khẩu');
        return;
      }
      if (matKhauMoi !== xacNhanMatKhau) {
        Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp');
        return;
      }
    }

    // Format ngày sinh thành YYYY-MM-DD
    const formattedDate = `${ngaySinh.getFullYear()}-${(ngaySinh.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${ngaySinh.getDate().toString().padStart(2, '0')}`;

    const data = {
      ho_ten: hoTen,
      so_dien_thoai: soDienThoai,
      dia_chi: diaChi,
      ngay_sinh: formattedDate,
      mat_khau_cu: matKhauCu,
      mat_khau_moi: matKhauMoi,
    };

    fetch(`${url}/API_DATN/API_User/profile/update_profile.php?id=${userId}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          Alert.alert('Thành công', 'Cập nhật thông tin thành công');
          navigation.goBack();
        } else {
          Alert.alert('Lỗi', data.message || 'Cập nhật thông tin thất bại');
        }
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
      });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || ngaySinh;
    setShowDatePicker(false);
    setNgaySinh(currentDate);
  };

  const formatDate = date => {
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/back.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.title}>Cập nhật thông tin</Text>
      </View>

      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        placeholderTextColor="#999"
        value={hoTen}
        onChangeText={setHoTen}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor="#999"
        value={soDienThoai}
        onChangeText={setSoDienThoai}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        placeholderTextColor="#999"
        value={diaChi}
        onChangeText={setDiaChi}
      />

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          {ngaySinh ? formatDate(ngaySinh) : 'Chọn ngày sinh'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={ngaySinh}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
      <Text style={styles.note}>(Chỉ điền khi muốn đổi mật khẩu)</Text>
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu cũ"
        placeholderTextColor="#999"
        value={matKhauCu}
        onChangeText={setMatKhauCu}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        placeholderTextColor="#999"
        value={matKhauMoi}
        onChangeText={setMatKhauMoi}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu mới"
        placeholderTextColor="#999"
        value={xacNhanMatKhau}
        onChangeText={setXacNhanMatKhau}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateProfile}>
        <Text style={styles.updateText}>CẬP NHẬT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    color: 'black',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  dateText: {
    color: 'black',
  },
  updateButton: {
    backgroundColor: 'black',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  updateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
