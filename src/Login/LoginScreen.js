import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert, // Vẫn giữ Alert để dùng cho các thông báo LỖI
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import url from '../../ipconfig'; // Import URL từ ipconfig.js

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    // console.log('Email nhập vào:', email); // Dành cho debug
    // console.log('Password nhập vào:', password); // Dành cho debug

    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${url}API_DATN/API_User/Login/login.php`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });

      const result = await response.json();
      // console.log('🔹 API Response:', result); // Dành cho debug

      if (response.ok && result.status === 'success') {
        const userName = result.data.name;
        const userId = result.data.id;

        // KHÔNG CÒN ALERT THÀNH CÔNG Ở ĐÂY
        // Điều hướng trực tiếp đến HomeScreen
        navigation.navigate('HomeScreen', {userName, userId});

        // setLoading(false) sẽ được gọi trong khối finally,
        // sau khi navigation đã bắt đầu thực thi.
      } else {
        // Giữ lại Alert cho trường hợp đăng nhập thất bại hoặc lỗi từ API
        Alert.alert(
          'Lỗi đăng nhập',
          result.message || 'Sai tài khoản hoặc mật khẩu!',
        );
      }
    } catch (error) {
      // console.error('❌ Lỗi kết nối API:', error); // Dành cho debug
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối đến máy chủ. Vui lòng thử lại!',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng quay trở lại!</Text>
      <Text style={styles.subtitle}>
        Đăng nhập để truy cập tài khoản của bạn
      </Text>

      <View style={{marginTop: 30}}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#888888"
          placeholder="Nhập email của bạn..."
          value={email}
          onChangeText={text => {
            setEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu của bạn..."
          placeholderTextColor="#888888"
          secureTextEntry
          value={password}
          onChangeText={text => {
            setPassword(text);
          }}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <View style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Bạn quên mật khẩu? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPasswordScreen')}>
          <Text style={[styles.boldText, styles.linkText]}>Lấy lại ngay</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 20,
          marginTop: 60,
        }}>
        <View style={{flex: 1, height: 1, backgroundColor: '#A9A9A9'}} />
        <Text style={{marginHorizontal: 10, fontSize: 16, color: '#A9A9A9'}}>
          or
        </Text>
        <View style={{flex: 1, height: 1, backgroundColor: '#A9A9A9'}} />
      </View>

      <View style={styles.socialIcons}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Thông báo',
              'Chức năng đăng nhập Google đang được phát triển.',
            )
          }>
          <Image source={require('../assets/google.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Thông báo',
              'Chức năng đăng nhập Apple đang được phát triển.',
            )
          }>
          <Image source={require('../assets/apple.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles (giữ nguyên như bạn cung cấp hoặc như đã chỉnh sửa trước đó)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 80,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    marginBottom: 30,
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 18,
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
    elevation: 0,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#555',
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
  linkText: {
    color: '#000',
    fontSize: 14,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  icon: {
    width: 48,
    height: 48,
    marginHorizontal: 15,
  },
});

export default LoginScreen;
