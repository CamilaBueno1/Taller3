# 🎨 Sistema de Diseño - Liquid Glass

Guía rápida para crear nuevas pantallas manteniendo el estilo visual consistente.

---

## 🎨 Paleta de Colores (No Genérica)

```typescript
import { LiquidGlassColors, Spacing } from '@/constants/theme';

// Colores principales - Paleta única coral-burgundy
LiquidGlassColors.primary = '#FF6B9D'        // Coral rosado intenso
LiquidGlassColors.secondary = '#C44569'      // Vino/burgundy profundo
LiquidGlassColors.accent = '#A8E6CF'         // Verde menta (contraste)
LiquidGlassColors.glassText = '#2C1B47'      // Púrpura oscuro
LiquidGlassColors.glassTextLight = '#FFFBF5' // Blanco cálido
LiquidGlassColors.glassTextSecondary = '#8B6B8F' // Malva grisáceo
```

**Gradiente de fondo:** `['#FFF5F9', '#FFE8F0', '#FFF9FC']` (rosa muy claro degradado)

---

## 📐 Espaciado

```typescript
Spacing.two = 8px    // Gap entre elementos cercanos
Spacing.three = 16px // Padding de cards
Spacing.four = 24px  // Padding de pantallas
```

---

## ⌨️ Manejo del Teclado (IMPORTANTE)

**Problema común:** El teclado tapa los inputs en modales y formularios.

**Solución:** Siempre usar `ScrollView` + `KeyboardAvoidingView` en modales con inputs.

```typescript
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={0}
>
  <ScrollView
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    {/* Tu formulario aquí */}
  </ScrollView>
</KeyboardAvoidingView>
```

**Reglas:**
- ✅ Siempre usar `ScrollView` en modales con 2+ inputs
- ✅ Usar `keyboardShouldPersistTaps="handled"` para que botones funcionen
- ✅ Detectar plataforma: iOS usa `'padding'`, Android usa `'height'`
- ✅ Establecer `keyboardVerticalOffset={0}` para mejor control

---

## Templates de Componentes

### 1. Pantalla Base

```typescript
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { GlassCard } from '@/components/GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

export default function MiPantalla() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF5F9', '#FFE8F0', '#FFF9FC']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.title}>Mi Pantalla</Text>
            {/* Tu contenido aquí */}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
});
```

---

### 2. Card de Lista

```typescript
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';

<Animated.View entering={FadeInDown.delay(index * 100).springify()}>
  <GlassCard>
    <View style={styles.row}>
      <LinearGradient
        colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.icon}
      >
        <Text style={styles.emoji}>📊</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>Título</Text>
        <Text style={styles.cardSubtitle}>Subtítulo</Text>
      </View>
      <Text style={styles.value}>$100</Text>
    </View>
  </GlassCard>
</Animated.View>

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 24 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  cardSubtitle: {
    fontSize: 13,
    color: LiquidGlassColors.glassTextSecondary,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
  },
});
```

---

### 3. Header con Gradiente

```typescript
<GlassCard style={{ marginBottom: Spacing.four, overflow: 'hidden' }}>
  <LinearGradient
    colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.headerGradient}
  >
    <Text style={styles.headerLabel}>Título</Text>
    <Text style={styles.headerValue}>$1,234.56</Text>
  </LinearGradient>
</GlassCard>

const styles = StyleSheet.create({
  headerGradient: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextLight,
    marginBottom: Spacing.one,
    opacity: 0.8,
  },
  headerValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
    letterSpacing: -1,
  },
});
```

---

### 4. Modal Bottom Sheet (con ScrollView para teclado)

**⚠️ IMPORTANTE:** Si tu modal tiene inputs, SIEMPRE usa ScrollView + KeyboardAvoidingView para evitar que el teclado tape el contenido.

```typescript
import { Modal, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

<Modal visible={visible} transparent animationType="fade">
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.overlay}
    keyboardVerticalOffset={0}
  >
    <TouchableOpacity style={styles.backdrop} onPress={onClose}>
      <Animated.View entering={FadeIn}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>
    </TouchableOpacity>

    <Animated.View entering={SlideInDown.springify()} style={styles.modal}>
      <View style={styles.modalBackground}>
        <BlurView intensity={100} tint="light" style={styles.modalContent}>
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.modalTitle}>Título Modal</Text>
            {/* Tu contenido (inputs, etc.) */}
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton}>
                <LinearGradient
                  colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.submitText}>Confirmar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BlurView>
      </View>
    </Animated.View>
  </KeyboardAvoidingView>
</Modal>

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  modal: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  modalContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: LiquidGlassColors.glassTextSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    opacity: 0.3,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.four,
  },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButton: { flex: 1, borderRadius: Spacing.two, overflow: 'hidden' },
  gradientButton: { paddingVertical: Spacing.three, alignItems: 'center' },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
});
```

---

### 5. FAB (Floating Action Button)

```typescript
<TouchableOpacity style={styles.fab} onPress={onPress}>
  <LinearGradient
    colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.fabGradient}
  >
    <Text style={styles.fabIcon}>+</Text>
  </LinearGradient>
</TouchableOpacity>

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: LiquidGlassColors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
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
});
```

---

### 6. Input de Texto

```typescript
<View style={styles.inputSection}>
  <Text style={styles.label}>Etiqueta</Text>
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={setValue}
      placeholder="Escribe aquí..."
      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
    />
  </View>
</View>

const styles = StyleSheet.create({
  inputSection: { marginBottom: Spacing.four },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  input: {
    fontSize: 16,
    color: LiquidGlassColors.glassText,
    paddingVertical: Spacing.three,
  },
});
```

---

## ✅ Checklist Rápido

Al crear un nuevo componente:

### Visual
- [ ] Fondo de pantalla: `LinearGradient` con `['#FFF5F9', '#FFE8F0', '#FFF9FC']`
- [ ] Cards: usar `<GlassCard>`
- [ ] Animaciones de lista: `FadeInDown.delay(index * 100).springify()`
- [ ] Gradientes destacados: `primary (#FF6B9D)` → `secondary (#C44569)` con `start/end={{ x: 0-1, y: 0-1 }}`
- [ ] Padding de pantallas: `Spacing.four`
- [ ] Padding de cards: `Spacing.three`
- [ ] Títulos: `fontSize: 28, fontWeight: 'bold', color: glassText (#2C1B47)`
- [ ] Números grandes: `fontSize: 42, fontWeight: 'bold', letterSpacing: -1, color: glassTextLight (#FFFBF5)`
- [ ] Texto secundario: usar `glassTextSecondary (#8B6B8F)` para hints y descripciones

### Funcionalidad ⚠️ IMPORTANTE
- [ ] **¿Tiene inputs?** → Usar `ScrollView` + `KeyboardAvoidingView` (ver sección "Manejo del Teclado")
- [ ] **¿Es un modal?** → Agregar `keyboardShouldPersistTaps="handled"`
- [ ] **¿Tiene formulario?** → Verificar que el teclado no tapa los campos

---

**Para más detalles, revisa los componentes en `src/components/`**
