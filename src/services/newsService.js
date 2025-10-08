import axios from 'axios';

// ⚠️ Mets ici ton IP locale si tu testes sur Expo Go
const API_URL = 'http://192.168.56.1:3000/news';

export const fetchNews = async (page = 1, limit = 5) => {
  try {
    // Ton API Express ne gère pas la pagination, donc on ignore les params
    // et on retourne toutes les news
    const response = await axios.get(API_URL);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Erreur serveur');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des actualités :', error);
    throw error;
  }
};

export const fetchNewsById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Erreur lors de la récupération de lactualité.');
    }
  } catch (error) {
    console.error('Erreur fetchNewsById:', error);
    throw error;
  }
};