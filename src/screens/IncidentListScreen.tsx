import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import * as SQLite from 'expo-sqlite';

interface Incident {
  id: number;
  title: string;
  description: string;
  media: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export default function IncidentListScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('incidents.db');
        setDb(database);

        // Créer la table si elle n'existe pas
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

        console.log('✅ Base de données initialisée');
        await fetchIncidents(database);
      } catch (error) {
        console.error('Erreur initialisation DB:', error);
        Alert.alert('Erreur', 'Impossible d\'initialiser la base de données.');
        setLoading(false);
      }
    };

    initDatabase();
  }, []);

  const fetchIncidents = async (database?: SQLite.SQLiteDatabase) => {
    const dbToUse = database || db;
    if (!dbToUse) return;

    try {
      setLoading(true);
      const result = await dbToUse.getAllAsync<Incident>(
        'SELECT * FROM incidents ORDER BY id DESC'
      );
      setIncidents(result);
      console.log(`✅ ${result.length} incidents chargés`);
    } catch (error) {
      console.error('Erreur chargement incidents:', error);
      Alert.alert('Erreur', 'Impossible de charger les incidents.');
    } finally {
      setLoading(false);
    }
  };

  const deleteIncident = (id: number) => {
    Alert.alert('Confirmation', 'Supprimer définitivement cet incident ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          if (!db) return;

          try {
            await db.runAsync('DELETE FROM incidents WHERE id = ?', [id]);
            console.log(`✅ Incident ${id} supprimé`);
            Alert.alert('Succès', 'Incident supprimé avec succès.');
            await fetchIncidents();
          } catch (error) {
            console.error('Erreur suppression:', error);
            Alert.alert('Erreur', 'Impossible de supprimer l\'incident.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Incident }) => (
    <View style={styles.card}>
      {item.media && (item.media.endsWith('.mp4') || item.media.includes('video')) ? (
        <View style={styles.videoPreview}>
          <Text style={styles.videoText}>🎥 Vidéo</Text>
        </View>
      ) : item.media ? (
        <Image source={{ uri: item.media }} style={styles.image} />
      ) : (
        <View style={styles.noMedia}>
          <Text style={styles.noMediaText}>📷</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{item.title || 'Incident sans titre'}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description || 'Aucune description fournie.'}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.coords}>
            📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
          <Text style={styles.date}>
            🕒 {new Date(item.created_at).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteIncident(item.id)}
        >
          <Text style={styles.deleteText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#26348B" />
        <Text style={styles.loadingText}>Chargement des incidents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 Incidents enregistrés</Text>

      {incidents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Aucun incident enregistré pour le moment.</Text>
          <Text style={styles.emptySubText}>
            Les incidents signalés apparaîtront ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  videoPreview: {
    width: 110,
    height: 110,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#26348B',
    fontWeight: '600',
    fontSize: 16,
  },
  noMedia: {
    width: 110,
    height: 110,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMediaText: {
    fontSize: 32,
    opacity: 0.3,
  },
  info: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
  meta: {
    marginTop: 8,
  },
  coords: {
    fontSize: 12,
    color: '#64748B',
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#374151',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});