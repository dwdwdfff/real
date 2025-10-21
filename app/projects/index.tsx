import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react-native';
import { supabase, Project, Developer, Area } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 4;
const CARD_WIDTH = (width - (CARD_MARGIN * 2) - (CARD_MARGIN * (CARDS_PER_ROW - 1))) / CARDS_PER_ROW;

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('الكل');
  const [selectedDeveloper, setSelectedDeveloper] = useState('الكل');
  const [selectedArea, setSelectedArea] = useState('الكل');

  const projectTypes = ['الكل', 'سكني', 'تجاري', 'إداري', 'طبي', 'تعليمي', 'ترفيهي'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load projects with developer and area info
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          developer:developers(id, name),
          area:areas(id, name, city)
        `)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Load developers for filter
      const { data: developersData, error: developersError } = await supabase
        .from('developers')
        .select('id, name')
        .order('name', { ascending: true });

      if (developersError) throw developersError;
      setDevelopers(developersData || []);

      // Load areas for filter
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('id, name, city')
        .order('name', { ascending: true });

      if (areasError) throw areasError;
      setAreas(areasData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.developer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.area?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedProjectType === 'الكل' || project.project_type === selectedProjectType;
    const matchesDeveloper = selectedDeveloper === 'الكل' || project.developer_id === selectedDeveloper;
    const matchesArea = selectedArea === 'الكل' || project.area_id === selectedArea;
    
    return matchesSearch && matchesType && matchesDeveloper && matchesArea;
  });

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(`/projects/${item.id}` as any)}
      activeOpacity={0.7}>
      <View style={styles.projectImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Building2 size={24} color="#3b82f6" />
          </View>
        )}
      </View>
      <View style={styles.projectContent}>
        <Text style={styles.projectTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.projectType}>
          {item.project_type || 'سكني'}
        </Text>
        {item.developer && (
          <Text style={styles.projectDeveloper} numberOfLines={1}>
            {item.developer.name}
          </Text>
        )}
        {item.area && (
          <View style={styles.locationContainer}>
            <MapPin size={10} color="#64748b" />
            <Text style={styles.projectLocation} numberOfLines={1}>
              {item.area.name}
            </Text>
          </View>
        )}
        {item.price_min && (
          <Text style={styles.projectPrice}>
            من {item.price_min.toLocaleString()} ج.م
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>المشاريع</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>المشاريع</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/projects/add')}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المشاريع..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>النوع</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProjectType}
              onValueChange={setSelectedProjectType}
              style={styles.picker}>
              {projectTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>المطور</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDeveloper}
              onValueChange={setSelectedDeveloper}
              style={styles.picker}>
              <Picker.Item label="الكل" value="الكل" />
              {developers.map((developer) => (
                <Picker.Item key={developer.id} label={developer.name} value={developer.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>المنطقة</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedArea}
              onValueChange={setSelectedArea}
              style={styles.picker}>
              <Picker.Item label="الكل" value="الكل" />
              {areas.map((area) => (
                <Picker.Item key={area.id} label={`${area.name} - ${area.city}`} value={area.id} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredProjects.length} مشروع
        </Text>
      </View>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Building2 size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>لا توجد مشاريع</Text>
          <Text style={styles.emptySubtext}>جرب تغيير معايير البحث</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          numColumns={CARDS_PER_ROW}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterItem: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: CARD_MARGIN,
    paddingHorizontal: CARD_MARGIN / 2,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: CARD_MARGIN / 2,
  },
  projectImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.6,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectContent: {
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 14,
  },
  projectType: {
    fontSize: 9,
    color: '#8b5cf6',
    fontWeight: '500',
    marginBottom: 4,
  },
  projectDeveloper: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 9,
    color: '#64748b',
    marginLeft: 4,
  },
  projectPrice: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
});