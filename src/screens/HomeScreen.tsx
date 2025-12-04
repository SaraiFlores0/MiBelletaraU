// src/screens/HomeScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  getExpenses,
  deleteExpense,
  signOut,
} from '../services/supabaseClient';
import { RootStackScreenProps } from '../navigation/AppNavigator';

type Props = RootStackScreenProps<'Home'>;

type Expense = {
  id: string;
  name: string;
  amount: number;
  date: string;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = (await getExpenses()) as Expense[];
      setExpenses(data || []);
    } catch (error) {
      console.error('Error cargando gastos', error);
      Alert.alert('Error', 'No se pudieron cargar los gastos.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar gasto',
      '¿Seguro que deseas eliminar este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id);
              await loadExpenses();
            } catch (error) {
              console.error('Error al eliminar gasto', error);
              Alert.alert('Error', 'No se pudo eliminar el gasto.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (expense: Expense) => {
    navigation.navigate('EditExpense', { expense });
  };

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

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseName}>{item.name}</Text>
        <Text style={styles.expenseDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>
          ${Number(item.amount).toFixed(2)}
        </Text>

        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[styles.smallButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.smallButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.smallButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header morado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Mi Billetera 👛</Text>
          <Text style={styles.appSubtitle}>Control de gastos personales</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.headerButtonText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={styles.headerButtonText}>Acerca de</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.headerButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tarjeta blanca con sombra y bordes redondos */}
      <View style={styles.card}>
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : expenses.length === 0 ? (
            <Text style={styles.emptyText}>
              Aún no has registrado gastos. ¡Empieza agregando uno!
            </Text>
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.mainButton, styles.addButton]}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <Text style={styles.mainButtonText}>+ Agregar gasto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainButton, styles.summaryButton]}
            onPress={() => navigation.navigate('ExpensesSummary')}
          >
            <Text style={styles.mainButtonText}>Ver resumen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;

const PURPLE = '#4F46E5';
const LIGHT_PURPLE_BG = '#EEF2FF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PURPLE,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(248,250,252,0.9)',
    marginLeft: 6,
  },
  logoutButton: {
    backgroundColor: 'rgba(248,113,113,0.95)',
  },
  headerButtonText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },

  // Tarjeta principal (similar al resumen)
  card: {
    flex: 1,
    backgroundColor: LIGHT_PURPLE_BG,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,

    // sombra más marcada
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },

  content: {
    flex: 1,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748B',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 8,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  expenseDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  rowButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#22C55E33',
  },
  deleteButton: {
    backgroundColor: '#F9737333',
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  mainButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#0EA5E9',
    marginRight: 6,
  },
  summaryButton: {
    backgroundColor: PURPLE,
    marginLeft: 6,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
