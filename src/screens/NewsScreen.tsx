import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchNews } from '../services/newsService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  NewsDetail: { id: number };
};

type NewsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewsDetail'>;

interface NewsScreenProps {
  navigation: NewsScreenNavigationProp;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  image?: string;
  created_at: string;
  content: string;
  category?: string;
}

// Fonction pour obtenir l'icône selon la catégorie ou le contenu
const getNewsIcon = (item: NewsItem) => {
  const title = item.title?.toLowerCase() || '';
  const summary = item.summary?.toLowerCase() || '';
  const category = item.category?.toLowerCase() || '';

  // Détection basée sur le contenu
  if (title.includes('événement') || title.includes('évènement') || title.includes('événementiel')) {
    return 'calendar';
  } else if (title.includes('sport') || summary.includes('sport')) {
    return 'basketball';
  } else if (title.includes('culture') || summary.includes('culture')) {
    return 'color-palette';
  } else if (title.includes('éducation') || title.includes('education') || title.includes('cours')) {
    return 'school';
  } else if (title.includes('réunion') || title.includes('meeting')) {
    return 'people';
  } else if (title.includes('urgence') || title.includes('important') || title.includes('alert')) {
    return 'warning';
  } else if (title.includes('inscription') || title.includes('admission')) {
    return 'document-text';
  } else if (title.includes('bourse') || title.includes('finance')) {
    return 'cash';
  } else if (title.includes('international') || title.includes('échange')) {
    return 'airplane';
  } else if (title.includes('numérique') || title.includes('digital')) {
    return 'laptop';
  } else if (title.includes('recherche') || title.includes('science')) {
    return 'flask';
  } else if (title.includes('bibliothèque') || title.includes('library')) {
    return 'library';
  } else if (title.includes('restaurant') || title.includes('cafétéria') || summary.includes('manger')) {
    return 'restaurant';
  } else if (title.includes('transport') || title.includes('bus')) {
    return 'bus';
  } else if (title.includes('logement') || title.includes('résidence')) {
    return 'home';
  } else if (title.includes('emploi') || title.includes('stage') || title.includes('carrière')) {
    return 'briefcase';
  } else if (title.includes('étudiant') || title.includes('vie étudiante')) {
    return 'people-circle';
  } else if (title.includes('vacances') || title.includes('congé')) {
    return 'sunny';
  } else if (title.includes('exam') || title.includes('concours')) {
    return 'create';
  } else {
    // Icônes par défaut basées sur d'autres critères
    const randomIcons = ['megaphone', 'newspaper', 'information-circle', 'sparkles'];
    return randomIcons[Math.floor(Math.random() * randomIcons.length)];
  }
};

export default function NewsScreen({ navigation }: NewsScreenProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const data = await fetchNews();
      setItems(data);
    } catch (err) {
      setError(true);
      console.error('Erreur lors du chargement des actualités:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchNews();
      setItems(data);
      setError(false);
    } catch (err) {
      setError(true);
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('NewsDetail', { id: item.id })} 
      style={styles.newsCard}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={getNewsIcon(item)} size={20} color="#4CAF50" />
        </View>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={styles.newsImage} 
        resizeMode="cover" 
      />
      
      <View style={styles.textContent}>
        <Text style={styles.newsTitle}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.newsSummary}>
          {item.summary}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.readMore}>
            <Ionicons name="arrow-forward-circle" size={16} color="#4CAF50" />
            <Text style={styles.readMoreText}>Lire la suite</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des actualités...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning-outline" size={50} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Oups !</Text>
        <Text style={styles.errorText}>
          Erreur lors du chargement des actualités
        </Text>
        <TouchableOpacity 
          onPress={loadNews} 
          style={styles.retryButton}
        >
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={60} color="#CCCCCC" />
            <Text style={styles.emptyText}>Aucune actualité disponible</Text>
            <Text style={styles.emptySubText}>
              Revenez plus tard pour découvrir les dernières nouvelles
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    backgroundColor: '#E8F5E8',
    padding: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  newsImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  textContent: {
    paddingHorizontal: 4,
  },
  newsTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 6,
    lineHeight: 20,
  },
  newsSummary: {
    color: '#7F8C8D',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readMoreText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
});