import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import url from '../../ipconfig'; // Đổi thành URL API backend của bạn

const UpdateInfoScreen = ({route}) => {
  console.log('route.params:', route.params);
  console.log('Email nhận được từ route:', email);

  const email = route.params?.email || ''; // Nhận email từ màn hình trước
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleUpdate = async () => {
    console.log("Email gửi lên API:", email); // Kiểm tra email
    if (!fullName || !phone || !address || !birthDate) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${url}/API_DATN/API_User/Register/update_profile.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email,
            ho_ten: fullName,
            so_dien_thoai: phone,
            dia_chi: address,
            ngay_sinh: birthDate,
          }),
        },
      );

      const result = await response.json();
      setLoading(false);

      if (result.status === 'success') {
        Alert.alert('Thành công', 'Cập nhật thông tin thành công!', [
          {text: 'OK', onPress: () => navigation.navigate('Login')}, // Điều hướng sau khi cập nhật thành công
        ]);
      } else {
        Alert.alert('Lỗi', result.message || 'Cập nhật thất bại!');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Your Account</Text>
      <Text style={{color: '#000'}}>
        Complete your account to start your journey{' '}
      </Text>

      <Text style={{fontSize: 14, color: '#000', marginTop: 60}}>
        Full Name
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor="#888888"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Field Text "
        placeholderTextColor="#888888"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Field Text "
        placeholderTextColor="#888888"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Birth Date</Text>
      {/* Chọn ngày sinh */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.input}>
        <View style={{flexDirection: 'row'}}>
          <Image source={require('../assets/date.png')} style={styles.icon} />
          <Text style={birthDate ? styles.dateText : styles.placeholderText}>
            {birthDate || 'YYYY-MM-DD'}
          </Text>
        </View>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={birthDate ? new Date(birthDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate)
              setBirthDate(selectedDate.toISOString().split('T')[0]);
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpdate}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Đang cập nhật...' : 'Start Your Journey'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    padding: 20,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    marginTop: 70,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 15,
    justifyContent: 'center',
    marginTop: 5,
    color: '#000',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  dateText: {
    color: '#000',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default UpdateInfoScreen;
