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

type Props = {
  navigation: any;
};

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
};

const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('El nombre es obligatorio')
    .test(
      'nombre-completo',
      'Ingresa nombre y apellido',
      (value) => {
        if (!value) return false;
        const partes = value.trim().split(/\s+/);
        return partes.length >= 2;
      },
    ),
  email: Yup.string()
    .email('Correo inválido')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .min(6, 'Mínimo 6 caracteres')
    .required('La contraseña es obligatoria'),
});

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (
    values: RegisterFormValues,
    resetForm: () => void,
  ) => {
    try {
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            full_name: values.fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'No se pudo crear la cuenta.');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      if (!data.user) {
        setErrorMessage(
          'Registro no completado. Intenta de nuevo en unos minutos.',
        );
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      // En este punto la cuenta está creada en Auth.
      // El perfil en "profiles" se creará automáticamente
      // en el primer inicio de sesión (LoginScreen).

      setSuccessMessage(
        'Cuenta creada correctamente 🎉 Ahora puedes iniciar sesión.',
      );
      resetForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(
        err?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.',
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
          <TouchableOpacity
            style={styles.tabInactive}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.tabInactiveText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabActiveText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Crear cuenta ✨</Text>
        <Text style={styles.subtitle}>
          Registra tu cuenta para usar tu billetera digital.
        </Text>

        <Formik
          initialValues={{ fullName: '', email: '', password: '' }}
          validationSchema={registerSchema}
          onSubmit={(values, { resetForm }) =>
            handleRegister(values, resetForm)
          }
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
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Juan Pérez"
                  placeholderTextColor="#cbd5e1"
                  value={values.fullName}
                  onChangeText={(text) => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    handleChange('fullName')(text);
                  }}
                  onBlur={handleBlur('fullName')}
                />
                {touched.fullName && errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>

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
                    setSuccessMessage(null);
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
                    setSuccessMessage(null);
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

              {/* Mensaje de éxito */}
              {successMessage && (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>{successMessage}</Text>
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
                  <Text style={styles.buttonText}>Registrarse</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.bottomLinkText}>
                  ¿Ya tienes cuenta?{' '}
                  <Text style={styles.bottomLinkTextBold}>Inicia sesión</Text>
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
  successBox: {
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
  },
  successText: {
    fontSize: 12,
    color: '#166534',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RegisterScreen;
