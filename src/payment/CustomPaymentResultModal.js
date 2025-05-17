// CustomPaymentResultModal.js
import React, {useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Hoặc bộ icon bạn thích

const screenHeight = Dimensions.get('window').height;

const CustomPaymentResultModal = ({
  isVisible,
  outcome,
  title,
  message,
  onClose,
  buttonText,
  navigationParams,
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Chỉ chạy animation đóng nếu modal đang thực sự hiển thị (tránh chạy khi khởi tạo)
      if (slideAnim.value !== screenHeight || opacityAnim.value !== 0) {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [isVisible, slideAnim, opacityAnim]);

  if (!isVisible && opacityAnim._value === 0) {
    // Kiểm tra _value để tránh lỗi
    return null;
  }

  const isSuccess = outcome === 'success';
  const iconName = isSuccess ? 'check-circle-outline' : 'alert-circle-outline'; // Icon dễ nhận biết
  const iconColor = isSuccess ? '#34C759' : '#FF3B30';
  const buttonStyle = isSuccess ? styles.buttonSuccess : styles.buttonFailure;
  const actualButtonText =
    buttonText || (isSuccess ? 'Về Trang Chủ' : 'Đã hiểu');

  return (
    <Modal
      transparent={true}
      animationType="none" // Sử dụng Animated API
      visible={isVisible}
      onRequestClose={() => onClose(navigationParams)}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {transform: [{translateY: slideAnim}], opacity: opacityAnim},
          ]}>
          <Icon
            name={iconName}
            size={64}
            color={iconColor}
            style={styles.icon}
          />

          <Text
            style={[styles.title, {color: isSuccess ? '#1E8E3E' : '#A50E0E'}]}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.button, buttonStyle]}
            onPress={() => {
              // Bắt đầu animation đóng trước khi gọi onClose
              Animated.parallel([
                Animated.timing(slideAnim, {
                  toValue: screenHeight,
                  duration: 200,
                  easing: Easing.in(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                  toValue: 0,
                  duration: 150,
                  useNativeDriver: true,
                }),
              ]).start(() => onClose(navigationParams)); // Gọi onClose sau khi animation hoàn tất
            }}>
            <Text style={styles.buttonText}>{actualButtonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '88%',
    maxWidth: 370,
    backgroundColor: Platform.OS === 'ios' ? '#F9F9F9' : '#FFFFFF',
    borderRadius: 18,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  icon: {
    marginBottom: 18,
  },
  title: {
    fontSize: 21,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 23,
  },
  button: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buttonSuccess: {
    backgroundColor: '#34C759', // iOS Green
  },
  buttonFailure: {
    backgroundColor: '#FF3B30', // iOS Red
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomPaymentResultModal;
