import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Button,
  Platform,
  Linking,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Liste des POI du campus
  const pois = [
    {
      id: 1,
      title: 'Bibliothèque ESATIC',
      description: 'Lieu de lecture et de recherche pour les étudiants.',
      latitude: 5.3472,
      longitude: -3.9855,
    },
    {
      id: 2,
      title: 'Restaurant Universitaire',
      description: 'Cantine du campus ouverte midi et soir.',
      latitude: 5.3465,
      longitude: -3.984,
    },
    {
      id: 3,
      title: 'Administration',
      description: 'Bureaux administratifs et service scolarité.',
      latitude: 5.348,
      longitude: -3.986,
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission refusée pour accéder à la localisation.');
          Alert.alert('Permission refusée', 'Veuillez autoriser la localisation dans les paramètres.');
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(userLocation);
      } catch (error) {
        console.error(error);
        setErrorMsg('Erreur lors de la récupération de la localisation.');
      }
    })();
  }, []);

  const openMaps = (poi: any) => {
    if (!location) return;

    const { latitude, longitude } = location.coords;
    const destination = `${poi.latitude},${poi.longitude}`;

    const url =
      Platform.OS === 'ios'
        ? `maps://app?saddr=${latitude},${longitude}&daddr=${destination}`
        : `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Erreur", "Impossible d’ouvrir l’application Maps.");
    });
  };

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#26348B" />
        <Text style={{ marginTop: 10 }}>Récupération de la position...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            coordinate={{
              latitude: poi.latitude,
              longitude: poi.longitude,
            }}
            title={poi.title}
            description={poi.description}
            pinColor={selectedPOI?.id === poi.id ? 'blue' : 'purple'}
            onPress={() => setSelectedPOI(poi)}
          />
        ))}
      </MapView>

      {/* Liste horizontale des POI */}
      <View style={styles.poiList}>
        <FlatList
          data={pois}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.poiCard,
                selectedPOI?.id === item.id && styles.poiCardActive,
              ]}
              onPress={() => {
                setSelectedPOI(item);
                openMaps(item);
              }}
            >
              <Text style={styles.poiTitle}>{item.title}</Text>
              <Text style={styles.poiDesc}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poiList: {
    position: 'absolute',
    bottom: 20,
  },
  poiCard: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 10,
    width: 230,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  poiCardActive: {
    borderWidth: 2,
    borderColor: '#26348B',
  },
  poiTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  poiDesc: {
    fontSize: 13,
    color: '#555',
  },
});
