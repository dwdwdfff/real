import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Check, ChevronDown } from 'lucide-react-native';
import { supabase, Developer, Area } from '@/lib/supabase';

interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: string[];
  is_required: boolean;
  applies_to: string;
}

export default function AddProjectScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});
  const [showDeveloperPicker, setShowDeveloperPicker] = useState(false);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    developer_id: '',
    area_id: '',
    description: '',
    price_min: '',
    price_max: '',
    down_payment_min: '',
    down_payment_max: '',
    installment_years: '',
    has_clubhouse: false,
    delivery_date: '',
    status: 'planning',
  });

  useEffect(() => {
    loadDevelopers();
    loadAreas();
    loadDynamicFields();
  }, []);

  async function loadDevelopers() {
    const { data } = await supabase.from('developers').select('*').order('name');
    setDevelopers(data || []);
  }

  async function loadAreas() {
    const { data } = await supabase.from('areas').select('*').order('name');
    setAreas(data || []);
  }

  async function loadDynamicFields() {
    try {
      const { data, error } = await supabase
        .from('dynamic_fields')
        .select('*')
        .eq('applies_to', 'projects')
        .order('field_label');
      
      if (error) {
        console.error('Error loading dynamic fields:', error);
        return;
      }
      
      setDynamicFields(data || []);
    } catch (error) {
      console.error('Error loading dynamic fields:', error);
    }
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المشروع');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('projects').insert({
        name: formData.name,
        developer_id: formData.developer_id || null,
        area_id: formData.area_id || null,
        description: formData.description || null,
        price_min: formData.price_min ? parseFloat(formData.price_min) : null,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        down_payment_min: formData.down_payment_min ? parseFloat(formData.down_payment_min) : null,
        down_payment_max: formData.down_payment_max ? parseFloat(formData.down_payment_max) : null,
        installment_years: formData.installment_years ? parseInt(formData.installment_years) : null,
        has_clubhouse: formData.has_clubhouse,
        delivery_date: formData.delivery_date || null,
        status: formData.status,
        dynamic_data: dynamicFieldValues,
      });

      if (error) throw error;

      Alert.alert('نجح', 'تم إضافة المشروع بنجاح');
      router.back();
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ البيانات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const renderDynamicField = (field: DynamicField) => {
    const value = dynamicFieldValues[field.field_name] || '';
    
    switch (field.field_type) {
      case 'text':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              {field.field_label}
              {field.is_required && ' *'}
            </Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={(text) => 
                setDynamicFieldValues(prev => ({ ...prev, [field.field_name]: text }))
              }
              placeholder={`أدخل ${field.field_label}`}
              placeholderTextColor="#94a3b8"
            />
          </View>
        );
      
      case 'number':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              {field.field_label}
              {field.is_required && ' *'}
            </Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={(text) => 
                setDynamicFieldValues(prev => ({ ...prev, [field.field_name]: text }))
              }
              placeholder={`أدخل ${field.field_label}`}
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        );
      
      case 'select':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              {field.field_label}
              {field.is_required && ' *'}
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                // يمكن إضافة modal للاختيار من القائمة
                Alert.alert('اختيار', `اختر ${field.field_label}`);
              }}>
              <Text style={[styles.selectText, !value && styles.placeholderText]}>
                {value || `اختر ${field.field_label}`}
              </Text>
              <ChevronDown size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        );
      
      case 'boolean':
        return (
          <TouchableOpacity
            key={field.id}
            style={styles.checkboxContainer}
            onPress={() => 
              setDynamicFieldValues(prev => ({ 
                ...prev, 
                [field.field_name]: !prev[field.field_name] 
              }))
            }
            activeOpacity={0.7}>
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value && <Check size={16} color="#ffffff" />}
            </View>
            <Text style={styles.checkboxLabel}>
              {field.field_label}
              {field.is_required && ' *'}
            </Text>
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة مشروع</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المشروع *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="مثال: كمبوند الياسمين"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المطور</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowDeveloperPicker(true)}>
              <Text style={[styles.selectText, !formData.developer_id && styles.placeholderText]}>
                {formData.developer_id
                  ? developers.find((d) => d.id === formData.developer_id)?.name
                  : 'اختر المطور'}
              </Text>
              <ChevronDown size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المنطقة</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowAreaPicker(true)}>
              <Text style={[styles.selectText, !formData.area_id && styles.placeholderText]}>
                {formData.area_id
                  ? `${areas.find((a) => a.id === formData.area_id)?.name} - ${areas.find((a) => a.id === formData.area_id)?.city}`
                  : 'اختر المنطقة'}
              </Text>
              <ChevronDown size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="وصف المشروع"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>السعر من</Text>
              <TextInput
                style={styles.input}
                value={formData.price_min}
                onChangeText={(text) => setFormData({ ...formData, price_min: text })}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>السعر إلى</Text>
              <TextInput
                style={styles.input}
                value={formData.price_max}
                onChangeText={(text) => setFormData({ ...formData, price_max: text })}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>المقدم من</Text>
              <TextInput
                style={styles.input}
                value={formData.down_payment_min}
                onChangeText={(text) => setFormData({ ...formData, down_payment_min: text })}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>المقدم إلى</Text>
              <TextInput
                style={styles.input}
                value={formData.down_payment_max}
                onChangeText={(text) => setFormData({ ...formData, down_payment_max: text })}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>سنوات التقسيط</Text>
            <TextInput
              style={styles.input}
              value={formData.installment_years}
              onChangeText={(text) => setFormData({ ...formData, installment_years: text })}
              placeholder="5"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>تاريخ التسليم</Text>
            <TextInput
              style={styles.input}
              value={formData.delivery_date}
              onChangeText={(text) => setFormData({ ...formData, delivery_date: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setFormData({ ...formData, has_clubhouse: !formData.has_clubhouse })}
            activeOpacity={0.7}>
            <View style={[styles.checkbox, formData.has_clubhouse && styles.checkboxChecked]}>
              {formData.has_clubhouse && <Check size={16} color="#ffffff" />}
            </View>
            <Text style={styles.checkboxLabel}>يوجد نادي (Clubhouse)</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الحالة</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowStatusPicker(true)}>
              <Text style={styles.selectText}>
                {formData.status === 'planning' && 'تخطيط'}
                {formData.status === 'under_construction' && 'قيد الإنشاء'}
                {formData.status === 'completed' && 'مكتمل'}
              </Text>
              <ChevronDown size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Dynamic Fields Section */}
          {dynamicFields.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>معلومات إضافية</Text>
              </View>
              {dynamicFields.map(renderDynamicField)}
            </>
          )}
        </View>
      </ScrollView>

      <Modal visible={showDeveloperPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختر المطور</Text>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setFormData({ ...formData, developer_id: '' });
                  setShowDeveloperPicker(false);
                }}>
                <Text style={styles.modalItemText}>بدون مطور</Text>
              </TouchableOpacity>
              {developers.map((dev) => (
                <TouchableOpacity
                  key={dev.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, developer_id: dev.id });
                    setShowDeveloperPicker(false);
                  }}>
                  <Text style={styles.modalItemText}>{dev.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDeveloperPicker(false)}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAreaPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختر المنطقة</Text>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setFormData({ ...formData, area_id: '' });
                  setShowAreaPicker(false);
                }}>
                <Text style={styles.modalItemText}>بدون منطقة</Text>
              </TouchableOpacity>
              {areas.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, area_id: area.id });
                    setShowAreaPicker(false);
                  }}>
                  <Text style={styles.modalItemText}>
                    {area.name} - {area.city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAreaPicker(false)}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showStatusPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختر الحالة</Text>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFormData({ ...formData, status: 'planning' });
                setShowStatusPicker(false);
              }}>
              <Text style={styles.modalItemText}>تخطيط</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFormData({ ...formData, status: 'under_construction' });
                setShowStatusPicker(false);
              }}>
              <Text style={styles.modalItemText}>قيد الإنشاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFormData({ ...formData, status: 'completed' });
                setShowStatusPicker(false);
              }}>
              <Text style={styles.modalItemText}>مكتمل</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStatusPicker(false)}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          <Save size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  selectButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#1e293b',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#334155',
  },
  modalCloseButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#334155',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
  },
  placeholderText: {
    color: '#94a3b8',
  },
});
