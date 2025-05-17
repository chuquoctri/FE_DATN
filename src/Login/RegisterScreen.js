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
import url from '../../ipconfig'; // Đường dẫn đến file ipconfig của bạn
import CheckBox from '@react-native-community/checkbox';

const RegisterScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false); // Giữ lại state này, có thể bạn sẽ cần validate sau

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    // ---- THÊM KIỂM TRA ĐỘ DÀI MẬT KHẨU ----
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    // -----------------------------------------

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    // Kiểm tra xem người dùng đã đồng ý với điều khoản chưa (nếu bạn muốn bắt buộc)
    // if (!isChecked) {
    //   Alert.alert('Lỗi', 'Bạn phải đồng ý với Điều khoản và Điều kiện để đăng ký.');
    //   return;
    // }

    try {
      const response = await fetch(
        // Đảm bảo URL này chính xác
        `${url}/API_DATN/API_User/Register/register.php`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, mat_khau: password}),
        },
      );

      const data = await response.json();

      if (data.status === 'success' || data.status === 'pending_verification') {
        Alert.alert('Thành công', data.message);
        // Truyền email và password (nếu cần) sang màn hình xác thực
        navigation.navigate('VerifyScreen', {email, password});
      } else {
        Alert.alert(
          'Lỗi đăng ký',
          data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        );
      }
    } catch (error) {
      console.error('Register error:', error); // Log lỗi ra console để debug
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tham gia cuộc phiêu lưu!</Text>
      <Text style={styles.subtitle}>
        Tạo tài khoản của bạn để bắt đầu hành trình{' '}
      </Text>

      {/* Email Input */}
      <View style={styles.inputWrapper}>
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
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputContainer}>
          <Image source={require('../assets/pass.png')} style={styles.icon} />
          <TextInput
            placeholder="Nhập mật khẩu của bạn..."
            placeholderTextColor="#888888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Xác nhận lại mật khẩu</Text>
        <View style={styles.inputContainer}>
          <Image source={require('../assets/pass.png')} style={styles.icon} />
          <TextInput
            placeholder="Nhập lại mật khẩu của bạn..."
            placeholderTextColor="#888888"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
        </View>
      </View>

      {/* Terms and Conditions Checkbox */}
      <View style={styles.CheckBoxContainer}>
        <CheckBox
          value={isChecked}
          onValueChange={setIsChecked}
          tintColors={{true: 'black', false: 'black'}}
        />
        <Text style={styles.CheckBoxText}>
          Đăng ký tài khoản và sử dụng ứng dụng của chúng tôi, bạn đồng ý với{' '}
          <Text style={styles.linkText}>Điều khoản và điều kiện.</Text>
        </Text>
      </View>

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      {/* OR Separator */}
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>or</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Social Logins */}
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity
          onPress={() => {
            /* Xử lý đăng nhập Google */
          }}>
          <Image
            source={require('../assets/google.png')}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            /* Xử lý đăng nhập Apple */
          }}>
          <Image
            source={require('../assets/apple.png')}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 25, // Thêm padding ngang cho container
  },
  title: {
    fontSize: 28, // Điều chỉnh kích thước
    fontWeight: 'bold',
    marginBottom: 8, // Điều chỉnh khoảng cách
    color: '#222', // Màu đậm hơn
    textAlign: 'center', // Căn giữa tiêu đề
  },
  subtitle: {
    fontSize: 15, // Điều chỉnh kích thước
    color: '#555', // Màu xám hơn
    marginBottom: 30, // Tăng khoảng cách dưới
    textAlign: 'center', // Căn giữa
  },
  inputWrapper: {
    // Bọc label và inputContainer
    marginBottom: 12, // Khoảng cách giữa các cụm input
  },
  label: {
    fontSize: 14,
    color: '#333', // Màu chữ đậm hơn
    marginBottom: 6, // Khoảng cách từ label đến input
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd', // Viền nhạt hơn
    borderRadius: 12, // Bo tròn nhiều hơn
    paddingHorizontal: 15,
    // paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Điều chỉnh padding cho iOS và Android
    backgroundColor: '#f9f9f9', // Nền cho input
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#777', // Màu icon
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 15,
    paddingVertical: 10, // Thêm padding bên trong TextInput
  },
  CheckBoxContainer: {
    // Đổi tên từ CheckBox để rõ ràng hơn
    flexDirection: 'row',
    alignItems: 'center', // Căn giữa checkbox và text
    marginTop: 15,
    marginBottom: 25, // Tăng khoảng cách dưới
  },
  CheckBoxText: {
    fontSize: 13,
    color: '#444',
    marginLeft: 8, // Khoảng cách từ checkbox đến text
    flexShrink: 1, // Cho phép text xuống dòng nếu không đủ chỗ
  },
  linkText: {
    // Style cho phần text "Điều khoản và điều kiện"
    fontWeight: 'bold',
    color: '#007bff', // Màu link xanh
    textDecorationLine: 'underline', // Gạch chân (tùy chọn)
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 15, // Tăng padding
    borderRadius: 12, // Bo tròn nhiều hơn
    width: '100%',
    alignItems: 'center',
    marginTop: 10, // Giảm marginTop nếu CheckBoxContainer đã có marginBottom
    shadowColor: '#000', // Thêm bóng đổ nhẹ
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30, // Tăng khoảng cách
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0', // Màu đường kẻ nhạt hơn
  },
  separatorText: {
    marginHorizontal: 15, // Tăng khoảng cách
    fontSize: 14, // Giảm kích thước chữ "or"
    color: '#888',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // marginTop: 20, // Đã có margin từ separatorContainer
  },
  socialIcon: {
    width: 48, // Kích thước icon lớn hơn
    height: 48, // Kích thước icon lớn hơn
    marginHorizontal: 15, // Khoảng cách giữa các icon
  },
});

export default RegisterScreen;
