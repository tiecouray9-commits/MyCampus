import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Liste des POI
  const pois = [
    {
      id: 1,
      title: '📚 Bibliothèque ESATIC',
      description: 'Lieu de lecture et de recherche pour les étudiants.',
      latitude: 5.290918,
      longitude: -3.998193,
    },
    {
      id: 2,
      title: '🍽️ Restaurant Universitaire',
      description: 'Cantine du campus ouverte midi et soir.',
      latitude: 5.2904,
      longitude: -3.997947,
    },
    {
      id: 3,
      title: '🏢 Administration',
      description: 'Bureaux administratifs et service scolarité.',
      latitude: 5.290842,
      longitude: -3.99878,
    },
  ];

  // 🔹 Demande de permission et récupération de la position
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

        // Animation douce de la liste
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error(error);
        setErrorMsg('Erreur lors de la récupération de la localisation.');
      }
    })();
  }, []);

  // 🔹 Ouvrir Google Maps ou Apple Maps
  const openMaps = (poi: any) => {
    if (!location) return;

    const { latitude, longitude } = location.coords;
    const destination = `${poi.latitude},${poi.longitude}`;

    const url =
      Platform.OS === 'ios'
        ? `maps://app?saddr=${latitude},${longitude}&daddr=${destination}`
        : `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', "Impossible d’ouvrir l’application Maps.");
    });
  };

  // 🔹 Gestion des erreurs
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
            pinColor={selectedPOI?.id === poi.id ? '#26348B' : '#7B4BCE'}
            onPress={() => setSelectedPOI(poi)}
          />
        ))}
      </MapView>

      {/* 🔹 Liste horizontale des POI modernisée */}
      <Animated.View style={[styles.poiList, { opacity: fadeAnim }]}>
        <FlatList
          data={pois}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isActive = selectedPOI?.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.poiCard, isActive && styles.poiCardActive]}
                onPress={() => {
                  setSelectedPOI(item);
                  openMaps(item);
                }}
                activeOpacity={0.9}
              >
                <View style={styles.poiHeader}>
                  <Text style={styles.poiEmoji}>{item.title.split(' ')[0]}</Text>
                  <Text
                    style={[styles.poiTitle, isActive && { color: '#fff' }]}
                    numberOfLines={1}
                  >
                    {item.title.replace(/^[^\w]+/, '')}
                  </Text>
                </View>

                <Text style={[styles.poiDesc, isActive && { color: '#E0E0E0' }]} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.poiActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, isActive && { backgroundColor: '#fff' }]}
                    onPress={() => openMaps(item)}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        isActive && { color: '#26348B', fontWeight: '700' },
                      ]}
                    >
                      Itinéraire
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>
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
    bottom: 25,
    paddingLeft: 10,
  },
  poiCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginRight: 14,
    padding: 14,
    borderRadius: 16,
    width: 260,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  poiCardActive: {
    backgroundColor: '#26348B',
    transform: [{ scale: 1.03 }],
    borderColor: '#26348B',
    shadowOpacity: 0.4,
  },
  poiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  poiEmoji: {
    fontSize: 22,
    marginRight: 6,
  },
  poiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    flexShrink: 1,
  },
  poiDesc: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },
  poiActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#26348B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
