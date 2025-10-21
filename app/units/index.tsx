import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, Home, Trash2, Bed, Bath } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface Unit {
  id: string;
  unit_type: string;
  area_sqm: number | null;
  bedrooms: number;
  bathrooms: number;
  price: number;
  down_payment: number | null;
  monthly_installment: number | null;
  quarterly_installment: number | null;
  semi_annual_installment: number | null;
  annual_installment: number | null;
  installment_years: number;
  floor_number: number | null;
  unit_number: string | null;
  status: string;
  projects: {
    name: string;
    developers: {
      name: string;
    };
  };
}

export default function UnitsScreen() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    filterUnits();
  }, [searchQuery, units]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          projects (
            name,
            developers (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الوحدات');
    } finally {
      setLoading(false);
    }
  };

  const filterUnits = () => {
    if (!searchQuery.trim()) {
      setFilteredUnits(units);
      return;
    }

    const filtered = units.filter(
      (unit) =>
        unit.unit_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.projects?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.projects?.developers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.unit_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUnits(filtered);
  };

  const handleDelete = async (id: string, unitInfo: string) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف الوحدة "${unitInfo}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('units')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchUnits();
            } catch (error) {
              console.error('Error deleting unit:', error);
              Alert.alert('خطأ', 'حدث خطأ في حذف الوحدة');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#10B981';
      case 'reserved':
        return '#F59E0B';
      case 'sold':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'reserved':
        return 'محجوزة';
      case 'sold':
        return 'مباعة';
      default:
        return status;
    }
  };

  const renderUnit = ({ item }: { item: Unit }) => (
    <View style={styles.unitCard}>
      <View style={styles.unitHeader}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, `${item.unit_type} - ${item.projects?.name}`)}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
        
        <View style={styles.unitMainInfo}>
          <Text style={styles.unitType}>{item.unit_type}</Text>
          <Text style={styles.projectName}>{item.projects?.name}</Text>
          <Text style={styles.developerName}>{item.projects?.developers?.name}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.unitDetails}>
        <View style={styles.detailRow}>
          {item.area_sqm && (
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{item.area_sqm} م²</Text>
              <Text style={styles.detailLabel}>المساحة</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <View style={styles.roomInfo}>
              <Text style={styles.roomCount}>{item.bedrooms}</Text>
              <Bed size={16} color="#6B7280" />
            </View>
            <Text style={styles.detailLabel}>غرف</Text>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.roomInfo}>
              <Text style={styles.roomCount}>{item.bathrooms}</Text>
              <Bath size={16} color="#6B7280" />
            </View>
            <Text style={styles.detailLabel}>حمامات</Text>
          </View>
          
          {item.floor_number && (
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{item.floor_number}</Text>
              <Text style={styles.detailLabel}>الطابق</Text>
            </View>
          )}
        </View>

        {item.unit_number && (
          <Text style={styles.unitNumber}>رقم الوحدة: {item.unit_number}</Text>
        )}

        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(item.price)} ج.م</Text>
          {item.down_payment && (
            <Text style={styles.downPayment}>مقدم: {formatPrice(item.down_payment)} ج.م</Text>
          )}
        </View>

        {item.monthly_installment && (
          <View style={styles.installmentSection}>
            <Text style={styles.installmentTitle}>خيارات التقسيط:</Text>
            <View style={styles.installmentOptions}>
              <Text style={styles.installmentOption}>
                شهري: {formatPrice(item.monthly_installment)} ج.م
              </Text>
              {item.quarterly_installment && (
                <Text style={styles.installmentOption}>
                  ربع سنوي: {formatPrice(item.quarterly_installment)} ج.م
                </Text>
              )}
              {item.semi_annual_installment && (
                <Text style={styles.installmentOption}>
                  نصف سنوي: {formatPrice(item.semi_annual_installment)} ج.م
                </Text>
              )}
              {item.annual_installment && (
                <Text style={styles.installmentOption}>
                  سنوي: {formatPrice(item.annual_installment)} ج.م
                </Text>
              )}
            </View>
            <Text style={styles.installmentYears}>لمدة {item.installment_years} سنوات</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="الوحدات" 
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/units/add')}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="البحث في الوحدات..."
            placeholderTextColor="#9CA3AF"
          />
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
        </View>

        <FlatList
          data={filteredUnits}
          renderItem={renderUnit}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchUnits}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Home size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>لا توجد وحدات</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'لم يتم العثور على نتائج' : 'ابدأ بإضافة وحدة جديدة'}
              </Text>
            </View>
          }
        />
      </View>
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
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
  },
  searchIcon: {
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  unitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  unitMainInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  unitType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
  },
  projectName: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 2,
  },
  developerName: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  unitDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  unitNumber: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 8,
  },
  priceSection: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B619F',
  },
  downPayment: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  installmentSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  installmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
    marginBottom: 8,
  },
  installmentOptions: {
    marginBottom: 8,
  },
  installmentOption: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 2,
  },
  installmentYears: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});