import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { fetchNewsById } from '../services/newsService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  NewsDetail: { id: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'NewsDetail'>;

interface News {
  id: number;
  title: string;
  summary: string;
  image?: string;
  created_at: string;
  content: string;
}

export default function NewsDetail({ route }: Props) {
  const { id } = route.params;
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNewsById(id);
        setNews(data);
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', "Impossible de charger l'actualité.");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement de l'actualité...</Text>
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oups !</Text>
        <Text style={styles.errorText}>Aucune actualité trouvée.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {news.image && (
        <Image 
          source={{ uri: news.image }} 
          style={styles.newsImage} 
          resizeMode="cover" 
        />
      )}
      <View style={styles.contentContainer}>
        <Text style={styles.newsTitle}>
          {news.title}
        </Text>
        
        <View style={styles.dateContainer}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {new Date(news.created_at).toLocaleString('fr-FR')}
            </Text>
          </View>
        </View>

        <Text style={styles.newsSummary}>
          {news.summary}
        </Text>

        <View style={styles.contentDivider} />

        <Text style={styles.newsContent}>
          {news.content}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  newsImage: {
    width: '100%',
    height: 220,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    lineHeight: 30,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  newsSummary: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  contentDivider: {
    height: 1,
    backgroundColor: '#ECF0F1',
    marginBottom: 16,
  },
  newsContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
  },
});