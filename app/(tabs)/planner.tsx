import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const dates = [
  { id: '1', day: 'S', date: '21' },
  { id: '2', day: 'M', date: '22' },
  { id: '3', day: 'T', date: '23' },
  { id: '4', day: 'W', date: '24', isSelected: true },
  { id: '5', day: 'T', date: '25' },
  { id: '6', day: 'F', date: '26' },
  { id: '7', day: 'S', date: '27' },
];

const events = [
  {
    id: '1',
    time: '11:35',
    title: 'Fishing contest',
    location: 'River Dawn',
    city: 'Lisbon',
    person: 'Brooklyn Williamson',
    color: '#6C63FF',
  },
  {
    id: '2',
    time: '13:15',
    title: 'Cooking competition',
    location: 'Rua das Naus',
    city: 'Lisbon',
    person: 'Julie Watson',
    color: '#E5E5E5',
  },
  {
    id: '3',
    time: '15:10',
    title: 'Cinema',
    location: 'Rua Envendia',
    city: 'Lisbon',
    person: 'Jenny Alexander',
    color: '#E5E5E5',
  },
];

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState('24');

  const renderDateItem = ({ item }: { item: { id: string; day: string; date: string } }) => (
    <TouchableOpacity
      style={[
        styles.dateItem,
        item.date === selectedDate && styles.selectedDateItem,
      ]}
      onPress={() => setSelectedDate(item.date)}
    >
      <Text style={styles.dateDay}>{item.day}</Text>
      <Text style={styles.dateNumber}>{item.date}</Text>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: typeof events[0] }) => (
    <View style={[styles.eventItem, { backgroundColor: item.color }]}>
      <Text style={styles.eventTime}>{item.time}</Text>
      <View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <Text style={styles.eventDetails}>
          {item.city} • {item.person}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Horizontal Calendar */}
      <FlatList
        data={dates}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderDateItem}
        contentContainerStyle={styles.dateList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.eventList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dateList: {
    paddingVertical: 1, // Reduce vertical padding for the date list
  },
  dateItem: {
    alignItems: 'center',
    marginHorizontal: 5, // Reduce horizontal margin between dates
    paddingVertical: 1, // Reduce vertical padding for each date item
    width: screenWidth / 7, // Divide the screen width evenly for 7 days
  },
  selectedDateItem: {
    backgroundColor: '#FF4500',
    borderRadius: 10,
    paddingHorizontal: 5, // Reduce horizontal padding for the selected date
  },
  dateDay: {
    fontSize: 12, // Reduce font size for the day
    color: '#888',
  },
  dateNumber: {
    fontSize: 14, // Reduce font size for the date number
    fontWeight: 'bold',
    color: '#000',
  },
  eventList: {
    paddingTop: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 10, // Add some spacing between items and screen edges
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
    color: '#000',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  eventLocation: {
    fontSize: 14,
    color: '#555',
  },
  eventDetails: {
    fontSize: 12,
    color: '#888',
  },
});