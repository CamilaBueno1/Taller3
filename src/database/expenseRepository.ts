import {SQLiteDatabase} from 'expo-sqlite';
import {Category, Expense} from '@/types/expense';
//Forma en que una fila llega desde SQSLite
//La fecha viene como texto y la descripcion como null

interface ExpenseRow{
    id:string;
    amount:number;
    category:string;
    date:string;
    description:string |null;
}

//Convierte la fila en un objeto  Expense que entineda la tienda
function rowToExpense(row:ExpenseRow):Expense{
    return{
        id:row.id,
        amount:row.amount,
        category:row.category as Category,
        date : new Date(row.date),
        description:row.description ?? undefined,
    };
}

//Devuelve todos los gastos del mas reciente al ams antigu 

export async function getAllExpenses(db:SQLiteDatabase):Promise<Expense[]>{
    //getAllAsync ejecuta un SELECT y devuelve un arreglo con todas las filas 
    const rows = await db.getAllAsync<ExpenseRow>(
        'Select id, amount, category, date, description From expenses ORDER BY date DESC'
    );
    return rows.map(rowToExpense);
}

//Insertar UN gasto Adiferencia de AsyncStorage, no se reescribe toda la lista 
export async function insertExpense(db:SQLiteDatabase, expense: Expense): Promise<void>{
    //Los signos ? son parametros : SQLites coloca los valores de forma segura 
    //Nunca se arma el SQL concatenando texto, eso abre la puerta a una inyeccion SQL 
    await db.runAsync(
        'INSERT INTO expenses (id, amount, category, date, description) VALUES (?,?,?,?,?)',
        expense.id,
        expense.amount,
        expense.category,
        expense.date.toISOString(), //Date ->texto ISO
        expense.description ?? null //undefined -> NULL
    );
}