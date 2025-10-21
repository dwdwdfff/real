import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface Project {
  id: string;
  name: string;
  developers: {
    name: string;
  };
}

interface UnitType {
  id: string;
  name: string;
}

interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: any[];
  is_active: boolean;
}

export default function AddUnitScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<{[key: string]: any}>({});
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState('');
  const [areaSqm, setAreaSqm] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [downPaymentPercentage, setDownPaymentPercentage] = useState('');
  const [installmentYears, setInstallmentYears] = useState('10');
  const [floorNumber, setFloorNumber] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Payment options
  const [monthlyInstallment, setMonthlyInstallment] = useState('');
  const [quarterlyInstallment, setQuarterlyInstallment] = useState('');
  const [semiAnnualInstallment, setSemiAnnualInstallment] = useState('');
  const [annualInstallment, setAnnualInstallment] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchUnitTypes();
    fetchDynamicFields();
  }, []);

  useEffect(() => {
    calculateInstallments();
  }, [price, discountPercentage, downPaymentPercentage, installmentYears]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          developers (
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل المشاريع');
    }
  };

  const fetchUnitTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('unit_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setUnitTypes(data || []);
    } catch (error) {
      console.error('Error fetching unit types:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل أنواع الوحدات');
    }
  };

  const fetchDynamicFields = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_fields')
        .select('*')
        .eq('applies_to', 'units')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setDynamicFields(data || []);
    } catch (error) {
      console.error('Error fetching dynamic fields:', error);
      // Don't show error alert for dynamic fields as they're optional
    }
  };

  const calculateInstallments = () => {
    const priceNum = parseFloat(price) || 0;
    const discountPercentageNum = parseFloat(discountPercentage) || 0;
    const downPaymentPercentageNum = parseFloat(downPaymentPercentage) || 0;
    const yearsNum = parseInt(installmentYears) || 10;

    if (priceNum <= 0) {
      setMonthlyInstallment('');
      setQuarterlyInstallment('');
      setSemiAnnualInstallment('');
      setAnnualInstallment('');
      return;
    }

    // Apply discount first
    const discountAmount = (priceNum * discountPercentageNum) / 100;
    const priceAfterDiscount = priceNum - discountAmount;
    
    // Calculate down payment from discounted price
    const downPaymentAmount = (priceAfterDiscount * downPaymentPercentageNum) / 100;
    
    // Calculate remaining amount after down payment
    const remainingAmount = priceAfterDiscount - downPaymentAmount;
    
    if (remainingAmount > 0 && yearsNum > 0) {
      const monthly = remainingAmount / (yearsNum * 12);
      const quarterly = remainingAmount / (yearsNum * 4);
      const semiAnnual = remainingAmount / (yearsNum * 2);
      const annual = remainingAmount / yearsNum;

      setMonthlyInstallment(monthly.toFixed(0));
      setQuarterlyInstallment(quarterly.toFixed(0));
      setSemiAnnualInstallment(semiAnnual.toFixed(0));
      setAnnualInstallment(annual.toFixed(0));
    } else {
      setMonthlyInstallment('');
      setQuarterlyInstallment('');
      setSemiAnnualInstallment('');
      setAnnualInstallment('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProjectId || !selectedUnitTypeId || !price) {
      Alert.alert('خطأ', 'يرجى ملء الحقول المطلوبة');
      return;
    }

    const selectedUnitType = unitTypes.find(ut => ut.id === selectedUnitTypeId);
    const unitTypeName = selectedUnitType?.name || '';

    setLoading(true);

    try {
      // Calculate actual down payment amount for storage
      const priceNum = parseFloat(price) || 0;
      const discountPercentageNum = parseFloat(discountPercentage) || 0;
      const downPaymentPercentageNum = parseFloat(downPaymentPercentage) || 0;
      
      const discountAmount = (priceNum * discountPercentageNum) / 100;
      const priceAfterDiscount = priceNum - discountAmount;
      const downPaymentAmount = (priceAfterDiscount * downPaymentPercentageNum) / 100;

      const { error } = await supabase
        .from('units')
        .insert([
          {
            project_id: selectedProjectId,
            unit_type: unitTypeName,
            area_sqm: parseFloat(areaSqm) || null,
            bedrooms: parseInt(bedrooms) || 0,
            bathrooms: parseInt(bathrooms) || 0,
            price: parseFloat(price),
            discount_percentage: parseFloat(discountPercentage) || 0,
            down_payment: downPaymentAmount || null,
            monthly_installment: parseFloat(monthlyInstallment) || null,
            quarterly_installment: parseFloat(quarterlyInstallment) || null,
            semi_annual_installment: parseFloat(semiAnnualInstallment) || null,
            annual_installment: parseFloat(annualInstallment) || null,
            installment_years: parseInt(installmentYears) || 10,
            floor_number: parseInt(floorNumber) || null,
            unit_number: unitNumber.trim() || null,
            status: 'available',
            dynamic_data: dynamicFieldValues,
          },
        ]);

      if (error) throw error;

      Alert.alert('نجح', 'تم إضافة الوحدة بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error adding unit:', error);
      Alert.alert('خطأ', 'حدث خطأ في إضافة الوحدة');
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderDynamicField = (field: DynamicField) => {
    const value = dynamicFieldValues[field.field_name];

    switch (field.field_type) {
      case 'text':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>{field.field_label}</Text>
            <TextInput
              style={styles.input}
              value={value || ''}
              onChangeText={(text) => handleDynamicFieldChange(field.field_name, text)}
              placeholder={`أدخل ${field.field_label}`}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        );

      case 'number':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>{field.field_label}</Text>
            <TextInput
              style={styles.input}
              value={value?.toString() || ''}
              onChangeText={(text) => handleDynamicFieldChange(field.field_name, parseFloat(text) || null)}
              placeholder={`أدخل ${field.field_label}`}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        );

      case 'boolean':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <View style={styles.booleanContainer}>
              <Text style={styles.label}>{field.field_label}</Text>
              <TouchableOpacity
                style={[styles.booleanButton, value && styles.booleanButtonActive]}
                onPress={() => handleDynamicFieldChange(field.field_name, !value)}
              >
                <Text style={[styles.booleanButtonText, value && styles.booleanButtonTextActive]}>
                  {value ? 'نعم' : 'لا'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'select':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>{field.field_label}</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                const options = field.field_options || [];
                Alert.alert(
                  `اختر ${field.field_label}`,
                  '',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    { text: 'مسح الاختيار', onPress: () => handleDynamicFieldChange(field.field_name, null) },
                    ...options.map((option: any) => ({
                      text: option.label || option,
                      onPress: () => handleDynamicFieldChange(field.field_name, option.value || option),
                    })),
                  ]
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {value || `اختر ${field.field_label}`}
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="إضافة وحدة جديدة" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>المشروع *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert(
                  'اختر المشروع',
                  '',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    ...projects.map((project) => ({
                      text: `${project.name} - ${project.developers?.name}`,
                      onPress: () => setSelectedProjectId(project.id),
                    })),
                  ]
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {selectedProjectId
                  ? projects.find((p) => p.id === selectedProjectId)?.name
                  : 'اختر المشروع'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الوحدة *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                if (unitTypes.length === 0) {
                  Alert.alert('تنبيه', 'لا توجد أنواع وحدات متاحة. يرجى إضافة أنواع الوحدات من الإعدادات أولاً.');
                  return;
                }
                Alert.alert(
                  'اختر نوع الوحدة',
                  '',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    ...unitTypes.map((unitType) => ({
                      text: unitType.name,
                      onPress: () => setSelectedUnitTypeId(unitType.id),
                    })),
                  ]
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {selectedUnitTypeId
                  ? unitTypes.find((ut) => ut.id === selectedUnitTypeId)?.name
                  : 'اختر نوع الوحدة'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>المساحة (م²)</Text>
              <TextInput
                style={styles.input}
                value={areaSqm}
                onChangeText={setAreaSqm}
                placeholder="120"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>عدد الغرف</Text>
              <TextInput
                style={styles.input}
                value={bedrooms}
                onChangeText={setBedrooms}
                placeholder="3"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>عدد الحمامات</Text>
              <TextInput
                style={styles.input}
                value={bathrooms}
                onChangeText={setBathrooms}
                placeholder="2"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>الطابق</Text>
              <TextInput
                style={styles.input}
                value={floorNumber}
                onChangeText={setFloorNumber}
                placeholder="5"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الوحدة</Text>
            <TextInput
              style={styles.input}
              value={unitNumber}
              onChangeText={setUnitNumber}
              placeholder="A-501"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>السعر الإجمالي *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="1500000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نسبة الخصم (%)</Text>
            <TextInput
              style={styles.input}
              value={discountPercentage}
              onChangeText={setDiscountPercentage}
              placeholder="10"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نسبة المقدم (%)</Text>
            <TextInput
              style={styles.input}
              value={downPaymentPercentage}
              onChangeText={setDownPaymentPercentage}
              placeholder="20"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عدد سنوات التقسيط</Text>
            <TextInput
              style={styles.input}
              value={installmentYears}
              onChangeText={setInstallmentYears}
              placeholder="10"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          {/* Dynamic Fields */}
          {dynamicFields.length > 0 && (
            <View style={styles.dynamicFieldsContainer}>
              <Text style={styles.dynamicFieldsTitle}>معلومات إضافية</Text>
              {dynamicFields.map(renderDynamicField)}
            </View>
          )}

          {/* Installment Calculations */}
          {monthlyInstallment && (
            <View style={styles.calculationsContainer}>
              <Text style={styles.calculationsTitle}>حساب الأقساط</Text>
              
              {/* Price breakdown */}
              {(parseFloat(discountPercentage) > 0 || parseFloat(downPaymentPercentage) > 0) && (
                <View style={styles.priceBreakdown}>
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationValue}>{parseFloat(price).toLocaleString()} ج.م</Text>
                    <Text style={styles.calculationLabel}>السعر الأصلي</Text>
                  </View>
                  
                  {parseFloat(discountPercentage) > 0 && (
                    <>
                      <View style={styles.calculationRow}>
                        <Text style={styles.calculationValue}>
                          -{((parseFloat(price) * parseFloat(discountPercentage)) / 100).toLocaleString()} ج.م
                        </Text>
                        <Text style={styles.calculationLabel}>الخصم ({discountPercentage}%)</Text>
                      </View>
                      <View style={styles.calculationRow}>
                        <Text style={styles.calculationValue}>
                          {(parseFloat(price) - (parseFloat(price) * parseFloat(discountPercentage)) / 100).toLocaleString()} ج.م
                        </Text>
                        <Text style={styles.calculationLabel}>السعر بعد الخصم</Text>
                      </View>
                    </>
                  )}
                  
                  {parseFloat(downPaymentPercentage) > 0 && (
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationValue}>
                        {(() => {
                          const priceAfterDiscount = parseFloat(price) - (parseFloat(price) * parseFloat(discountPercentage)) / 100;
                          return ((priceAfterDiscount * parseFloat(downPaymentPercentage)) / 100).toLocaleString();
                        })()} ج.م
                      </Text>
                      <Text style={styles.calculationLabel}>المقدم ({downPaymentPercentage}%)</Text>
                    </View>
                  )}
                  
                  <View style={[styles.calculationRow, styles.totalRow]}>
                    <Text style={[styles.calculationValue, styles.totalValue]}>
                      {(() => {
                        const priceAfterDiscount = parseFloat(price) - (parseFloat(price) * parseFloat(discountPercentage)) / 100;
                        const downPayment = (priceAfterDiscount * parseFloat(downPaymentPercentage)) / 100;
                        return (priceAfterDiscount - downPayment).toLocaleString();
                      })()} ج.م
                    </Text>
                    <Text style={[styles.calculationLabel, styles.totalLabel]}>المبلغ المتبقي للتقسيط</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.installmentOptions}>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationValue}>{monthlyInstallment} ج.م</Text>
                  <Text style={styles.calculationLabel}>قسط شهري</Text>
                </View>
                
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationValue}>{quarterlyInstallment} ج.م</Text>
                  <Text style={styles.calculationLabel}>قسط ربع سنوي</Text>
                </View>
                
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationValue}>{semiAnnualInstallment} ج.م</Text>
                  <Text style={styles.calculationLabel}>قسط نصف سنوي</Text>
                </View>
                
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationValue}>{annualInstallment} ج.م</Text>
                  <Text style={styles.calculationLabel}>قسط سنوي</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'جاري الإضافة...' : 'إضافة الوحدة'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5EEF5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    textAlign: 'right',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
  },
  calculationsContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3B619F',
  },
  calculationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B619F',
    textAlign: 'center',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  calculationLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  calculationValue: {
    fontSize: 16,
    color: '#3B619F',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B619F',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  dynamicFieldsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dynamicFieldsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 16,
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  booleanButton: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  booleanButtonActive: {
    backgroundColor: '#3B619F',
  },
  booleanButtonText: {
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '500',
  },
  booleanButtonTextActive: {
    color: '#FFFFFF',
  },
  priceBreakdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  installmentOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B619F',
    paddingTop: 8,
    marginTop: 8,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B619F',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B619F',
  },
});