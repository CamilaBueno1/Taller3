import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Expense, parseStandardDate, formatDateToStandard } from '@/types/expense';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getAllExpenses,
  insertExpense,
  updateExpense as updateExpenseRepo,
  deleteExpense as deleteExpenseRepo,
} from '@/database/expenseRepository';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  sortByAmount: boolean;
  setSortByAmount: (value: boolean) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getMonthlyTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
  refreshExpenses: () => Promise<void>;
}

// Arranca en undefined para poder avisar si alguien usa el hook sin Provider
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortByAmount, setSortByAmountState] = useState(false);

  // Carga los gastos desde SQLite con la consulta SQL según el orden seleccionado
  const loadExpenses = useCallback(async (byAmount: boolean) => {
    try {
      const guardados = await getAllExpenses(db, byAmount);
      setExpenses(guardados);
    } catch (error) {
      console.error('No se pudieron cargar los gastos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadExpenses(sortByAmount);
  }, [loadExpenses, sortByAmount]);

  // Cambiar el criterio de ordenamiento (ejecuta SELECT ... ORDER BY amount DESC o date DESC)
  const setSortByAmount = (value: boolean) => {
    setSortByAmountState(value);
  };

  const refreshExpenses = async () => {
    await loadExpenses(sortByAmount);
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    };

    // Primero se inserta en SQLite
    await insertExpense(db, newExpense);

    // Se actualiza el estado local respetando el ordenamiento actual
    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      if (sortByAmount) {
        return [...updated].sort((a, b) => b.amount - a.amount);
      }
      return [...updated].sort((a, b) => {
        return parseStandardDate(b.date).getTime() - parseStandardDate(a.date).getTime();
      });
    });
  };

  const updateExpense = async (expense: Expense) => {
    // Normalizar la fecha a string estándar
    const normalizedExpense: Expense = {
      ...expense,
      date: formatDateToStandard(expense.date),
    };

    // Actualiza en SQLite (UPDATE expenses SET ...)
    await updateExpenseRepo(db, normalizedExpense);

    // Actualiza en el estado local
    setExpenses((prev) => {
      const updated = prev.map((item) =>
        item.id === normalizedExpense.id ? normalizedExpense : item
      );
      if (sortByAmount) {
        return [...updated].sort((a, b) => b.amount - a.amount);
      }
      return [...updated].sort((a, b) => {
        return (
          parseStandardDate(b.date).getTime() -
          parseStandardDate(a.date).getTime()
        );
      });
    });
  };

  const deleteExpense = async (id: string) => {
    // Elimina de SQLite (DELETE FROM expenses WHERE id = ?)
    await deleteExpenseRepo(db, id);

    // Elimina del estado local
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filtered = expenses.filter((expense) => {
      const expenseDate = parseStandardDate(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    if (sortByAmount) {
      return [...filtered].sort((a, b) => b.amount - a.amount);
    }
    return [...filtered].sort((a, b) => {
      return parseStandardDate(b.date).getTime() - parseStandardDate(a.date).getTime();
    });
  };

  const getMonthlyTotal = () => {
    return getCurrentMonthExpenses().reduce(
      (total, expense) => total + expense.amount,
      0
    );
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        sortByAmount,
        setSortByAmount,
        addExpense,
        updateExpense,
        deleteExpense,
        getMonthlyTotal,
        getCurrentMonthExpenses,
        refreshExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
