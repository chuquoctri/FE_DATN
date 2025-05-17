import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
// login- registerregister
import WelcomeScreen from '../Login/WelcomeScreen';
import LoginScreen from '../Login/LoginScreen';
import RegisterScreen from '../Login/RegisterScreen';
import VerifyScreen from '../Login/VerifyScreen';
import UpdateInfoScreen from '../Login/UpdateInfoScreen';
import ForgotPasswordScreen from '../Login/ForgotPasswordScreen';
import VerifyOTPScreen from '../Login/VerifyOTPScreen';

// homehome
import HomeScreen from '../Home/home/HomeScreen';
import CityHotelsScreen from '../Home/city_hotels/CityHotelsScreen';
import RoomTypeHotelsScreen from '../Home/room_type/RoomTypeHotelsScreen';
import AllCitiesScreen from '../Home/view_all/AllCitiesScreen';
import AllRoomTypesScreen from '../Home/view_all/AllRoomTypesScreen';
import AllHotelsScreen from '../Home/view_all/AllHotelsScreen';

// Chi tiết khách sạnsạn
import HotelDetailsScreen from '../hotel_detail/HotelDetailsScreen';

// phòngphòng
import AllRoomsScreen from '../room/all_room/HotelRoomList';
import RoomDetailScreen from '../room/roomdetail_booking/RoomDetailScreen';

// danh sách đặt phòng cần thanh toántoán
import ListBooking from '../ListBooking/ListBooking';

// vẫn là homehome
import SavedScreen from '../Home/saved/SavedScreen';
import VoucherScreen from '../Home/vouchers/VoucherScreen';
import ProfileScreen from '../Home/profile/ProfileScreen';
import UpdateProfile from '../Home/profile/Updateprofile';
// Thanh toántoán
import PaymentScreen from '../payment/PaymentScreen';
import VnpayWebView from '../payment/VnpayWebView';

// đánh giágiá
import PendingReviewsScreen from '../Home/profile/PendingReviewsScreen';

// lịch sử giao dịch
import TransactionHistoryScreen from '../Home/profile/TransactionHistoryScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        // initialRouteName="UpdateInfoScreen"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="VerifyScreen" component={VerifyScreen} />
        <Stack.Screen name="UpdateInfoScreen" component={UpdateInfoScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen name="VerifyOTPScreen" component={VerifyOTPScreen} />
        <Stack.Screen name="CityHotels" component={CityHotelsScreen} />
        <Stack.Screen name="RoomTypeHotels" component={RoomTypeHotelsScreen} />
        <Stack.Screen name="AllCities" component={AllCitiesScreen} />
        <Stack.Screen name="AllRoomTypes" component={AllRoomTypesScreen} />
        <Stack.Screen name="AllHotels" component={AllHotelsScreen} />
        <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} />
        <Stack.Screen name="AllRoomsScreen" component={AllRoomsScreen} />
        <Stack.Screen name="RoomDetailScreen" component={RoomDetailScreen} />
        <Stack.Screen name="ListBooking" component={ListBooking} />
        <Stack.Screen name="SavedScreen" component={SavedScreen} />
        <Stack.Screen name="VoucherScreen" component={VoucherScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} />

        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="VnpayWebView" component={VnpayWebView} />

        <Stack.Screen name="PendingReviews" component={PendingReviewsScreen} />
        
        <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
