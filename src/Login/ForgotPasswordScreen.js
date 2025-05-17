import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import url from '../../ipconfig';

const ForgotPasswordScreen = ({navigation}) => {
  const [email, setEmail] = useState('');

  const handleSendOTP = async () => {
    console.log('Email:', email);

    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email.');
      return;
    }

    try {
      const requestData = {
        email: email.trim(),
      };
      console.log('Sending request with data:', requestData);

      const response = await fetch(
        `${url}/API_DATN/API_User/Login/request_reset.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(requestData),
        },
      );

      const data = await response.json();
      console.log('Response from server:', data);

      if (data.status === 'success') {
        Alert.alert('Thành công', 'OTP đã được gửi đến email của bạn.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('VerifyOTPScreen', {email}),
          },
        ]);
      } else {
        Alert.alert('Lỗi', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập email để nhận OTP của bạn</Text>

      <View>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Image source={require('../assets/email.png')} style={styles.icon} />
          <TextInput
            placeholder="Nhập email của bạn..."
            placeholderTextColor="#888888"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
        <Text style={styles.buttonText}>Nhận OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
    marginTop: -200,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    marginBottom: 70,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    marginTop: 5,
    width: '100%',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  input: {
    color: '#000',
    flex: 1,
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
});

export default ForgotPasswordScreen;
