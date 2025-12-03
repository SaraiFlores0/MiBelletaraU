
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../supabaseConfig.local';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   PERFIL DE USUARIO
   Tabla: profiles
   Campos: id, full_name, created_at
============================================================ */


export type RawProfile = {
  full_name: string | null;
  created_at: string | null;
  email: string | null;
};

export async function getCurrentUserProfile(): Promise<RawProfile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No se pudo obtener el usuario actual', userError);
    return null;
  }

  // Traemos el perfil de la tabla profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, created_at')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error cargando profile', profileError);
    return null;
  }

  return {
    full_name: profile?.full_name ?? null,
    created_at: profile?.created_at ?? null,
    email: user.email ?? null,
  };
}

export async function updateProfile(fullName: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No hay usuario autenticado');

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id);

  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/* ============================================================
   GASTOS
   Tabla: expenses
   Campos: id, user_id, name, amount, date
============================================================ */

export type ExpenseInput = {
  name: string;
  amount: number;
  date: string; 
};

export async function getExpenses() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No hay usuario');
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addExpense(expense: ExpenseInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No hay usuario autenticado');

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    name: expense.name,
    amount: expense.amount,
    date: expense.date,
  });

  if (error) throw error;
}

export async function updateExpense(
  id: string,
  expense: ExpenseInput,
): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .update({
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}
