import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
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
    console.log('Email nhập vào:', email);
    console.log('Password nhập vào:', password);

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
      console.log('🔹 API Response:', result);

      if (response.ok && result.status === 'success') {
        const userName = result.data.name; // Giả sử API trả về tên người dùng trong result.data.name
        const userId = result.data.id; // Giả sử API trả về ID người dùng trong result.data.id
        Alert.alert('Thành công', 'Đăng nhập thành công!', [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate('HomeScreen', {userName, userId}),
          },
        ]);
      } else {
        Alert.alert('Lỗi', result.message || 'Sai tài khoản hoặc mật khẩu!');
      }
    } catch (error) {
      console.error('❌ Lỗi kết nối API:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Login to access your account</Text>

      <View style={{marginTop: 30}}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#888888"
          placeholder="Enter your email here..."
          value={email}
          onChangeText={text => {
            setEmail(text);
          }}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password..."
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
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.forgotPassword}>
        Forgot your password?
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPasswordScreen')}>
          <Text style={styles.boldText}>Reset here</Text>
        </TouchableOpacity>
      </Text>

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
        <Image source={require('../assets/google.png')} style={styles.icon} />
        <Image source={require('../assets/apple.png')} style={styles.icon} />
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 90,
    color: '#000',
  },
  subtitle: {
    color: '#666',
    marginBottom: 20,
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#000',
    marginTop: 10,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  icon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
});

export default LoginScreen;
