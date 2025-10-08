import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type pour toutes les routes de votre navigation
type RootStackParamList = {
  'Incidents enregistrés': undefined;
  NewsDetail: { id: number };
  // Ajoutez les autres écrans si nécessaire
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Incidents enregistrés'>;

export default function IncidentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialisation de la base de données
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('incidents.db');
        setDb(database);

        // Créer la table avec la bonne structure
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            media TEXT,
            latitude REAL,
            longitude REAL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);

        console.log('✅ Base de données initialisée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la BD:', error);
        Alert.alert('Erreur', 'Impossible d\'initialiser la base de données.');
      }
    };

    initDatabase();
  }, []);

  // Récupération de la position
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'La localisation est nécessaire.');
          return;
        }
        
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        console.error('Erreur de localisation:', error);
        Alert.alert('Erreur', 'Impossible de récupérer votre position.');
      }
    };

    getLocation();
  }, []);

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedia(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur de sélection média:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le média.');
    }
  };

  const saveIncident = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et la description.');
      return;
    }

    if (!location) {
      Alert.alert('Erreur', 'Localisation non disponible.');
      return;
    }

    if (!db) {
      Alert.alert('Erreur', 'Base de données non initialisée.');
      return;
    }

    setLoading(true);

    try {
      const result = await db.runAsync(
        'INSERT INTO incidents (title, description, media, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
        [title, description, media || '', location.latitude, location.longitude]
      );

      console.log('✅ Incident enregistré avec l\'ID:', result.lastInsertRowId);
      
      Alert.alert('Succès', 'Incident enregistré localement ✅');
      
      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setMedia(null);
    } catch (error) {
      console.error('Erreur SQL lors de l\'insertion:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'incident.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Signaler un incident</Text>

      {/* Carte */}
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} title="Votre position actuelle" />
        </MapView>
      ) : (
        <View style={[styles.map, styles.mapPlaceholder]}>
          <ActivityIndicator size="large" color="#26348B" />
          <Text style={styles.mapPlaceholderText}>Chargement de la carte...</Text>
        </View>
      )}

      {/* Formulaire */}
      <View style={styles.form}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Incendie, panne, accident..."
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Décrivez l'incident..."
          value={description}
          onChangeText={setDescription}
        />

        {/* Média */}
        <Text style={styles.label}>Photo ou vidéo (optionnel)</Text>
        <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
          <Text style={styles.mediaButtonText}>
            {media ? '✓ Média sélectionné - Changer' : '📷 Ajouter une photo ou une vidéo'}
          </Text>
        </TouchableOpacity>

        {/* Prévisualisation */}
        {media && (
          <View style={styles.previewContainer}>
            {media.endsWith('.mp4') || media.includes('video') ? (
              <View style={styles.videoPreview}>
                <Text style={styles.videoPreviewText}>🎥 Vidéo sélectionnée</Text>
              </View>
            ) : (
              <Image source={{ uri: media }} style={styles.previewImage} />
            )}
            <TouchableOpacity 
              style={styles.removeMediaButton} 
              onPress={() => setMedia(null)}
            >
              <Text style={styles.removeMediaText}>✕ Retirer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info localisation */}
        {location && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>📍 Position GPS</Text>
            <Text style={styles.locationText}>
              Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Bouton d'enregistrement */}
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            (loading || !title.trim() || !description.trim() || !location) && styles.submitButtonDisabled
          ]} 
          onPress={saveIncident}
          disabled={loading || !title.trim() || !description.trim() || !location}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Enregistrer l'incident</Text>
          )}
        </TouchableOpacity>

        {/* Bouton pour voir les incidents */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Incidents enregistrés')}
          style={styles.viewButton}
        >
          <Text style={styles.viewButtonText}>Voir les incidents enregistrés</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- Styles modernes ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginVertical: 20,
  },
  map: {
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  mapPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  mediaButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
  },
  mediaButtonText: {
    color: '#26348B',
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#26348B',
    borderStyle: 'dashed',
  },
  videoPreviewText: {
    fontSize: 18,
    color: '#26348B',
    fontWeight: '600',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeMediaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  locationInfo: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#26348B',
  },
  locationLabel: {
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  locationText: {
    color: '#475569',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#26348B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#26348B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  viewButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#26348B',
  },
  viewButtonText: {
    color: '#26348B',
    fontWeight: '700',
    fontSize: 16,
  },
});