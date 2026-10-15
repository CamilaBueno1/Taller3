import { SQLiteDatabase } from 'expo-sqlite';
import { Category, Expense, formatDateToStandard } from '@/types/expense';

// Forma en que una fila llega desde SQLite
interface ExpenseRow {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  receipt_image?: string | null;
}

// Bandera para evitar ejecutar ALTER TABLE repetidamente
let isReceiptColumnEnsured = false;

/**
 * Garantiza que la columna receipt_image exista en la tabla expenses de SQLite.
 * Si la base de datos se creó previamente sin esta columna, ejecuta ALTER TABLE.
 */
export async function ensureReceiptImageColumn(db: SQLiteDatabase): Promise<void> {
  if (isReceiptColumnEnsured) return;
  try {
    await db.execAsync('ALTER TABLE expenses ADD COLUMN receipt_image TEXT;');
  } catch {
    // Si la columna ya existe, SQLite arrojará un error que se ignora de forma segura
  }
  isReceiptColumnEnsured = true;
}

// Convierte la fila en un objeto Expense que entienda la app
function rowToExpense(row: ExpenseRow): Expense {
  let standardDate = String(row.date || '');
  if (standardDate.includes('T')) {
    standardDate = standardDate.split('T')[0];
  } else if (!standardDate) {
    standardDate = formatDateToStandard(new Date());
  }

  return {
    id: String(row.id),
    amount: Number(row.amount),
    category: row.category as Category,
    date: standardDate,
    description: row.description ?? undefined,
    receipt_image: row.receipt_image ?? undefined,
  };
}

/**
 * Devuelve todos los gastos desde SQLite. Permite ordenar por montos más altos (amount DESC)
 * o por fecha más reciente (date DESC).
 */
export async function getAllExpenses(
  db: SQLiteDatabase,
  sortByAmountDesc: boolean = false
): Promise<Expense[]> {
  await ensureReceiptImageColumn(db);

  try {
    const query = sortByAmountDesc
      ? 'SELECT id, amount, category, date, description, receipt_image FROM expenses ORDER BY amount DESC, date DESC'
      : 'SELECT id, amount, category, date, description, receipt_image FROM expenses ORDER BY date DESC, id DESC';

    const rows = await db.getAllAsync<ExpenseRow>(query);
    return rows.map(rowToExpense);
  } catch (error) {
    // Fallback defensivo si la columna receipt_image aún no estuviera lista
    console.warn('Fallback en getAllExpenses:', error);
    const queryFallback = sortByAmountDesc
      ? 'SELECT id, amount, category, date, description FROM expenses ORDER BY amount DESC, date DESC'
      : 'SELECT id, amount, category, date, description FROM expenses ORDER BY date DESC, id DESC';

    const rows = await db.getAllAsync<ExpenseRow>(queryFallback);
    return rows.map(rowToExpense);
  }
}

/**
 * Inserta un nuevo gasto en SQLite
 */
export async function insertExpense(
  db: SQLiteDatabase,
  expense: Expense
): Promise<void> {
  await ensureReceiptImageColumn(db);

  const dateStr = formatDateToStandard(expense.date);

  try {
    await db.runAsync(
      'INSERT INTO expenses (id, amount, category, date, description, receipt_image) VALUES (?, ?, ?, ?, ?, ?)',
      [
        String(expense.id),
        Number(expense.amount),
        String(expense.category),
        dateStr,
        expense.description ?? null,
        expense.receipt_image ?? null,
      ]
    );
  } catch (error) {
    console.warn('Fallback en insertExpense sin receipt_image:', error);
    await db.runAsync(
      'INSERT INTO expenses (id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
      [
        String(expense.id),
        Number(expense.amount),
        String(expense.category),
        dateStr,
        expense.description ?? null,
      ]
    );
  }
}

/**
 * Actualiza un gasto existente en SQLite (UPDATE)
 */
export async function updateExpense(
  db: SQLiteDatabase,
  expense: Expense
): Promise<void> {
  await ensureReceiptImageColumn(db);

  const dateStr = formatDateToStandard(expense.date);

  try {
    await db.runAsync(
      'UPDATE expenses SET amount = ?, category = ?, date = ?, description = ?, receipt_image = ? WHERE id = ?',
      [
        Number(expense.amount),
        String(expense.category),
        dateStr,
        expense.description ?? null,
        expense.receipt_image ?? null,
        String(expense.id),
      ]
    );
  } catch (err) {
    console.warn('Reintentando updateExpense sin receipt_image:', err);
    // Fallback por si la columna receipt_image diera algún problema
    await db.runAsync(
      'UPDATE expenses SET amount = ?, category = ?, date = ?, description = ? WHERE id = ?',
      [
        Number(expense.amount),
        String(expense.category),
        dateStr,
        expense.description ?? null,
        String(expense.id),
      ]
    );
  }
}

/**
 * Elimina un gasto de SQLite por su ID (DELETE)
 */
export async function deleteExpense(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [String(id)]);
}