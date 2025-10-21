import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Building2, Calendar, Plus } from 'lucide-react-native';
import { supabase, Developer } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 6;
const CARDS_PER_ROW = 4;
const CARD_WIDTH = (width - (CARD_MARGIN * 2) - (CARD_MARGIN * (CARDS_PER_ROW - 1))) / CARDS_PER_ROW;

export default function DevelopersScreen() {
  const router = useRouter();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevelopers();
  }, []);

  async function loadDevelopers() {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevelopers(data || []);
    } catch (error) {
      console.error('Error loading developers:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderDeveloper = ({ item }: { item: Developer }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/developers/${item.id}` as any)}
      activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {item.logo_url ? (
          <Image 
            source={{ uri: item.logo_url }} 
            style={styles.developerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Building2 size={32} color="#3b82f6" />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        {item.established_date && (
          <Text style={styles.dateText}>
            {new Date(item.established_date).getFullYear()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المطورين</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/developers/add')}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {developers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Building2 size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>لا يوجد مطورين</Text>
          <Text style={styles.emptySubtext}>ابدأ بإضافة أول مطور</Text>
        </View>
      ) : (
        <FlatList
          data={developers}
          renderItem={renderDeveloper}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  list: {
    padding: CARD_MARGIN,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: CARD_MARGIN,
    paddingHorizontal: CARD_MARGIN / 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
    marginHorizontal: CARD_MARGIN / 2,
  },
  imageContainer: {
    width: CARD_WIDTH - 32,
    height: CARD_WIDTH - 32,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  developerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
});
