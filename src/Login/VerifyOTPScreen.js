import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import url from '../../ipconfig';

const VerifyOTPScreen = ({route, navigation}) => {
  const {email} = route.params;
  const [otp, setOtp] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp.trim() || !matKhauMoi.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP và mật khẩu mới.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${url}/API_DATN/API_User/Login/verify_reset.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, otp, mat_khau_moi: matKhauMoi}),
        },
      );

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.', [
          {text: 'OK', onPress: () => navigation.navigate('Login')},
        ]);
      } else {
        Alert.alert('Lỗi', result.message || 'Xác thực OTP thất bại.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác thực OTP</Text>
      <Text style={styles.subtitle}>
        Nhập mã OTP được gửi đến {email} và đặt lại mật khẩu mới.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập mã OTP"
        placeholderTextColor="#888888"
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu mới"
        placeholderTextColor="#888888"
        secureTextEntry
        value={matKhauMoi}
        onChangeText={setMatKhauMoi}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 20},
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    marginTop: -200,
  },
  subtitle: {fontSize: 16, color: 'gray', marginBottom: 70},
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  button: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  buttonDisabled: {backgroundColor: '#ccc'},
});

export default VerifyOTPScreen;
