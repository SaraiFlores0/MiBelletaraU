// src/screens/EditExpenseScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { RootStackScreenProps } from '../navigation/AppNavigator';
import { updateExpense, deleteExpense } from '../services/supabaseClient';

type Props = RootStackScreenProps<'EditExpense'>;

const EditExpenseScreen: React.FC<Props> = ({ route, navigation }) => {
  const { expense } = route.params;

  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(String(expense.amount));
  const [date, setDate] = useState(expense.date); // 'YYYY-MM-DD'
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [dateError, setDateError] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = () => {
    let valid = true;
    setNameError('');
    setAmountError('');
    setDateError('');
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('El nombre es obligatorio.');
      valid = false;
    }

    const num = Number(amount);
    if (!amount.trim() || Number.isNaN(num) || num <= 0) {
      setAmountError('Ingresa un monto válido mayor que 0.');
      valid = false;
    }

    // Validar formato de fecha: YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      setDateError('La fecha debe tener el formato YYYY-MM-DD.');
      valid = false;
    } else {
      const inputDate = new Date(date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (inputDate.getTime() > today.getTime()) {
        setDateError('La fecha no puede ser mayor a hoy.');
        valid = false;
      }
    }

    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await updateExpense(expense.id, {
        name: name.trim(),
        amount: Number(amount),
        date,
      });

      setSuccessMessage('Gasto actualizado correctamente ✅');

      // Pequeña pausa para que se vea el mensaje y luego regresar
      setTimeout(() => {
        setSuccessMessage(null);
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo actualizar el gasto.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar gasto',
      `¿Seguro que deseas eliminar "${expense.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteExpense(expense.id);
              Alert.alert('Eliminado', 'El gasto ha sido eliminado.', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'No se pudo eliminar el gasto.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#e5edff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Editar gasto</Text>
          <Text style={styles.subtitle}>
            Actualiza los datos de este movimiento.
          </Text>

          {/* Nombre */}
          <View style={styles.field}>
            <Text style={styles.label}>Nombre del gasto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Almuerzo, Recarga, Transporte"
              placeholderTextColor="#cbd5e1"
              value={name}
              onChangeText={setName}
            />
            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
          </View>

          {/* Monto */}
          <View style={styles.field}>
            <Text style={styles.label}>Monto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 5.50"
              placeholderTextColor="#cbd5e1"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            {!!amountError && (
              <Text style={styles.errorText}>{amountError}</Text>
            )}
          </View>

          {/* Fecha */}
          <View style={styles.field}>
            <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-12-03"
              placeholderTextColor="#cbd5e1"
              value={date}
              onChangeText={setDate}
            />
            {!!dateError && <Text style={styles.errorText}>{dateError}</Text>}
          </View>

          {/* Mensajes */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Botón guardar */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Text>
          </TouchableOpacity>

          {/* Botón eliminar */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading}
          >
            <Text style={styles.deleteButtonText}>Eliminar gasto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditExpenseScreen;

const CARD_RADIUS = 24;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  deleteButton: {
    marginTop: 16,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
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
