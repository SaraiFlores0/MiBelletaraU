// src/screens/AddExpenseScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../services/supabaseClient';
import { RootStackScreenProps } from '../navigation/AppNavigator';

// ---------- Tipos ----------
type Props = RootStackScreenProps<'AddExpense'>;

type ExpenseFormValues = {
  name: string;
  amount: string;
};

// ---------- Helpers ----------
const normalizeDate = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const formatDate = (d: Date) =>
  d.toLocaleDateString('es-SV', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

// ---------- Validación con Yup ----------
const expenseSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .required('El nombre del gasto es obligatorio'),
  amount: Yup.string()
    .required('El monto es obligatorio')
    .test('is-number', 'Ingresa un monto válido', (value) => {
      if (!value) return false;
      const n = Number(value.replace(',', '.'));
      return !isNaN(n) && n > 0;
    }),
});

// ---------- Componente ----------
const AddExpenseScreen: React.FC<Props> = ({ navigation }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(
    null,
  );

  const handleChangeDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSubmitExpense = async (values: ExpenseFormValues) => {
    try {
      setLoadingSubmit(true);
      setStatusMsg(null);
      setStatusType(null);

      // 1. Sesión
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setStatusType('error');
        setStatusMsg('Debes iniciar sesión para registrar un gasto.');
        return;
      }

      // 2. Validar fecha (permitir hoy, no futuro)
      const selectedOnly = normalizeDate(date);
      const todayOnly = normalizeDate(new Date());

      if (selectedOnly.getTime() > todayOnly.getTime()) {
        setStatusType('error');
        setStatusMsg('La fecha del gasto no puede ser mayor que hoy.');
        return;
      }

      // 3. Parsear monto
      const parsedAmount = Number(values.amount.replace(',', '.'));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setStatusType('error');
        setStatusMsg('Ingresa un monto válido mayor que cero.');
        return;
      }

      // 4. Formatear fecha a YYYY-MM-DD
      const isoDate = selectedOnly.toISOString().split('T')[0];

      // 5. Insertar en Supabase
      const { error } = await supabase.from('expenses').insert({
        user_id: session.user.id,
        
        name: values.name.trim(),
        amount: parsedAmount,
        date: isoDate,
      });

      if (error) {
        console.log('Error insertando gasto', error.message);
        setStatusType('error');
        setStatusMsg(`Error al registrar gasto: ${error.message}`);
        return;
      }

      // 6. Éxito
      setStatusType('success');
      setStatusMsg('Gasto registrado correctamente.');
      // limpiamos formulario
      setDate(new Date());
      
    } catch (err: any) {
      console.log('Error inesperado al registrar gasto', err);
      setStatusType('error');
      setStatusMsg('Error inesperado. Intenta de nuevo.');
    } finally {
      setLoadingSubmit(false);
      // Ocultamos el mensaje después de unos segundos
      setTimeout(() => {
        setStatusMsg(null);
        setStatusType(null);
      }, 2500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBackground} />

      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.title}>Registrar gasto</Text>
        <Text style={styles.subtitle}>
          Ingresa los datos del gasto que quieres registrar.
        </Text>

        {/* Mensaje de estado */}
        {statusMsg && statusType && (
          <View
            style={[
              styles.statusBox,
              statusType === 'success'
                ? styles.statusBoxSuccess
                : styles.statusBoxError,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                statusType === 'success'
                  ? styles.statusTextSuccess
                  : styles.statusTextError,
              ]}
            >
              {statusMsg}
            </Text>
          </View>
        )}

        <Formik
          initialValues={{ name: '', amount: '' }}
          validationSchema={expenseSchema}
          onSubmit={(values, helpers) => {
            helpers.setSubmitting(true);
            handleSubmitExpense(values).finally(() => {
              helpers.setSubmitting(false);
              
              helpers.resetForm();
            });
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <>
              {/* Nombre */}
              <View style={styles.field}>
                <Text style={styles.label}>Nombre del gasto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Almuerzo"
                  placeholderTextColor="#cbd5e1"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Monto */}
              <View style={styles.field}>
                <Text style={styles.label}>Monto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 4.50"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="numeric"
                  value={values.amount}
                  onChangeText={handleChange('amount')}
                  onBlur={handleBlur('amount')}
                />
                {touched.amount && errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}
              </View>

              {/* Fecha */}
              <View style={styles.field}>
                <Text style={styles.label}>Fecha del gasto</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Solo se permiten fechas hasta hoy.
                </Text>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleChangeDate}
                  maximumDate={new Date()} 
                />
              )}

              {/* Botones */}
              <TouchableOpacity
                style={[
                  styles.button,
                  (loadingSubmit || isSubmitting) && styles.buttonDisabled,
                ]}
                onPress={() => handleSubmit()}
                disabled={loadingSubmit || isSubmitting}
              >
                {loadingSubmit || isSubmitting ? (
                  <ActivityIndicator color="#e5e7eb" />
                ) : (
                  <Text style={styles.buttonText}>Guardar gasto</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomLink}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.bottomLinkText}>← Volver</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
};

// ---------- Estilos ----------
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
    width: '90%',
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
    marginBottom: 12,
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
  dateInput: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  dateText: {
    color: '#111827',
    fontSize: 14,
  },
  helperText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    marginLeft: 4,
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
    color: '#4f46e5',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: '#ef4444',
    marginLeft: 4,
  },
  statusBox: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  statusBoxSuccess: {
    backgroundColor: '#ecfdf3',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusBoxError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusText: {
    fontSize: 12,
  },
  statusTextSuccess: {
    color: '#166534',
    fontWeight: '600',
  },
  statusTextError: {
    color: '#b91c1c',
    fontWeight: '600',
  },
});

export default AddExpenseScreen;
