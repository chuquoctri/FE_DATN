import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

// Import hình ảnh
const wc_ks1 = require('../assets/wc_ks1.webp');
const wc_ks2 = require('../assets/wc_ks2.jpg');
const wc_ks3 = require('../assets/wc_ks3.jpg');

const originalImages = [wc_ks1, wc_ks2, wc_ks3];

// **Thêm ảnh đầu vào cuối và ảnh cuối vào đầu để tạo vòng lặp**
const images = [
  originalImages[originalImages.length - 1],
  ...originalImages,
  originalImages[0],
];

const WelcomeScreen = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const IMAGE_WIDTH = width * 0.7; // Chiều rộng ảnh chính
  const SPACING = (width - IMAGE_WIDTH) / 2; // Khoảng cách hai bên
  const [currentIndex, setCurrentIndex] = useState(1); // Bắt đầu từ ảnh thứ 1 (thực ra là ảnh 2 trong mảng)
  const autoScrollInterval = useRef(null);
  const navigation = useNavigation();

  // **Auto scroll đến ảnh giữa ngay khi vào**
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({x: IMAGE_WIDTH, animated: false});
    }, 10);
  }, []);

  // **Hàm tự động cuộn ảnh**
  const startAutoScroll = () => {
    stopAutoScroll(); // Dừng lại trước khi chạy mới
    autoScrollInterval.current = setInterval(() => {
      let newIndex = currentIndex + 1;
      if (newIndex >= images.length - 1) {
        newIndex = 1;
        scrollViewRef.current.scrollTo({
          x: IMAGE_WIDTH * newIndex,
          animated: false,
        });
      } else {
        scrollViewRef.current.scrollTo({
          x: IMAGE_WIDTH * newIndex,
          animated: true,
        });
      }
      setCurrentIndex(newIndex);
    }, 3000);
  };

  // **Dừng auto-scroll**
  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
  };

  // **Xử lý khi cuộn ảnh**
  const handleScrollEnd = event => {
    let contentOffsetX = event.nativeEvent.contentOffset.x;
    let index = Math.round(contentOffsetX / IMAGE_WIDTH);

    if (index === 0) {
      scrollViewRef.current.scrollTo({
        x: IMAGE_WIDTH * (images.length - 2),
        animated: false,
      });
      setCurrentIndex(images.length - 2);
    } else if (index === images.length - 1) {
      scrollViewRef.current.scrollTo({x: IMAGE_WIDTH, animated: false});
      setCurrentIndex(1);
    } else {
      setCurrentIndex(index);
    }

    // Dừng auto-scroll khi user cuộn, và chạy lại sau 5s
    stopAutoScroll();
    setTimeout(startAutoScroll, 5000);
  };

  // **Kích hoạt auto-scroll**
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [currentIndex]);


  return (
    <View style={styles.container}>
      {/* Slideshow */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={IMAGE_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{paddingHorizontal: SPACING}}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {
            useNativeDriver: true,
          },
        )}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}>
        {images.map((image, index) => {
          const inputRange = [
            (index - 1) * IMAGE_WIDTH,
            index * IMAGE_WIDTH,
            (index + 1) * IMAGE_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85],
            extrapolate: 'clamp',
          });

          return (
            <View key={index} style={styles.slide}>
              <Animated.Image
                source={image}
                style={[styles.image, {transform: [{scale}]}]}
              />
            </View>
          );
        })}
      </Animated.ScrollView>
      <View
        style={{
          width: '15%',
          height: 2.5,
          backgroundColor: '#000',
          marginVertical: 20,
        }}
      />

      {/* Tiêu đề */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Tìm nơi lưu trú lý tưởng của bạn chúng tôi
        </Text>
        <Text style={styles.description}>
          Khám phá nhiều khách sạn phù hợp với sở thích và nhu cầu của bạn, đảm
          bảo phù hợp cho mọi chuyến đi.
        </Text>
      </View>

      {/* Nút bấm */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Bắt đầu hành trình của bạn</Text>
      </TouchableOpacity>

      {/* Liên kết Sign in */}
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>
          Bạn đã có tài khoản? {/* Thêm một khoảng trắng ở đây */}
          <Text
            style={styles.signInLink}
            onPress={() => navigation.navigate('RegisterScreen')} // Di chuyển onPress vào đây
          >
            Đăng ký
          </Text>
        </Text>
      </View>
    </View>
  );
};

// Định nghĩa StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    marginTop:40,
    width: width * 0.7,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: height * 0.55,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  textContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    width: '90%',
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom:20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInContainer:{
    alignItems: 'center',
    flexDirection: 'row',
  },
  signInText: {
    fontSize: 14,
    color: '#666',
    marginBottom:20,
  },
  signInLink: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
