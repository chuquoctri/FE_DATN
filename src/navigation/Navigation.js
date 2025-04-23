import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import WelcomeScreen from '../Login/WelcomeScreen';
import LoginScreen from '../Login/LoginScreen';
import RegisterScreen from '../Login/RegisterScreen';
import VerifyScreen from '../Login/VerifyScreen';
import UpdateInfoScreen from '../Login/UpdateInfoScreen';
import ForgotPasswordScreen from '../Login/ForgotPasswordScreen';
import VerifyOTPScreen from '../Login/VerifyOTPScreen';
import HomeScreen from '../Home/home/HomeScreen';
import CityHotelsScreen from '../Home/city_hotels/CityHotelsScreen';
import RoomTypeHotelsScreen from '../Home/room_type/RoomTypeHotelsScreen';
import AllCitiesScreen from '../Home/view_all/AllCitiesScreen';
import AllRoomTypesScreen from '../Home/view_all/AllRoomTypesScreen';
import AllHotelsScreen from '../Home/view_all/AllHotelsScreen';
import HotelDetailsScreen from '../hotel_detail/HotelDetailsScreen';
import AllRoomsScreen from '../room/all_room/HotelRoomList';
import RoomDetailScreen from '../room/roomdetail_booking/RoomDetailScreen';
import ListBooking from '../ListBooking/ListBooking';
import PaymentResult from '../payment/PaymentResult';
import VNPayPayment from '../payment/VNPayPayment';
import PaymentScreen from '../payment/PaymentScreen';
import VNPayWebView from '../payment/VNPayWebView';
import MoMoWebView from '../payment/MoMoWebView';
import BookingSuccess from '../payment/BookingSuccess';
import SavedScreen from '../Home/saved/SavedScreen';
import VoucherScreen from '../Home/vouchers/VoucherScreen';
import ProfileScreen from '../Home/profile/ProfileScreen';
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
        <Stack.Screen name="PaymentResult" component={PaymentResult} />
        <Stack.Screen name="VNPayPayment" component={VNPayPayment} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="VNPayWebView" component={VNPayWebView} />
        <Stack.Screen name="MoMoWebView" component={MoMoWebView} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccess} />
        <Stack.Screen name="SavedScreen" component={SavedScreen} />
        <Stack.Screen name="VoucherScreen" component={VoucherScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
