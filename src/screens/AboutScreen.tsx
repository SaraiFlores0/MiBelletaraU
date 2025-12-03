// src/screens/AboutScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackScreenProps } from '../navigation/AppNavigator';

type Props = RootStackScreenProps<'About'>;

const APP_VERSION = '1.3.0';

const AboutScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>MiBilleteraU</Text>
        <Text style={styles.version}>Versión {APP_VERSION}</Text>

        <Text style={styles.description}>
          Aplicación de billetera digital para registrar y consultar tus gastos,
          con autenticación segura, biometría y conexión a base de datos en la
          nube (Supabase).
        </Text>

        <Text style={styles.sectionTitle}>Creado por:</Text>
        <View style={styles.authorsList}>
          <Text style={styles.authorItem}>
            • Ruth Sarai Flores Alvarado
          </Text>
          <Text style={styles.authorItem}>
            • Omar Alfonso Martínez Mozo
          </Text>
          <Text style={styles.authorItem}>
            • Carlos Eduardo Núñez Urrutia
          </Text>
        </View>

        <Text style={styles.footer}>
          Proyecto final de Programación de Dispositivos Móviles.
        </Text>
      </View>
    </View>
  );
};

export default AboutScreen;

const CARD_RADIUS = 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5edff',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  version: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  authorsList: {
    marginBottom: 16,
  },
  authorItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  footer: {
    fontSize: 12,
    color: '#6b7280',
  },
});
