import axios from 'axios';

const API_URL = 'http://192.168.1.52:3000/news';

export const fetchNews = async (page = 1, limit = 5) => {
  try {

    const response = await axios.get(API_URL,{ timeout: 100000 });

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