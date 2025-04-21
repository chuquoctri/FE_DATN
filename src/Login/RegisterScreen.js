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
import CheckBox from '@react-native-community/checkbox';

const RegisterScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      const response = await fetch(
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
        navigation.navigate('VerifyScreen', {email, password});
      } else {
        Alert.alert('Lỗi', data.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join the Adventure!</Text>
      <Text style={styles.subtitle}>
        Create your account to start your journey{' '}
      </Text>

      <View>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Image source={require('../assets/email.png')} style={styles.icon} />
          <TextInput
            placeholder="Enter your email here... "
            placeholderTextColor="#888888"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>
      </View>

      <View>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <Image source={require('../assets/pass.png')} style={styles.icon} />
          <TextInput
            placeholder="Enter your password here..... "
            placeholderTextColor="#888888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>
      </View>

      <View>
        <Text style={styles.label}>Confirm Password </Text>
        <View style={styles.inputContainer}>
          <Image source={require('../assets/pass.png')} style={styles.icon} />
          <TextInput
            placeholder="Enter your password here...... "
            placeholderTextColor="#888888"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.CheckBox}>
        <CheckBox
          value={isChecked}
          onValueChange={setIsChecked}
          tintColors={{true: 'black', false: 'black'}} // Màu ô vuông
        />
        <Text style={styles.CheckBoxText}>
          By registering for an account and using our app, you agree to the
          following{' '}
          <Text style={{fontWeight: 'bold', color: '#000'}}>
            Terms and Condition.
          </Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 20,
        }}>
        <View style={{flex: 1, height: 1, backgroundColor: '#A9A9A9'}} />
        <Text style={{marginHorizontal: 10, fontSize: 16, color: '#A9A9A9'}}>
          or
        </Text>
        <View style={{flex: 1, height: 1, backgroundColor: '#A9A9A9'}} />
      </View>
      <View
        style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
        <Image
          source={require('../assets/google.png')}
          style={{width: 40, height: 40, marginHorizontal: 10}}
        />
        <Image
          source={require('../assets/apple.png')}
          style={{width: 40, height: 40, marginHorizontal: 10}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
    // marginTop: -70,
    color: '#000',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
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
    flex: 1,
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
  CheckBox: {
    flexDirection: 'row',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  CheckBoxText: {
    fontSize: 14,
    color: '#000',
  },
});

export default RegisterScreen;
