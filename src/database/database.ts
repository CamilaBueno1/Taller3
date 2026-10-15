import {SQLiteDatabase} from 'expo-sqlite';

//Nombre del archivo de la base de datos que se crea 
export const DATABASE_NAME = 'gastos.db';

//Se ejecuta una vez cada vez que se abre la base (lo llama SQLiteProvider)
//Creacion de las tavblas si no existen
export async function initDatabase(db : SQLiteDatabase):Promise<void>{
     await db.execAsync(`
        PRAGMA journal_mode = WAL;
        
        CREATE TABLE IF NOT EXISTS expenses(
        id  TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT
        );`
        );

}

