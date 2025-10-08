import React, { useState, useEffect } from "react";
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  "Incidents enregistrés": undefined;
  NewsDetail: { id: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Incidents enregistrés">;

const IncidentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>("");
  const [description, setDescription] = useState("");
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // 🔹 Initialisation de la base de données
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync("incidents.db");
        setDb(database);

        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mediaUri TEXT,
            latitude REAL,
            longitude REAL,
            description TEXT,
            date TEXT
          );
        `);
      } catch (error) {
        console.error("Erreur d'initialisation de la base de données :", error);
        Alert.alert("Erreur", "Impossible d'initialiser la base de données.");
      }
    };

    initDatabase();
  }, []);

  // 🔹 Fonction pour récupérer l'adresse à partir des coordonnées
  const getAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });
      
      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const addressParts = [
          addr.name,
          addr.street,
          addr.postalCode,
          addr.city,
          addr.region,
          addr.country
        ].filter(part => part).join(', ');
        
        setAddress(addressParts || "Adresse non disponible");
      }
    } catch (error) {
      console.error("Erreur géocodage inverse:", error);
      setAddress("Adresse non disponible");
    }
  };

  // 🔹 Fonction pour récupérer la position
  const getLocation = async () => {
    setGettingLocation(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Impossible d'accéder à la localisation.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      const newLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      
      setLocation(newLocation);
      await getAddressFromCoords(newLocation.latitude, newLocation.longitude);
      
    } catch (error) {
      console.error("Erreur localisation:", error);
      Alert.alert("Erreur", "Impossible d'obtenir la localisation.");
    } finally {
      setGettingLocation(false);
    }
  };

  // 🔹 Ouvrir la localisation dans Maps
  const openInMaps = () => {
    if (!location) return;
    
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    Linking.openURL(url).catch(err => 
      Alert.alert("Erreur", "Impossible d'ouvrir la carte.")
    );
  };

  // 🔹 Fonction pour choisir un média (photo ou vidéo)
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  // 🔹 Enregistrement local dans SQLite
  const saveIncident = async () => {
    if (!mediaUri || !location) {
      Alert.alert("Erreur", "Veuillez ajouter un média et activer la localisation.");
      return;
    }

    if (!db) {
      Alert.alert("Erreur", "Base de données non initialisée.");
      return;
    }

    const date = new Date().toISOString();

    try {
      await db.runAsync(
        "INSERT INTO incidents (mediaUri, latitude, longitude, description, date) VALUES (?, ?, ?, ?, ?)",
        [mediaUri, location.latitude, location.longitude, description, date]
      );

      Alert.alert("Succès", "Incident enregistré localement !");
      setMediaUri(null);
      setDescription("");
      setLocation(null);
      setAddress("");
    } catch (error) {
      console.error("Erreur SQLite :", error);
      Alert.alert("Erreur", "Échec de l'enregistrement local.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Signaler un Incident</Text>
        <Text style={styles.subtitle}>
          Documentez un problème sur le campus
        </Text>
      </View>

      {/* Section Média */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Média</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={pickMedia}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Choisir un média</Text>
          </View>
        </TouchableOpacity>

        {mediaUri && (
          <View style={styles.previewContainer}>
            {mediaUri.endsWith(".mp4") || mediaUri.includes("video") ? (
              <View style={styles.videoPreview}>
                <Ionicons name="videocam" size={40} color="#4CAF50" />
                <Text style={styles.previewText}>Vidéo sélectionnée</Text>
              </View>
            ) : (
              <Image source={{ uri: mediaUri }} style={styles.previewImage} />
            )}
          </View>
        )}
      </View>

      {/* Section Localisation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localisation</Text>
        <TouchableOpacity 
          style={[styles.button, gettingLocation && styles.disabledButton]} 
          onPress={getLocation}
          activeOpacity={0.7}
          disabled={gettingLocation}
        >
          <View style={styles.buttonContent}>
            {gettingLocation ? (
              <Ionicons name="location" size={20} color="#FFFFFF" />
            ) : (
              <Ionicons name="location" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {gettingLocation ? "Obtention de la position..." : "Obtenir la position"}
            </Text>
          </View>
        </TouchableOpacity>

        {location && (
          <View style={styles.locationPreview}>
            <View style={styles.locationHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.locationTitle}>Position obtenue</Text>
            </View>
            
            <View style={styles.coordinatesContainer}>
              <View style={styles.coordRow}>
                <Ionicons name="latitude" size={14} color="#7F8C8D" />
                <Text style={styles.coordLabel}>Latitude:</Text>
                <Text style={styles.coordValue}>{location.latitude.toFixed(6)}</Text>
              </View>
              
              <View style={styles.coordRow}>
                <Ionicons name="longitude" size={14} color="#7F8C8D" />
                <Text style={styles.coordLabel}>Longitude:</Text>
                <Text style={styles.coordValue}>{location.longitude.toFixed(6)}</Text>
              </View>
            </View>

            {address && (
              <View style={styles.addressContainer}>
                <Ionicons name="navigate" size={14} color="#4CAF50" />
                <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.mapButton}
              onPress={openInMaps}
              activeOpacity={0.7}
            >
              <View style={styles.mapButtonContent}>
                <Ionicons name="map" size={16} color="#4CAF50" />
                <Text style={styles.mapButtonText}>Voir sur la carte</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Section Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Décrivez l'incident (optionnel)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={saveIncident}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="save" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Enregistrer l'incident</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => navigation.navigate("Incidents enregistrés")}
          style={[styles.button, styles.secondaryButton]}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="list" size={20} color="#4CAF50" />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Voir les incidents
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default IncidentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#4CAF50",
  },
  previewContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  videoPreview: {
    width: 200,
    height: 120,
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  locationPreview: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8F5E8",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  coordinatesContainer: {
    gap: 8,
    marginBottom: 12,
  },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  coordLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "500",
    minWidth: 60,
  },
  coordValue: {
    fontSize: 12,
    color: "#2C3E50",
    fontWeight: "600",
    fontFamily: 'monospace',
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
  },
  addressText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    flex: 1,
  },
  mapButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  mapButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapButtonText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ECF0F1",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#2C3E50",
    backgroundColor: "#F8F9FA",
    minHeight: 100,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
});