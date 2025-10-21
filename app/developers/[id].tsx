import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Star, 
  Calendar,
  Users,
  Award,
  ExternalLink,
  MessageCircle
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';

const { width } = Dimensions.get('window');

interface Developer {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  established_year?: number;
  total_projects?: number;
  rating?: number;
  specialization?: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  image?: string;
  location?: string;
  price_range?: string;
  status?: string;
}

export default function DeveloperDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDeveloperDetails();
      fetchDeveloperProjects();
    }
  }, [id]);

  const fetchDeveloperDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDeveloper(data);
    } catch (error) {
      console.error('Error fetching developer:', error);
    }
  };

  const fetchDeveloperProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, image, location, price_range, status')
        .eq('developer_id', id)
        .limit(6);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          color={i <= rating ? "#F59E0B" : "#E5E7EB"}
          fill={i <= rating ? "#F59E0B" : "transparent"}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.modernHeader}>
          <BackButton />
          <Text style={styles.headerTitle}>تفاصيل المطور</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  if (!developer) {
    return (
      <View style={styles.container}>
        <View style={styles.modernHeader}>
          <BackButton />
          <Text style={styles.headerTitle}>تفاصيل المطور</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>لم يتم العثور على المطور</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <BackButton />
        <Text style={styles.headerTitle}>تفاصيل المطور</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Developer Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {developer.logo ? (
              <Image source={{ uri: developer.logo }} style={styles.developerLogo} />
            ) : (
              <View style={styles.placeholderLogo}>
                <Building2 size={40} color="#3B82F6" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.developerName}>{developer.name}</Text>
              {developer.rating && (
                <View style={styles.ratingContainer}>
                  {renderStars(developer.rating)}
                  <Text style={styles.ratingText}>({developer.rating})</Text>
                </View>
              )}
              {developer.specialization && (
                <Text style={styles.specialization}>{developer.specialization}</Text>
              )}
            </View>
          </View>

          {developer.description && (
            <Text style={styles.description}>{developer.description}</Text>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {developer.established_year && (
            <View style={styles.statCard}>
              <Calendar size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{developer.established_year}</Text>
              <Text style={styles.statLabel}>سنة التأسيس</Text>
            </View>
          )}
          
          {developer.total_projects && (
            <View style={styles.statCard}>
              <Building2 size={24} color="#10B981" />
              <Text style={styles.statValue}>{developer.total_projects}</Text>
              <Text style={styles.statLabel}>مشروع</Text>
            </View>
          )}

          <View style={styles.statCard}>
            <Award size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{projects.length}</Text>
            <Text style={styles.statLabel}>مشروع متاح</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>معلومات التواصل</Text>
          
          {developer.phone && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleCall(developer.phone!)}
            >
              <View style={styles.contactIcon}>
                <Phone size={20} color="#10B981" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>الهاتف</Text>
                <Text style={styles.contactValue}>{developer.phone}</Text>
              </View>
              <ExternalLink size={16} color="#64748B" />
            </TouchableOpacity>
          )}

          {developer.email && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleEmail(developer.email!)}
            >
              <View style={styles.contactIcon}>
                <Mail size={20} color="#3B82F6" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>البريد الإلكتروني</Text>
                <Text style={styles.contactValue}>{developer.email}</Text>
              </View>
              <ExternalLink size={16} color="#64748B" />
            </TouchableOpacity>
          )}

          {developer.website && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleWebsite(developer.website!)}
            >
              <View style={styles.contactIcon}>
                <Globe size={20} color="#8B5CF6" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>الموقع الإلكتروني</Text>
                <Text style={styles.contactValue}>{developer.website}</Text>
              </View>
              <ExternalLink size={16} color="#64748B" />
            </TouchableOpacity>
          )}

          {developer.address && (
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <MapPin size={20} color="#EF4444" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>العنوان</Text>
                <Text style={styles.contactValue}>{developer.address}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Projects Section */}
        {projects.length > 0 && (
          <View style={styles.projectsSection}>
            <Text style={styles.sectionTitle}>المشاريع</Text>
            <View style={styles.projectsGrid}>
              {projects.map((project) => (
                <View key={project.id} style={styles.projectCard}>
                  {project.image ? (
                    <Image source={{ uri: project.image }} style={styles.projectImage} />
                  ) : (
                    <View style={styles.placeholderProjectImage}>
                      <Building2 size={24} color="#64748B" />
                    </View>
                  )}
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    {project.location && (
                      <Text style={styles.projectLocation}>{project.location}</Text>
                    )}
                    {project.price_range && (
                      <Text style={styles.projectPrice}>{project.price_range}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Actions */}
        <View style={styles.actionsContainer}>
          {developer.phone && (
            <TouchableOpacity 
              style={styles.primaryAction}
              onPress={() => handleCall(developer.phone!)}
            >
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>اتصل الآن</Text>
            </TouchableOpacity>
          )}

          {developer.phone && (
            <TouchableOpacity 
              style={styles.secondaryAction}
              onPress={() => Linking.openURL(`https://wa.me/${developer.phone?.replace(/[^0-9]/g, '')}`)}
            >
              <MessageCircle size={20} color="#10B981" />
              <Text style={styles.secondaryActionText}>واتساب</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  // Modern Header
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },

  content: {
    flex: 1,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  developerLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  placeholderLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Contact Section
  contactSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },

  // Projects Section
  projectsSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  projectCard: {
    width: (width - 84) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: 100,
  },
  placeholderProjectImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectInfo: {
    padding: 12,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  projectPrice: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },

  // Actions Container
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
});