/**
 * Tipos para el sistema de gestion de gastos
 */

// Categorias que puede elegir el usuario
export type Category =
  | 'Transporte'
  | 'Alimentación'
  | 'Material académico'
  | 'Entretenimiento'
  | 'Salud'
  | 'Otros';

export interface Expense {
  id: string;
  amount: number; // en dolares
  category: Category;
  date: string; // formato estándar YYYY-MM-DD
  description?: string;
  receipt_image?: string; // URI local de la imagen del comprobante/factura
}

/**
 * Convierte un objeto Date o string a formato estándar YYYY-MM-DD
 */
export function formatDateToStandard(date: Date | string | any = new Date()): string {
  if (!date) return formatDateToStandard(new Date());

  if (typeof date === 'string') {
    // Si ya viene como YYYY-MM-DD
    if (!date.includes('T') && date.split('-').length === 3) {
      return date;
    }
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    } else {
      date = new Date();
    }
  }

  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parsea un string estándar YYYY-MM-DD o Date a un objeto Date local
 */
export function parseStandardDate(dateVal: string | Date | any): Date {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;

  const str = String(dateVal);
  if (str.includes('T')) {
    // Si viene en formato ISO antiguo
    return new Date(str);
  }

  const parts = str.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  return new Date(str);
}

// Mismo orden en que se muestran en el selector del modal
export const CATEGORIES: Category[] = [
  'Transporte',
  'Alimentación',
  'Material académico',
  'Entretenimiento',
  'Salud',
  'Otros',
];

/**
 * Iconos asociados a cada categoria
 */
export const CATEGORY_ICONS: Record<Category, string> = {
  'Transporte': '🚗',
  'Alimentación': '🍔',
  'Material académico': '📚',
  'Entretenimiento': '🎮',
  'Salud': '💊',
  'Otros': '📦',
};
