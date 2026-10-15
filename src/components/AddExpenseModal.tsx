import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import {
  Category,
  CATEGORIES,
  CATEGORY_ICONS,
  Expense,
  formatDateToStandard,
  parseStandardDate,
} from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

// Regex estricta para descripción: únicamente letras, números y espacios
const DESCRIPTION_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]*$/;
// Regex estricta para monto: número positivo con máximo 2 decimales
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;
const MAX_DESCRIPTION_LENGTH = 400;

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  expenseToEdit,
}) => {
  const { addExpense, updateExpense } = useExpenses();

  // Estados de los campos
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [date, setDate] = useState<string>(formatDateToStandard(new Date()));
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Estados de validación y errores en pantalla
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Control del selector de fecha
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [iosTempDate, setIosTempDate] = useState<Date>(new Date());

  // Precargar datos al abrir (en caso de edición o creación)
  useEffect(() => {
    if (visible) {
      if (expenseToEdit) {
        setAmount(expenseToEdit.amount.toString());
        setCategory(expenseToEdit.category);
        setDate(expenseToEdit.date || formatDateToStandard(new Date()));
        setIosTempDate(parseStandardDate(expenseToEdit.date));
        setDescription(expenseToEdit.description || '');
        setReceiptImage(expenseToEdit.receipt_image || null);
      } else {
        setAmount('');
        setCategory(null);
        const todayStr = formatDateToStandard(new Date());
        setDate(todayStr);
        setIosTempDate(new Date());
        setDescription('');
        setReceiptImage(null);
      }
      setAmountError(null);
      setCategoryError(null);
      setDescriptionError(null);
      setShowDatePicker(false);
    }
  }, [visible, expenseToEdit]);

  // Manejo de cambio en el monto con validación instantánea
  const handleAmountChange = (text: string) => {
    // Normalizar comas a puntos si el usuario las usa
    const normalized = text.replace(',', '.');
    setAmount(normalized);

    if (!normalized.trim()) {
      setAmountError('El monto es obligatorio.');
    } else if (!AMOUNT_REGEX.test(normalized)) {
      setAmountError('Solo números y máximo 2 decimales (ej. 15.50).');
    } else if (parseFloat(normalized) <= 0) {
      setAmountError('El monto debe ser mayor a 0.');
    } else {
      setAmountError(null);
    }
  };

  // Manejo de cambio de descripción con validación de caracteres especiales y límite
  const handleDescriptionChange = (text: string) => {
    if (text.length > MAX_DESCRIPTION_LENGTH) {
      return; // No permitir más de 400 caracteres
    }

    setDescription(text);

    if (text && !DESCRIPTION_REGEX.test(text)) {
      setDescriptionError('Solo se permiten letras, números y espacios.');
    } else {
      setDescriptionError(null);
    }
  };

  // Selección de categoría con limpieza del error visual
  const handleCategorySelect = (selectedCat: Category) => {
    setCategory(selectedCat);
    setCategoryError(null);
  };

  // Manejo de fecha
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDate(formatDateToStandard(selectedDate));
      }
    } else if (Platform.OS === 'ios') {
      if (selectedDate) {
        setIosTempDate(selectedDate);
      }
    }
  };

  const handleConfirmIosDate = () => {
    setDate(formatDateToStandard(iosTempDate));
    setShowDatePicker(false);
  };

  const setQuickDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const standard = formatDateToStandard(d);
    setDate(standard);
    setIosTempDate(d);
  };

  // Integración con expo-image-picker: Cámara
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Debes otorgar permiso para acceder a la cámara para tomar fotos de comprobantes.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  // Integración con expo-image-picker: Galería
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Debes otorgar permiso para acceder a tus fotos para adjuntar el comprobante.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo abrir la galería.');
    }
  };

  // Diálogo para cambiar imagen existente
  const handleChangeImagePrompt = () => {
    Alert.alert('Cambiar Comprobante', 'Elige de dónde obtener la imagen:', [
      { text: 'Tomar Foto 📷', onPress: handleTakePhoto },
      { text: 'Seleccionar de Galería 🖼️', onPress: handlePickFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // Envío del formulario
  const handleSubmit = async () => {
    let isValid = true;

    // Validación estricta de monto
    const cleanAmount = amount.trim();
    if (!cleanAmount) {
      setAmountError('El monto es obligatorio.');
      isValid = false;
    } else if (!AMOUNT_REGEX.test(cleanAmount)) {
      setAmountError('Solo números y máximo 2 decimales (ej. 15.50).');
      isValid = false;
    } else if (parseFloat(cleanAmount) <= 0) {
      setAmountError('El monto debe ser mayor a 0.');
      isValid = false;
    } else {
      setAmountError(null);
    }

    // Validación estricta de categoría
    if (!category) {
      setCategoryError('Debes seleccionar una categoría obligatoria.');
      isValid = false;
    } else {
      setCategoryError(null);
    }

    // Validación estricta de descripción
    if (description && !DESCRIPTION_REGEX.test(description)) {
      setDescriptionError('Solo se permiten letras, números y espacios.');
      isValid = false;
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError('Máximo 400 caracteres permitidos.');
      isValid = false;
    } else {
      setDescriptionError(null);
    }

    if (!isValid) return;

    try {
      const numericAmount = parseFloat(cleanAmount);
      const cleanDesc = description.trim() || undefined;
      const cleanReceipt = receiptImage || undefined;

      if (expenseToEdit) {
        await updateExpense({
          id: expenseToEdit.id,
          amount: numericAmount,
          category: category!,
          date,
          description: cleanDesc,
          receipt_image: cleanReceipt,
        });
      } else {
        await addExpense({
          amount: numericAmount,
          category: category!,
          date,
          description: cleanDesc,
          receipt_image: cleanReceipt,
        });
      }

      handleClose();
    } catch (error) {
      console.error('Error al procesar el gasto:', error);
      Alert.alert('Error', 'No se pudo guardar la información del gasto.');
    }
  };

  const handleClose = () => {
    setAmount('');
    setCategory(null);
    setDate(formatDateToStandard(new Date()));
    setDescription('');
    setReceiptImage(null);
    setAmountError(null);
    setCategoryError(null);
    setDescriptionError(null);
    setShowDatePicker(false);
    onClose();
  };

  const formattedDisplayDate = parseStandardDate(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isEditing = !!expenseToEdit;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.modalContent}
        >
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.title}>
                  {isEditing ? 'Editar Gasto' : 'Agregar Gasto'}
                </Text>

                {/* 1. SECCIÓN: MONTO */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>
                    Monto (USD) <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      amountError ? styles.inputContainerError : null,
                    ]}
                  >
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={handleAmountChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                  </View>
                  {amountError && <Text style={styles.errorText}>{amountError}</Text>}
                </View>

                {/* 2. SECCIÓN: CATEGORÍA */}
                <View style={styles.inputSection}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>
                      Categoría <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    {category && (
                      <Text style={styles.selectedCategoryBadge}>
                        {category} {CATEGORY_ICONS[category]}
                      </Text>
                    )}
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => handleCategorySelect(cat)}
                        style={[
                          styles.categoryButton,
                          category === cat && styles.categoryButtonActive,
                          categoryError && !category ? styles.categoryButtonError : null,
                        ]}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={[
                              LiquidGlassColors.primary,
                              LiquidGlassColors.secondary,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryTextActive}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <>
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {categoryError && (
                    <Text style={styles.errorText}>{categoryError}</Text>
                  )}
                </View>

                {/* 3. SECCIÓN: FECHA */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>
                    Fecha <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateIconWrapper}>
                      <Text style={styles.dateIcon}>📅</Text>
                    </View>
                    <View style={styles.dateTextWrapper}>
                      <Text style={styles.dateMainText}>{formattedDisplayDate}</Text>
                      <Text style={styles.dateSubText}>Formato: {date}</Text>
                    </View>
                    <View style={styles.dateChangeBadge}>
                      <Text style={styles.dateChangeBadgeText}>Cambiar</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Botones de selección rápida */}
                  <View style={styles.quickDateRow}>
                    <TouchableOpacity
                      style={styles.quickDateButton}
                      onPress={() => setQuickDate(0)}
                    >
                      <Text style={styles.quickDateText}>Hoy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickDateButton}
                      onPress={() => setQuickDate(-1)}
                    >
                      <Text style={styles.quickDateText}>Ayer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickDateButton}
                      onPress={() => setQuickDate(-2)}
                    >
                      <Text style={styles.quickDateText}>Antier</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4. SECCIÓN: DESCRIPCIÓN */}
                <View style={styles.inputSection}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Descripción (opcional)</Text>
                    <Text
                      style={[
                        styles.charCount,
                        description.length >= MAX_DESCRIPTION_LENGTH
                          ? styles.charCountLimit
                          : null,
                      ]}
                    >
                      {description.length} / {MAX_DESCRIPTION_LENGTH}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.descriptionInput,
                      descriptionError ? styles.inputContainerError : null,
                    ]}
                    value={description}
                    onChangeText={handleDescriptionChange}
                    placeholder="Ej: Almuerzo universitario, pasaje metro..."
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    multiline
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  {descriptionError && (
                    <Text style={styles.errorText}>{descriptionError}</Text>
                  )}
                </View>

                {/* 5. SECCIÓN: FACTURA / COMPROBANTE */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Factura o Comprobante (opcional)</Text>

                  {receiptImage ? (
                    <View style={styles.receiptPreviewContainer}>
                      <Image
                        source={{ uri: receiptImage }}
                        style={styles.receiptPreviewImage}
                        resizeMode="cover"
                      />
                      <View style={styles.receiptActionsOverlay}>
                        <TouchableOpacity
                          style={styles.receiptActionButton}
                          onPress={handleChangeImagePrompt}
                        >
                          <Text style={styles.receiptActionText}>🔄 Cambiar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.receiptActionButton,
                            styles.receiptDeleteButton,
                          ]}
                          onPress={() => setReceiptImage(null)}
                        >
                          <Text
                            style={[
                              styles.receiptActionText,
                              styles.receiptDeleteText,
                            ]}
                          >
                            🗑️ Eliminar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.receiptButtonRow}>
                      <TouchableOpacity
                        style={styles.receiptOptionButton}
                        onPress={handleTakePhoto}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.receiptOptionIcon}>📸</Text>
                        <Text style={styles.receiptOptionText}>Tomar Foto</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.receiptOptionButton}
                        onPress={handlePickFromGallery}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.receiptOptionIcon}>🖼️</Text>
                        <Text style={styles.receiptOptionText}>Galería</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* BOTONES DE ACCIÓN: CANCELAR Y GUARDAR */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <LinearGradient
                      colors={[
                        LiquidGlassColors.primary,
                        LiquidGlassColors.secondary,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>
                        {isEditing ? 'Guardar Cambios' : 'Agregar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* MODAL DE SELECTOR DE FECHA (iOS o Android) */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade">
            <View style={styles.iosDatePickerOverlay}>
              <View style={styles.iosDatePickerCard}>
                <Text style={styles.iosDatePickerTitle}>Seleccionar Fecha</Text>
                <DateTimePicker
                  value={iosTempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  textColor={LiquidGlassColors.glassText}
                />
                <View style={styles.iosDatePickerActions}>
                  <TouchableOpacity
                    style={styles.iosDatePickerCancel}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.iosDatePickerCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iosDatePickerConfirm}
                    onPress={handleConfirmIosDate}
                  >
                    <LinearGradient
                      colors={[
                        LiquidGlassColors.primary,
                        LiquidGlassColors.secondary,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iosDatePickerConfirmGradient}
                    >
                      <Text style={styles.iosDatePickerConfirmText}>Confirmar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={parseStandardDate(date)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  modalBlur: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LiquidGlassColors.glassTextSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    opacity: 0.35,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
  },
  inputSection: {
    marginBottom: Spacing.three,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  requiredStar: {
    color: LiquidGlassColors.secondary,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
    marginTop: Spacing.one,
  },
  charCount: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
  charCountLimit: {
    color: LiquidGlassColors.secondary,
    fontWeight: 'bold',
  },
  selectedCategoryBadge: {
    fontSize: 13,
    color: LiquidGlassColors.primary,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  inputContainerError: {
    borderColor: LiquidGlassColors.secondary,
    backgroundColor: 'rgba(196, 69, 105, 0.08)',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: LiquidGlassColors.glassText,
    paddingVertical: Spacing.two,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    minHeight: 70,
    textAlignVertical: 'top',
    fontSize: 14,
    paddingTop: Spacing.two,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.two,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: 'transparent',
  },
  categoryButtonError: {
    borderColor: LiquidGlassColors.secondary,
  },
  categoryGradient: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  categoryText: {
    fontSize: 12,
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.two,
  },
  dateIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LiquidGlassColors.glassBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },
  dateIcon: {
    fontSize: 20,
  },
  dateTextWrapper: {
    flex: 1,
  },
  dateMainText: {
    fontSize: 15,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    textTransform: 'capitalize',
  },
  dateSubText: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
    marginTop: 2,
  },
  dateChangeBadge: {
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  dateChangeBadgeText: {
    fontSize: 12,
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  quickDateButton: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  quickDateText: {
    fontSize: 11,
    color: LiquidGlassColors.glassTextSecondary,
    fontWeight: '500',
  },
  receiptPreviewContainer: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  receiptPreviewImage: {
    width: '100%',
    height: 160,
    borderRadius: Spacing.two,
  },
  receiptActionsOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  receiptActionButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
  },
  receiptActionText: {
    fontSize: 12,
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
  },
  receiptDeleteButton: {
    backgroundColor: 'rgba(196, 69, 105, 0.15)',
  },
  receiptDeleteText: {
    color: LiquidGlassColors.secondary,
  },
  receiptButtonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  receiptOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  receiptOptionIcon: {
    fontSize: 18,
  },
  receiptOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  submitButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
  iosDatePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  iosDatePickerCard: {
    backgroundColor: '#FFF9FC',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  iosDatePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  iosDatePickerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
    width: '100%',
  },
  iosDatePickerCancel: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  iosDatePickerCancelText: {
    fontSize: 14,
    color: LiquidGlassColors.glassText,
    fontWeight: '600',
  },
  iosDatePickerConfirm: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  iosDatePickerConfirmGradient: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  iosDatePickerConfirmText: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: 'bold',
  },
});
