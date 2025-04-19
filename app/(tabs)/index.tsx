import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const data = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/1671014/pexels-photo-1671014.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Replace with your image URL
    title: 'Art Exhibition',
    match: '85% Match',
    address: '123 Art Street',
    price: '€30.00',
    host: 'Karen Roe',
    rating: '4.8',
    attendees: 12,
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Replace with your image URL
    title: 'Music Festival',
    match: '90% Match',
    address: '456 Music Ave',
    price: '€50.00',
    host: 'John Doe',
    rating: '4.9',
    attendees: 20,
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/375889/pexels-photo-375889.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Replace with your image URL
    title: 'Food Market',
    match: '75% Match',
    address: '789 Food Blvd',
    price: 'Free',
    host: 'Jane Smith',
    rating: '4.7',
    attendees: 30,
  },
];

const SwipeableCards = () => {
  const renderItem = ({ item }: { item: typeof data[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.match}>{item.match}</Text>
        <Text style={styles.address}>{item.address}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <View style={styles.hostContainer}>
          <Text style={styles.hostedBy}>HOSTED BY</Text>
          <Text style={styles.host}>{item.host}</Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>See more</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: screenWidth * 0.9,
    height: 800,
    marginHorizontal: screenWidth * 0.05,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  image: {
    width: '100%',
    height: 500,
  },
  textContainer: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  match: {
    fontSize: 16,
    color: '#6C63FF',
    marginVertical: 5,
  },
  address: {
    fontSize: 14,
    color: '#555',
  },
  price: {
    fontSize: 14,
    color: '#000',
    marginVertical: 5,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  hostedBy: {
    fontSize: 12,
    color: '#888',
    marginRight: 5,
  },
  host: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  rating: {
    fontSize: 14,
    color: '#FFD700',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#6C63FF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SwipeableCards;