import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // header: {
  //   // flexDirection: 'row',
  //   // alignItems: 'center',
  //   // justifyContent: 'space-between',
  //   // marginBottom: 15,
  // },
  // logoImage: {
  //   width: '108%',
  //   marginLeft: -15,
  //   height: 210,
  //   marginTop: -15,
  //   borderBottomLeftRadius: 50, // Bo góc chỉ phía dưới bên trái
  //   borderBottomRightRadius: 50, // Bo góc chỉ phía dưới bên phải
  //   alignItems: 'center',
  //   overflow: 'hidden', // Đảm bảo phần bo góc có hiệu lực
  // },
  // profileContainer: {

  // },
  // profileImage: {
  //   width: 30,
  //   height: 30,
  //   borderRadius: 25,
  //   marginLeft:10,
  // },
  // notificationImage: {
  //   width: 30,
  //   height: 30,
  //   marginLeft: 330,
  // },
  // locationText: {
  //   fontSize: 14,
  //   color: '#888',
  // },
  // locationName: {
  //   fontSize: 16,
  //   fontWeight: 'bold',
  //   color: '#fff',
  // },
  // searchBox: {
  //   backgroundColor: '#f8f9fa',
  //   borderRadius: 10,
  //   padding: 10,
  //   marginBottom: 15,
  // },
  header: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#fff',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  overlayContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -30,
  },
  icon: {
    width: 35,
    height: 35,
    tintColor: 'white',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    marginRight: 5,
  },
  locationIcon: {
    width: 35,
    height: 35,
    tintColor: 'white',
  },
  greetingText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  questionText: {
    color: 'white',
    fontSize: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 30,
    marginTop: 20,
    padding: 10,
  },
  searchIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
    tintColor: 'white',
  },
  searchPlaceholder: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 20,
  },
  sectionHeader_1: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 20,
  },
  sectionHeader_hotel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionTitle_2: {
    fontSize: 14,
  },
  viewAll: {
    fontSize: 14,
    color: '#007bff',
  },
  cityCard: {
    alignItems: 'center',
    marginRight: 10,
  },
  cityImage: {
    width: 130,
    height: 110,
    borderRadius: 10,
  },
  cityName: {
    marginTop: 7,
    fontSize: 14,
    color: '#000',
  },
  roomTypeCard: {
    alignItems: 'center',
    marginRight: 10,
  },
  roomTypeImage: {
    width: 130,
    height: 110,
    borderRadius: 10,
  },
  roomTypeName: {
    marginTop: 7,
    fontSize: 14,
    color: '#000',
  },
  hotelCard: {
    width: 250,
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  hotelImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  hotelName: {
    fontWeight: 'bold',
    height: 40,
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: '#000',
  },
  hotelMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#555',
  },
  metaIcon: {
    width: 18,
    height: 18,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: 'transparent', // Xóa màu nền
    borderRadius: 50,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2, // Độ dày viền
    borderColor: 'black', // Màu viền xanh da trời
    width: 150,
    height: 50,
  },
  category: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedCategoryText: {
    color: 'black', // Màu chữ xanh da trời
  },
  categoryText: {
    color: '#000',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
  },
  navText: {
    fontSize: 12,
    color: '#000',
  },
  
});
