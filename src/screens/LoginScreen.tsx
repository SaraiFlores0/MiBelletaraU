import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../services/supabaseClient';

// Acá importamos los ervicios de Biometria
import {
  requestBiometricAuth,
  checkBiometricSupport,
} from '../services/biometricAuth';


type Props = {
  navigation: any;
};

type LoginFormValues = {
  email: string;
  password: string;
};

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Correo inválido')
    .required('El correo es obligatorio'),
  password: Yup.string().required('La contraseña es obligatoria'),
});

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // adaptamos lo necesario el handleLogin para la huella
  const handleLogin = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // acá autenticamos con supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        setErrorMessage('Correo o contraseña incorrectos.');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      const session = data.session;
      const user = data.user;

      if (!session || !user) {
        setErrorMessage('No se pudo crear la sesión, intenta de nuevo.');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      // Actualiamos el perfil
      const fullName = (user.user_metadata as any)?.full_name ?? '';

      await supabase.from('profiles').upsert(
        [
          {
            id: user.id,
            full_name: fullName,
          },
        ],
        { onConflict: 'id' }
      );

      // Acá verificamos si el dispositivo soporta utilizar huella 
      const canUseBiometrics = await checkBiometricSupport();

      if (canUseBiometrics) {
        // Acá pedimos auntenticación de huella
        const biometricSuccess = await requestBiometricAuth();

        if (!biometricSuccess) {
          setErrorMessage('Autenticación biométrica cancelada.');
          setLoading(false);
          return;
        }
      }

      // Si todo sale bien, navegamos a home
      navigation.replace('Home');
    } catch (err: any) {
      setErrorMessage(
        err?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.'
      );
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBackground} />

      <View style={styles.card}>
        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabActiveText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabInactive}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.tabInactiveText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Bienvenido de nuevo 👋</Text>
        <Text style={styles.subtitle}>Inicia sesión para ver tus gastos.</Text>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Correo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tucorreo@email.com"
                  placeholderTextColor="#cbd5e1"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={values.email}
                  onChangeText={(text) => {
                    setErrorMessage(null);
                    handleChange('email')(text);
                  }}
                  onBlur={handleBlur('email')}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor="#cbd5e1"
                  secureTextEntry
                  value={values.password}
                  onChangeText={(text) => {
                    setErrorMessage(null);
                    handleChange('password')(text);
                  }}
                  onBlur={handleBlur('password')}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Mensaje de error general */}
              {errorMessage && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{errorMessage}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => handleSubmit()}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#e5e7eb" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.bottomLinkText}>
                  ¿No tienes cuenta?{' '}
                  <Text style={styles.bottomLinkTextBold}>Regístrate</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
};

const CARD_RADIUS = 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5edff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#4f46e5',
  },
  card: {
    width: '88%',
    backgroundColor: 'white',
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  tabActive: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 8,
    alignItems: 'center',
  },
  tabInactive: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    alignItems: 'center',
  },
  tabActiveText: {
    color: '#111827',
    fontWeight: '600',
  },
  tabInactiveText: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 18,
  },
  field: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#111827',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  bottomLinkText: {
    fontSize: 13,
    color: '#6b7280',
  },
  bottomLinkTextBold: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: '#ef4444',
    marginLeft: 4,
  },
  errorBox: {
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  errorBoxText: {
    fontSize: 12,
    color: '#b91c1c',
    textAlign: 'center',
  },
});

export default LoginScreen;
