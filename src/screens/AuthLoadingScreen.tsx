// src/screens/AuthLoadingScreen.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Image, Text, StyleSheet } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { RootStackScreenProps } from '../navigation/AppNavigator';

type Props = RootStackScreenProps<'AuthLoading'>;

const AuthLoadingScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    checkSession();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Mi Billetera</Text>
      <ActivityIndicator size="large" color="#4f46e5" />
      <Text style={styles.subtitle}>Cargando tu sesión...</Text>
    </View>
  );
};

export default AuthLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5edff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
  },
});
