// src/screens/ExpensesSummaryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { supabase } from '../services/supabaseClient';
import { RootStackScreenProps } from '../navigation/AppNavigator';

type Props = RootStackScreenProps<'ExpensesSummary'>;

type Expense = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  date: string; 
  description?: string | null;
};

const ExpensesSummaryScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  // Todos los gastos
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  // Solo gastos del mes actual
  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  // Los que se muestran en la lista (según filtros o mes actual)
  const [visibleExpenses, setVisibleExpenses] = useState<Expense[]>([]);

  // Total del mes actual
  const [monthTotal, setMonthTotal] = useState(0);

  const [filteredTotal, setFilteredTotal] = useState(0);

  // Filtros
  const [searchName, setSearchName] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatMoney = (value: number) =>
    `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  const formatDate = (value: string | Date) => {
    const d = typeof value === 'string' ? new Date(value) : value;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        Alert.alert('Error', 'Debes iniciar sesión.');
        return;
      }

      const user = sessionData.session.user;

      // 🔹 Traer TODOS los gastos del usuario
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        Alert.alert('Error', `Error al cargar gastos: ${error.message}`);
        return;
      }

      const expenses = (data ?? []) as Expense[];

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Gastos del mes actual
      const currentMonthExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      // Total del mes actual
      const total = currentMonthExpenses.reduce(
        (acc, exp) => acc + Number(exp.amount ?? 0),
        0,
      );

      setAllExpenses(expenses);
      setMonthExpenses(currentMonthExpenses);
      setVisibleExpenses(currentMonthExpenses);
      setMonthTotal(total);

      
      setFilteredTotal(total);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message ? String(err.message) : 'Error inesperado al cargar gastos.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const applyFilters = () => {
    const hasFilters =
      searchName.trim() !== '' ||
      minAmount.trim() !== '' ||
      maxAmount.trim() !== '' ||
      !!startDate ||
      !!endDate;

    // Si NO hay filtros -> solo gastos del mes actual
    // Si SÍ hay filtros -> filtrar sobre TODOS los gastos
    let list = hasFilters ? [...allExpenses] : [...monthExpenses];

    if (searchName.trim() !== '') {
      const term = searchName.trim().toLowerCase();
      list = list.filter(exp => exp.name.toLowerCase().includes(term));
    }

    const min = parseFloat(minAmount);
    if (!isNaN(min)) {
      list = list.filter(exp => Number(exp.amount) >= min);
    }

    const max = parseFloat(maxAmount);
    if (!isNaN(max)) {
      list = list.filter(exp => Number(exp.amount) <= max);
    }

    if (startDate) {
      list = list.filter(exp => {
        const d = new Date(exp.date);
        return d >= startDate;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter(exp => {
        const d = new Date(exp.date);
        return d <= end;
      });
    }

    // Subtotal de lo que quedó después de los filtros
    const subtotal = list.reduce(
      (acc, exp) => acc + Number(exp.amount ?? 0),
      0,
    );

    setVisibleExpenses(list);
    setFilteredTotal(subtotal);
  };

  const clearFilters = () => {
    setSearchName('');
    setMinAmount('');
    setMaxAmount('');
    setStartDate(undefined);
    setEndDate(undefined);

    // Volver al estado inicial: solo mes actual
    setVisibleExpenses(monthExpenses);
    setFilteredTotal(monthTotal);
  };

  const onChangeStartDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.expenseName}>{item.name}</Text>
        <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        {item.description ? (
          <Text style={styles.expenseDescription}>{item.description}</Text>
        ) : null}
      </View>
      <Text style={styles.expenseAmount}>
        {formatMoney(Number(item.amount))}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBackground} />

      <View style={styles.card}>
        {/* Header con volver */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'← Volver'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Resumen del mes</Text>
        <Text style={styles.subtitle}>Total gastado este mes:</Text>

        <Text style={styles.totalAmount}>{formatMoney(monthTotal)}</Text>
        <Text style={styles.subtitleSmall}>
          {monthExpenses.length} gasto(s) registrados este mes
        </Text>

        {/* Filtros */}
        <View style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Filtros</Text>

          <TextInput
            style={styles.input}
            placeholder="Buscar por nombre"
            placeholderTextColor="#cbd5e1"
            value={searchName}
            onChangeText={setSearchName}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Monto mín.</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={minAmount}
                onChangeText={setMinAmount}
                placeholder="0.00"
                placeholderTextColor="#cbd5e1"
              />
            </View>
            <View style={styles.spacer} />
            <View style={styles.rowItem}>
              <Text style={styles.label}>Monto máx.</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxAmount}
                onChangeText={setMaxAmount}
                placeholder="100.00"
                placeholderTextColor="#cbd5e1"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Desde</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {startDate ? formatDate(startDate) : 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.spacer} />
            <View style={styles.rowItem}>
              <Text style={styles.label}>Hasta</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {endDate ? formatDate(endDate) : 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate ?? new Date()}
              mode="date"
              display="default"
              onChange={onChangeStartDate}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate ?? new Date()}
              mode="date"
              display="default"
              onChange={onChangeEndDate}
            />
          )}

          <View style={styles.filtersButtonsRow}>
            <TouchableOpacity style={styles.filterButton} onPress={applyFilters}>
              <Text style={styles.filterButtonText}>Buscar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, styles.filterButtonSecondary]}
              onPress={clearFilters}
            >
              <Text style={styles.filterButtonSecondaryText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subtotal de lo filtrado */}
        <View style={styles.subtotalBox}>
          <Text style={styles.subtotalLabel}>Subtotal de lo filtrado</Text>
          <Text style={styles.subtotalAmount}>
            {formatMoney(filteredTotal)}
          </Text>
        </View>

        {/* Lista de gastos */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#4f46e5" />
          </View>
        ) : (
          <FlatList
            data={visibleExpenses}
            keyExtractor={item => item.id}
            renderItem={renderExpenseItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay gastos para mostrar.</Text>
            }
            style={{ marginTop: 8 }}
            contentContainerStyle={
              visibleExpenses.length === 0
                ? { flexGrow: 1, justifyContent: 'center' }
                : {}
            }
          />
        )}
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
    width: '92%',
    maxHeight: '92%',
    backgroundColor: 'white',
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    color: '#4f46e5',
    fontWeight: '600',
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
  },
  subtitleSmall: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4f46e5',
    marginTop: 10,
  },
  filtersCard: {
    marginTop: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 12,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#111827',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
  },
  rowItem: {
    flex: 1,
  },
  spacer: {
    width: 10,
  },
  dateButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 13,
    color: '#111827',
  },
  filtersButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  filterButtonSecondary: {
    marginLeft: 10,
    backgroundColor: '#e5e7eb',
  },
  filterButtonSecondaryText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  subtotalBox: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 13,
    color: '#4b5563',
  },
  subtotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4f46e5',
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  expenseDate: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  expenseDescription: {
    fontSize: 11,
    color: '#4b5563',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    marginLeft: 8,
  },
});

export default ExpensesSummaryScreen;
