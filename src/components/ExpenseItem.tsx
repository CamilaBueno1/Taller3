import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CATEGORY_ICONS, parseStandardDate } from '@/types/expense';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface ExpenseItemProps {
  expense: Expense;
  index: number;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onViewReceipt?: (imageUri: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  index,
  onEdit,
  onDelete,
  onViewReceipt,
}) => {
  // Fecha formateada (ej. "15 oct 2026")
  const expenseDate = parseStandardDate(expense.date);
  const formattedDate = expenseDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Monto formateado (ej. "$15.50")
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(expense.amount);

  const handleDeletePrompt = () => {
    Alert.alert(
      'Eliminar gasto',
      `¿Estás seguro de que deseas eliminar este gasto de ${formattedAmount} en ${expense.category}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(expense.id),
        },
      ]
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={styles.container}
    >
      <GlassCard>
        <View style={styles.content}>
          {/* SECCIÓN SUPERIOR: ICONO, DATOS Y MONTO */}
          <View style={styles.mainRow}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Text style={styles.icon}>{CATEGORY_ICONS[expense.category]}</Text>
                </LinearGradient>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.category}>{expense.category}</Text>
                {expense.description ? (
                  <Text style={styles.description} numberOfLines={2}>
                    {expense.description}
                  </Text>
                ) : null}
                <Text style={styles.dateText}>📅 {formattedDate}</Text>
              </View>
            </View>

            <View style={styles.rightSection}>
              <Text style={styles.amount}>{formattedAmount}</Text>
              {expense.receipt_image ? (
                <TouchableOpacity
                  style={styles.receiptBadge}
                  onPress={() => onViewReceipt?.(expense.receipt_image!)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.receiptBadgeText}>🧾 Comprobante</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* VISTA PREVIA COMPROBANTE MINIATURA SI EXISTE */}
          {expense.receipt_image && (
            <TouchableOpacity
              style={styles.receiptThumbnailContainer}
              onPress={() => onViewReceipt?.(expense.receipt_image!)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: expense.receipt_image }}
                style={styles.receiptThumbnail}
                resizeMode="cover"
              />
              <Text style={styles.receiptThumbnailHint}>Toca para ampliar 🔍</Text>
            </TouchableOpacity>
          )}

          {/* BARRA DE ACCIONES: EDITAR Y ELIMINAR */}
          <View style={styles.actionsDivider} />
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(expense)}
              activeOpacity={0.7}
            >
              <Text style={styles.editActionText}>✏️ Editar</Text>
            </TouchableOpacity>

            <View style={styles.actionSeparator} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeletePrompt}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteActionText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.two,
  },
  content: {
    flexDirection: 'column',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: Spacing.two,
  },
  iconContainer: {
    marginRight: Spacing.two,
    marginTop: 2,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  infoContainer: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: LiquidGlassColors.glassText,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: LiquidGlassColors.glassTextSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  dateText: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginBottom: 4,
  },
  receiptBadge: {
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Spacing.one,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  receiptBadgeText: {
    fontSize: 11,
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
  },
  receiptThumbnailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: Spacing.one,
    padding: Spacing.one,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    gap: Spacing.two,
  },
  receiptThumbnail: {
    width: 48,
    height: 48,
    borderRadius: Spacing.one,
  },
  receiptThumbnailHint: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
    fontStyle: 'italic',
  },
  actionsDivider: {
    height: 1,
    backgroundColor: LiquidGlassColors.glassBorder,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    opacity: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 2,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
  },
  actionSeparator: {
    width: 1,
    height: 16,
    backgroundColor: LiquidGlassColors.glassBorder,
  },
  editActionText: {
    fontSize: 13,
    color: LiquidGlassColors.glassText,
    fontWeight: '600',
  },
  deleteActionText: {
    fontSize: 13,
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
  },
});
