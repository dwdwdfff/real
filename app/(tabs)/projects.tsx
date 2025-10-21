import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Building2, MapPin, DollarSign, Search, Filter, Star, Calendar, Users } from 'lucide-react-native';
import { supabase, Project } from '@/lib/supabase';
import Header from '@/components/Header';

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          developer:developers(*),
          area:areas(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    filterProjects();
  }, [searchQuery, selectedFilter, projects]);

  const filterProjects = () => {
    let filtered = projects;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.developer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.area?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(project => {
        switch (selectedFilter) {
          case 'residential':
            return project.type === 'residential';
          case 'commercial':
            return project.type === 'commercial';
          case 'mixed':
            return project.type === 'mixed';
          default:
            return true;
        }
      });
    }

    setFilteredProjects(filtered);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'غير محدد';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case 'residential': return 'سكني';
      case 'commercial': return 'تجاري';
      case 'mixed': return 'مختلط';
      default: return type;
    }
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'residential': return '#10B981';
      case 'commercial': return '#3B82F6';
      case 'mixed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(`/projects/${item.id}` as any)}
      activeOpacity={0.9}>
      
      {/* Project Image */}
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Building2 size={40} color="#9CA3AF" />
          </View>
        )}
        
        {/* Project Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: getProjectTypeColor(item.type || 'residential') }]}>
          <Text style={styles.typeBadgeText}>{getProjectTypeLabel(item.type || 'residential')}</Text>
        </View>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Star size={12} color="#FCD34D" fill="#FCD34D" />
          <Text style={styles.ratingText}>4.5</Text>
        </View>
      </View>

      {/* Project Content */}
      <View style={styles.projectContent}>
        <Text style={styles.projectName} numberOfLines={2}>{item.name}</Text>
        
        {/* Developer Info */}
        {item.developer && (
          <View style={styles.developerRow}>
            <View style={styles.developerInfo}>
              <Building2 size={14} color="#6B7280" />
              <Text style={styles.developerText} numberOfLines={1}>{item.developer.name}</Text>
            </View>
          </View>
        )}

        {/* Location */}
        {item.area && (
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.area.name}, {item.area.city}
            </Text>
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresRow}>
          {item.has_clubhouse && (
            <View style={styles.featureBadge}>
              <Users size={10} color="#10B981" />
              <Text style={styles.featureText}>نادي</Text>
            </View>
          )}
          {item.delivery_date && (
            <View style={styles.featureBadge}>
              <Calendar size={10} color="#3B82F6" />
              <Text style={styles.featureText}>2025</Text>
            </View>
          )}
        </View>

        {/* Price */}
        {(item.price_min || item.price_max) && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>يبدأ من</Text>
            <Text style={styles.priceValue}>
              {formatPrice(item.price_min || item.price_max)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const filterOptions = [
    { key: 'all', label: 'الكل' },
    { key: 'residential', label: 'سكني' },
    { key: 'commercial', label: 'تجاري' },
    { key: 'mixed', label: 'مختلط' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="المشاريع" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>جاري تحميل المشاريع...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="المشاريع" />

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المشاريع..."
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
      </View>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Building2 size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>لا توجد مشاريع</Text>
          <Text style={styles.emptySubtext}>ابدأ بإضافة أول مشروع</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.projectsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  projectsList: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  projectCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  projectContent: {
    padding: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 20,
  },
  developerRow: {
    marginBottom: 6,
  },
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  developerText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#10B981',
  },
  priceContainer: {
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
