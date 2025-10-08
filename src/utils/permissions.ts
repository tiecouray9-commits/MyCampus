import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Demande la permission de géolocalisation
export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission refusée', 'La localisation est nécessaire pour signaler un incident.');
    return false;
  }
  return true;
};

// Demande la permission de la caméra / galerie
export const requestMediaPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted' || mediaStatus !== 'granted') {
    Alert.alert('Permission refusée', 'L’accès à la caméra et à la galerie est requis.');
    return false;
  }
  return true;
};
