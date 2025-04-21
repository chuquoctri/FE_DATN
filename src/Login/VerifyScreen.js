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
import {useNavigation} from '@react-navigation/native';
import url from '../../ipconfig'; // Import URL từ ipconfig.js

const VerifyScreen = ({route}) => {
  const {email, password} = route.params; // Nhận email & mật khẩu từ màn hình trước
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false); // Thêm state cho việc gửi lại OTP
  const navigation = useNavigation();

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP!');
      return;
    }

    setLoading(true);
    try {
      console.log('🔹 Gửi yêu cầu xác thực OTP...');
      const response = await fetch(
        `${url}API_DATN/API_User/Register/verify.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, otp}),
        },
      );

      const result = await response.json();
      console.log('🔹 API Response:', result);

      if (response.ok && result.status === 'success') {
        Alert.alert('Thành công', 'Xác thực thành công!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('UpdateInfoScreen', {email}),
          },
        ]);
      } else {
        Alert.alert('Lỗi', result.message || 'Mã OTP không chính xác!');
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối API:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      console.log('🔹 Gửi yêu cầu gửi lại OTP...');
      const response = await fetch(
        `${url}API_DATN/API_User/Register/resend_otp.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email}),
        },
      );

      const result = await response.json();
      console.log('🔹 API Response:', result);

      if (response.ok && result.status === 'success') {
        Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn.');
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể gửi lại mã OTP.');
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối API:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>We have sent a code to email: {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập mã OTP"
        placeholderTextColor="#888888"
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <View
        style={{flexDirection: 'row', justifyContent: 'center', marginTop: 30}}>
        <Text style={{color: '#000'}}>Didn't receive the code? </Text>
        <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
          <Text style={{fontWeight: 'bold', color: '#000'}}>
            {resending ? 'Resending...' : 'Resend the OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    marginTop: -300,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: 'gray',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    marginTop: 40,
    color: '#000',
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

export default VerifyScreen;
