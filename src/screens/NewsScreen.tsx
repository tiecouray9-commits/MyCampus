import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl,Image } from 'react-native';
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
}

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
      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}
    >
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
          style={{ width: '100%', height: 150, marginBottom: 8 }} 
          resizeMode="cover" 
        />
      <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
        {item.title}
      </Text>
      <Text numberOfLines={2} style={{ color: '#666', marginBottom: 4 }}>
        {item.summary}
      </Text>
      <Text style={{ fontSize: 12, color: '#999' }}>
        {new Date(item.created_at).toLocaleDateString('fr-FR')}
      </Text>
    </TouchableOpacity>
  );

  if (loading && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 16 }}>
          Erreur lors du chargement des actualités
        </Text>
        <TouchableOpacity 
          onPress={loadNews} 
          style={{ padding: 12, backgroundColor: '#007AFF', borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>Aucune actualité disponible</Text>
          </View>
        }
      />
    </View>
  );
}
