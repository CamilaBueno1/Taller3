import {SQLiteDatabase} from 'expo-sqlite';

//Nombre del archivo de la base de datos que se crea 
export const DATABASE_NAME = 'gastos.db';

//Se ejecuta una vez cada vez que se abre la base (lo llama SQLiteProvider)
//Creacion de las tavblas si no existen
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      receipt_image TEXT
    );
  `);

  // Migración segura: si la tabla ya existía sin la columna receipt_image, la agregamos
  try {
    const columns = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(expenses);'
    );
    const hasReceiptImage = columns.some((col) => col.name === 'receipt_image');
    if (!hasReceiptImage) {
      await db.execAsync('ALTER TABLE expenses ADD COLUMN receipt_image TEXT;');
    }
  } catch (error) {
    console.warn('Advertencia al verificar migración de receipt_image:', error);
  }
}

