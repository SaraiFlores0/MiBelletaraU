// src/screens/RegisterScreen.tsx
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
  confirmPassword: string;
};

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('El nombre es obligatorio')
    .test(
      'solo-letras',
      'Solo se permiten letras y espacios',
      (value) => !value || nameRegex.test(value)
    )
    .test(
      'sin-dobles-espacios',
      'No uses espacios dobles',
      (value) => !value || !/\s{2,}/.test(value)
    )
    .test(
      'nombre-completo',
      'Ingresa nombre y apellido',
      (value) => {
        if (!value) return false;
        const partes = value.trim().split(/\s+/);
        return partes.length >= 2;
      }
    ),
  email: Yup.string()
    .email('Correo inválido')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .required('La contraseña es obligatoria')
    .min(8, 'Mínimo 8 caracteres')
    .matches(/[A-Za-z]/, 'Debe incluir letras')
    .matches(/\d/, 'Debe incluir números')
    .matches(/[^A-Za-z0-9]/, 'Debe incluir al menos un carácter especial')
    .test(
      'no-comun',
      'La contraseña es muy débil, intenta con otra.',
      (value) => {
        if (!value) return false;
        const weak = [
          '123456',
          '1234567',
          '12345678',
          '123456789',
          'password',
          'contraseña',
        ];
        return !weak.includes(value);
      }
    ),
  confirmPassword: Yup.string()
    .required('Confirma tu contraseña')
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
});

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (
    values: RegisterFormValues,
    resetForm: () => void
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
          'Registro no completado. Intenta de nuevo en unos minutos.'
        );
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      // El perfil en "profiles" se creará automáticamente en el primer login.
      setSuccessMessage(
        'Cuenta creada correctamente 🎉 Ahora puedes iniciar sesión.'
      );
      resetForm();
      setTimeout(() => setSuccessMessage(null), 3000);
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
          initialValues={{
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
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
              {/* Nombre */}
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

              {/* Correo */}
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

              {/* Contraseña */}
              <View style={styles.field}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="#cbd5e1"
                    secureTextEntry={!showPassword}
                    value={values.password}
                    onChangeText={(text) => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      handleChange('password')(text);
                    }}
                    onBlur={handleBlur('password')}
                  />
                  <TouchableOpacity
                    style={styles.toggleSecure}
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    <Text style={styles.toggleSecureText}>
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirmar contraseña */}
              <View style={styles.field}>
                <Text style={styles.label}>Confirmar contraseña</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="#cbd5e1"
                    secureTextEntry={!showConfirmPassword}
                    value={values.confirmPassword}
                    onChangeText={(text) => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      handleChange('confirmPassword')(text);
                    }}
                    onBlur={handleBlur('confirmPassword')}
                  />
                  <TouchableOpacity
                    style={styles.toggleSecure}
                    onPress={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                  >
                    <Text style={styles.toggleSecureText}>
                      {showConfirmPassword ? 'Ocultar' : 'Ver'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {errors.confirmPassword}
                  </Text>
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
                  <Text style={styles.bottomLinkTextBold}>
                    Inicia sesión
                  </Text>
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
    paddingRight: 70, // espacio para el botón Ver/Ocultar
  },
  passwordWrapper: {
    position: 'relative',
  },
  toggleSecure: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  toggleSecureText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
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
