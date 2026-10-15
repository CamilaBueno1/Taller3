import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

import { MonthlyHeader } from '@/components/MonthlyHeader';
import { ExpenseItem } from '@/components/ExpenseItem';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { useExpenses } from '@/context/ExpenseContext';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { Expense } from '@/types/expense';

export default function HomeScreen() {
  const {
    getCurrentMonthExpenses,
    isLoading,
    deleteExpense,
    sortByAmount,
    setSortByAmount,
  } = useExpenses();

  const [modalVisible, setModalVisible] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [receiptViewerUri, setReceiptViewerUri] = useState<string | null>(null);

  const expenses = getCurrentMonthExpenses();

  const handleOpenAdd = () => {
    setExpenseToEdit(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setModalVisible(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF5F9', '#FFE8F0', '#FFF9FC']}
        style={styles.gradient}
      >
        {/* Círculos de color detrás para el efecto de desenfoque Liquid Glass */}
        <View pointerEvents="none" style={[styles.orb, styles.orbPink]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbOrange]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbPurple]} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.appTitle}>Gastos Poliestudiante</Text>

            <MonthlyHeader />

            {/* BARRA DE ORDENAMIENTO VISUAL Y FILTRADO */}
            <View style={styles.sortHeader}>
              <View>
                <Text style={styles.sectionTitle}>Historial del mes</Text>
                <Text style={styles.sectionCount}>
                  {expenses.length === 1 ? '1 registro' : `${expenses.length} registros`}
                </Text>
              </View>

              <View style={styles.sortToggleGroup}>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    !sortByAmount ? styles.sortButtonActive : null,
                  ]}
                  onPress={() => setSortByAmount(false)}
                  activeOpacity={0.8}
                >
                  {!sortByAmount ? (
                    <LinearGradient
                      colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sortButtonGradient}
                    >
                      <Text style={styles.sortButtonTextActive}>🕒 Recientes</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.sortButtonText}>🕒 Recientes</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    sortByAmount ? styles.sortButtonActive : null,
                  ]}
                  onPress={() => setSortByAmount(true)}
                  activeOpacity={0.8}
                >
                  {sortByAmount ? (
                    <LinearGradient
                      colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sortButtonGradient}
                    >
                      <Text style={styles.sortButtonTextActive}>💰 Mayor monto</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.sortButtonText}>💰 Mayor monto</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* LISTADO DE GASTOS O ESTADO VACÍO */}
            {isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={LiquidGlassColors.primary} />
                <Text style={styles.loadingText}>Cargando tus gastos...</Text>
              </View>
            ) : expenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
                <Text style={styles.emptyText}>
                  Presiona el botón + para registrar tu primer gasto del mes
                </Text>
              </View>
            ) : (
              <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <ExpenseItem
                    expense={item}
                    index={index}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteExpense}
                    onViewReceipt={(uri) => setReceiptViewerUri(uri)}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* BOTÓN FLOTANTE (FAB) PARA AGREGAR */}
          <TouchableOpacity
            style={styles.fab}
            onPress={handleOpenAdd}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Text style={styles.fabIcon}>+</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* MODAL PARA CREACIÓN / EDICIÓN DE GASTOS */}
          <AddExpenseModal
            visible={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setExpenseToEdit(null);
            }}
            expenseToEdit={expenseToEdit}
          />

          {/* MODAL PARA VISUALIZAR COMPROBANTE EN TAMAÑO COMPLETO */}
          <Modal
            visible={!!receiptViewerUri}
            transparent
            animationType="fade"
            onRequestClose={() => setReceiptViewerUri(null)}
          >
            <View style={styles.viewerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setReceiptViewerUri(null)}
              >
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
              </TouchableOpacity>

              <View style={styles.viewerContent}>
                <View style={styles.viewerHeader}>
                  <Text style={styles.viewerTitle}>Comprobante adjunto</Text>
                  <TouchableOpacity
                    style={styles.viewerCloseButton}
                    onPress={() => setReceiptViewerUri(null)}
                  >
                    <Text style={styles.viewerCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {receiptViewerUri && (
                  <Image
                    source={{ uri: receiptViewerUri }}
                    style={styles.viewerImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPink: {
    width: 220,
    height: 220,
    top: 60,
    left: -60,
    backgroundColor: 'rgba(255, 107, 157, 0.55)',
  },
  orbOrange: {
    width: 180,
    height: 180,
    top: 260,
    right: -50,
    backgroundColor: 'rgba(255, 159, 94, 0.5)',
  },
  orbPurple: {
    width: 200,
    height: 200,
    bottom: 120,
    left: 20,
    backgroundColor: 'rgba(168, 120, 220, 0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    marginTop: -Spacing.one,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LiquidGlassColors.glassText,
  },
  sectionCount: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
  sortToggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: Spacing.two,
    padding: 3,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    gap: 4,
  },
  sortButton: {
    borderRadius: Spacing.two - 2,
    overflow: 'hidden',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  sortButtonActive: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  sortButtonGradient: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Spacing.two - 2,
  },
  sortButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: LiquidGlassColors.glassTextSecondary,
  },
  sortButtonTextActive: {
    fontSize: 11,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  loadingText: {
    marginTop: Spacing.two,
    fontSize: 14,
    color: LiquidGlassColors.glassTextSecondary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: LiquidGlassColors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '300',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  viewerContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  viewerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
  },
  viewerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(196, 69, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerCloseText: {
    fontSize: 16,
    color: LiquidGlassColors.secondary,
    fontWeight: 'bold',
  },
  viewerImage: {
    width: '100%',
    height: 400,
    borderRadius: Spacing.two,
  },
});
