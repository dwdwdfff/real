import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Building2, MapPin, DollarSign, Calendar, Users, Star, Search, Filter, Phone, Mail, Globe, Share2 } from 'lucide-react-native';
import { supabase, Project } from '@/lib/supabase';
import Header from '@/components/Header';

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (id) {
      loadProjectDetails();
      loadProjectUnits();
    }
  }, [id]);

  useEffect(() => {
    filterUnits();
  }, [searchQuery, selectedFilter, units]);

  const loadProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          developer:developers(*),
          area:areas(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل بيانات المشروع');
    }
  };

  const loadProjectUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('project_id', id)
        .order('area_sqm', { ascending: true });

      if (error) throw error;
      setUnits(data || []);
      setFilteredUnits(data || []);
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUnits = () => {
    let filtered = units;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(unit =>
        unit.area_sqm?.toString().includes(searchQuery) ||
        unit.price?.toString().includes(searchQuery) ||
        unit.unit_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(unit => unit.unit_type === selectedFilter);
    }

    setFilteredUnits(filtered);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'غير محدد';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getUnitTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'شقة';
      case 'villa': return 'فيلا';
      case 'duplex': return 'دوبلكس';
      case 'penthouse': return 'بنتهاوس';
      case 'studio': return 'استوديو';
      default: return type;
    }
  };

  const filterOptions = [
    { key: 'all', label: 'الكل' },
    { key: 'apartment', label: 'شقة' },
    { key: 'villa', label: 'فيلا' },
    { key: 'duplex', label: 'دوبلكس' },
    { key: 'penthouse', label: 'بنتهاوس' },
    { key: 'studio', label: 'استوديو' },
  ];

  if (loading || !project) {
    return (
      <View style={styles.container}>
        <Header title="تفاصيل المشروع" />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={project.name} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Images */}
        {project.images && project.images.length > 0 && (
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.imageSlider}
          >
            {project.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.projectImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Project Info */}
        <View style={styles.projectInfo}>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{project.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FCD34D" fill="#FCD34D" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
          </View>

          {/* Developer & Location */}
          <View style={styles.infoSection}>
            {project.developer && (
              <View style={styles.infoRow}>
                <Building2 size={18} color="#3B82F6" />
                <Text style={styles.infoText}>{project.developer.name}</Text>
              </View>
            )}

            {project.area && (
              <View style={styles.infoRow}>
                <MapPin size={18} color="#EF4444" />
                <Text style={styles.infoText}>{project.area.name}, {project.area.city}</Text>
              </View>
            )}

            {project.delivery_date && (
              <View style={styles.infoRow}>
                <Calendar size={18} color="#10B981" />
                <Text style={styles.infoText}>تاريخ التسليم: {project.delivery_date}</Text>
              </View>
            )}
          </View>

          {/* Price Range */}
          {(project.price_min || project.price_max) && (
            <View style={styles.priceSection}>
              <Text style={styles.sectionTitle}>نطاق الأسعار</Text>
              <View style={styles.priceRange}>
                <Text style={styles.priceText}>
                  {project.price_min && project.price_max
                    ? `${formatPrice(project.price_min)} - ${formatPrice(project.price_max)}`
                    : formatPrice(project.price_min || project.price_max)}
                </Text>
              </View>
            </View>
          )}

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>المميزات</Text>
            <View style={styles.featuresGrid}>
              {project.has_clubhouse && (
                <View style={styles.featureItem}>
                  <Users size={16} color="#10B981" />
                  <Text style={styles.featureText}>نادي صحي</Text>
                </View>
              )}
              <View style={styles.featureItem}>
                <Building2 size={16} color="#3B82F6" />
                <Text style={styles.featureText}>أمن وحراسة</Text>
              </View>
              <View style={styles.featureItem}>
                <MapPin size={16} color="#EF4444" />
                <Text style={styles.featureText}>موقع متميز</Text>
              </View>
            </View>
          </View>

          {/* Dynamic Fields */}
          {project.dynamic_data && Object.keys(project.dynamic_data).length > 0 && (
            <View style={styles.dynamicFieldsSection}>
              <Text style={styles.sectionTitle}>معلومات إضافية</Text>
              <View style={styles.dynamicFieldsGrid}>
                {Object.entries(project.dynamic_data).map(([key, value]) => (
                  <View key={key} style={styles.dynamicFieldItem}>
                    <Text style={styles.dynamicFieldLabel}>{key}:</Text>
                    <Text style={styles.dynamicFieldValue}>
                      {typeof value === 'boolean' ? (value ? 'نعم' : 'لا') : String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {project.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>وصف المشروع</Text>
              <Text style={styles.descriptionText}>{project.description}</Text>
            </View>
          )}

          {/* Contact Info */}
          {project.developer && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>معلومات التواصل</Text>
              <View style={styles.contactGrid}>
                {project.developer.phone && (
                  <TouchableOpacity style={styles.contactItem}>
                    <Phone size={16} color="#10B981" />
                    <Text style={styles.contactText}>{project.developer.phone}</Text>
                  </TouchableOpacity>
                )}
                {project.developer.email && (
                  <TouchableOpacity style={styles.contactItem}>
                    <Mail size={16} color="#3B82F6" />
                    <Text style={styles.contactText}>{project.developer.email}</Text>
                  </TouchableOpacity>
                )}
                {project.developer.website && (
                  <TouchableOpacity style={styles.contactItem}>
                    <Globe size={16} color="#8B5CF6" />
                    <Text style={styles.contactText}>الموقع الإلكتروني</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Units Section */}
        <View style={styles.unitsSection}>
          <Text style={styles.sectionTitle}>الوحدات المتاحة ({filteredUnits.length})</Text>

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في الوحدات..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  selectedFilter === option.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(option.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === option.key && styles.filterButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Units List */}
          {filteredUnits.length === 0 ? (
            <View style={styles.emptyUnits}>
              <Text style={styles.emptyText}>لا توجد وحدات متاحة</Text>
            </View>
          ) : (
            <View style={styles.unitsList}>
              {filteredUnits.map((unit) => (
                <View key={unit.id} style={styles.unitCard}>
                  <View style={styles.unitHeader}>
                    <Text style={styles.unitType}>{getUnitTypeLabel(unit.unit_type)}</Text>
                    <Text style={styles.unitArea}>{unit.area_sqm} م²</Text>
                  </View>
                  
                  <View style={styles.unitDetails}>
                    <Text style={styles.unitPrice}>{formatPrice(unit.price)}</Text>
                    <Text style={styles.unitPricePerMeter}>
                      {unit.area_sqm ? formatPrice(Math.round(unit.price / unit.area_sqm)) : 'غير محدد'} / م²
                    </Text>
                  </View>

                  <View style={styles.unitPayment}>
                    <Text style={styles.paymentLabel}>مقدم: {formatPrice(unit.down_payment)}</Text>
                    <Text style={styles.paymentLabel}>قسط: {formatPrice(unit.monthly_installment)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color="#3B82F6" />
          <Text style={styles.shareButtonText}>مشاركة</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactButton}>
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>اتصل الآن</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  imageSlider: {
    height: 250,
  },
  projectImage: {
    width: width,
    height: 250,
  },
  projectInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#64748B',
    flex: 1,
  },
  priceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  priceRange: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  contactSection: {
    marginBottom: 20,
  },
  contactGrid: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  unitsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  filterContainer: {
    marginBottom: 20,
    marginHorizontal: -4,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyUnits: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  unitsList: {
    gap: 12,
  },
  unitCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  unitArea: {
    fontSize: 14,
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  unitPricePerMeter: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unitPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EBF4FF',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  contactButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dynamicFieldsSection: {
    marginBottom: 24,
  },
  dynamicFieldsGrid: {
    gap: 12,
  },
  dynamicFieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dynamicFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  dynamicFieldValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    textAlign: 'right',
  },
});