// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RootStackScreenProps } from '../navigation/AppNavigator';
import { getCurrentUserProfile, signOut } from '../services/supabaseClient';

type Props = RootStackScreenProps<'Profile'>;

type ProfileData = {
  fullName: string | null;
  email: string | null;
  createdAt: string | null;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUserProfile();
      if (data) {
        setProfile({
          fullName: data.full_name,
          email: data.email,
          createdAt: data.created_at,
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error cargando el perfil', error);
      Alert.alert('Error', 'No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  const formattedDate =
    profile?.createdAt != null
      ? new Date(profile.createdAt).toLocaleDateString()
      : '—';

  return (
    <View style={styles.container}>
      {/* Header simple con título */}
      <Text style={styles.title}>Perfil de usuario</Text>

      {/* Tarjeta blanca redondeada */}
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre completo</Text>
              <Text style={styles.value}>{profile?.fullName ?? '—'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Correo</Text>
              <Text style={styles.value}>{profile?.email ?? '—'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Fecha de registro</Text>
              <Text style={styles.value}>{formattedDate}</Text>
            </View>
          </>
        )}
      </View>

      {/* Botón salir grande abajo */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const PURPLE = '#4F46E5';
const LIGHT_PURPLE_BG = '#EEF2FF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PURPLE,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  card: {
    backgroundColor: LIGHT_PURPLE_BG,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
