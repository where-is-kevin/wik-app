import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const dashboardData = [
  { id: '1', title: 'Tasks', value: '12', color: '#6C63FF' },
  { id: '2', title: 'Messages', value: '5', color: '#FF6B6B' },
  { id: '3', title: 'Events', value: '3', color: '#FFD93D' },
  { id: '4', title: 'Notifications', value: '8', color: '#4CAF50' },
];

const Dashboard = () => {
  const renderCard = ({ item }: { item: { id: string; title: string; value: string; color: string } }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: item.color }]}>
      <Text style={styles.cardValue}>{item.value}</Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <FlatList
        data={dashboardData}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={2}
        contentContainerStyle={styles.cardContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    margin: 10,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
});

export default Dashboard;