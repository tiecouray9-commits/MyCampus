import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, ActivityIndicator, Alert } from 'react-native';
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#26348B" />
      </View>
    );
  }

  if (!news) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Aucune actualité trouvée.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {news.image && (
        <Image 
          source={{ uri: news.image }} 
          style={{ width: '100%', height: 220 }} 
          resizeMode="cover" 
        />
      )}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
          {news.title}
        </Text>
        <Text style={{ fontSize: 13, color: '#777', marginBottom: 12 }}>
          {new Date(news.created_at).toLocaleString('fr-FR')}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: '#333' }}>
          {news.content}
        </Text>
      </View>
    </ScrollView>
  );
}