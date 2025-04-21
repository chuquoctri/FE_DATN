import React, {useState} from 'react';
import {View, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import {WebView} from 'react-native-webview';

const MomoWebView = ({route, navigation}) => {
  const {paymentUrl, paymentInfo} = route.params;
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigationStateChange = navState => {
    const {url} = navState;
    console.log('Current URL:', url);

    if (url.includes('thankyou.html')) {
      const success = url.includes('status=success');
      const cancel = url.includes('status=cancel');

      if (success) {
        navigation.replace('BookingSuccess', {paymentInfo});
      } else if (cancel) {
        Alert.alert('Thông báo', 'Bạn đã hủy thanh toán', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }
    }
  };

  const handleLoadError = () => {
    Alert.alert('Lỗi', 'Không thể kết nối đến MoMo', [
      {text: 'Thử lại', onPress: () => setIsLoading(true)},
      {text: 'Đóng', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#A50064"
          style={styles.loadingIndicator}
        />
      )}
      <WebView
        source={{uri: paymentUrl}}
        onLoadEnd={() => setIsLoading(false)}
        onError={handleLoadError}
        onHttpError={handleLoadError}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 10,
  },
});

export default MomoWebView;
