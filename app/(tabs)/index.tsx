import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Building2, MapPin, Plus, List, Users, Navigation, Share2, Home, Calculator, DollarSign, TrendingUp, Settings, GitCompare, Edit3, Save, Globe } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { colors, isDark } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [cards, setCards] = useState([
    {
      id: 'add-area',
      title: 'إضافة منطقة',
      icon: MapPin,
      route: '/areas/add',
    },
    {
      id: 'add-neighborhood',
      title: 'إضافة حي',
      icon: Navigation,
      route: '/neighborhoods/add',
    },
    {
      id: 'add-developer',
      title: 'إضافة مطور',
      icon: Building2,
      route: '/developers/add',
    },
    {
      id: 'add-project',
      title: 'إضافة مشروع',
      icon: Plus,
      route: '/projects/add',
    },
    {
      id: 'add-unit',
      title: 'إضافة وحدة',
      icon: Home,
      route: '/units/add',
    },
    {
      id: 'developer-prices',
      title: 'أسعار المطورين',
      icon: DollarSign,
      route: '/developers/prices',
    },
    {
      id: 'project-prices',
      title: 'أسعار المشاريع',
      icon: TrendingUp,
      route: '/projects/prices',
    },
    {
      id: 'price-calculator',
      title: 'حاسبة الأسعار',
      icon: Calculator,
      route: '/calculator',
    },
    {
      id: 'view-projects',
      title: 'عرض المشاريع',
      icon: List,
      route: '/(tabs)/projects',
    },
    {
      id: 'view-developers',
      title: 'عرض المطورين',
      icon: Users,
      route: '/developers',
    },
    {
      id: 'view-areas',
      title: 'عرض المناطق',
      icon: Navigation,
      route: '/areas',
    },
    {
      id: 'view-neighborhoods',
      title: 'عرض الأحياء',
      icon: Navigation,
      route: '/neighborhoods',
    },
    {
      id: 'view-units',
      title: 'عرض الوحدات',
      icon: Home,
      route: '/units',
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      icon: Settings,
      route: '/settings',
    },
    {
      id: 'compare',
      title: 'مقارنة المشاريع',
      icon: GitCompare,
      route: '/compare',
    },
  ]);

  const getDefaultCards = () => [
    {
      id: 'add-area',
      titleKey: 'dashboard.addArea',
      icon: MapPin,
      route: '/areas/add',
      color: '#3B82F6',
    },
 
    {
      id: 'add-developer',
      titleKey: 'dashboard.addDeveloper',
      icon: Building2,
      route: '/developers/add',
      color: '#3B82F6',
    },
    {
      id: 'add-project',
      titleKey: 'dashboard.addProject',
      icon: Plus,
      route: '/projects/add',
      color: '#3B82F6',
    },
    {
      id: 'add-unit',
      titleKey: 'dashboard.addUnit',
      icon: Home,
      route: '/units/add',
      color: '#3B82F6',
    },
    {
      id: 'developer-prices',
      titleKey: 'dashboard.developerPrices',
      icon: DollarSign,
      route: '/developers/prices',
      color: '#3B82F6',
    },
    {
      id: 'project-prices',
      titleKey: 'dashboard.projectPrices',
      icon: TrendingUp,
      route: '/projects/prices',
      color: '#3B82F6',
    },
    {
      id: 'price-calculator',
      titleKey: 'dashboard.priceCalculator',
      icon: Calculator,
      route: '/calculator',
      color: '#3B82F6',
    },
    {
      id: 'view-projects',
      titleKey: 'dashboard.viewProjects',
      icon: List,
      route: '/(tabs)/projects',
      color: '#3B82F6',
    },
    {
      id: 'view-developers',
      titleKey: 'dashboard.viewDevelopers',
      icon: Users,
      route: '/developers',
      color: '#3B82F6',
    },
    {
      id: 'view-areas',
      titleKey: 'dashboard.viewAreas',
      icon: Navigation,
      route: '/areas',
      color: '#3B82F6',
    },

    
    {
      id: 'view-units',
      titleKey: 'dashboard.viewUnits',
      icon: Home,
      route: '/units',
      color: '#3B82F6',
    },
    {
      id: 'settings',
      titleKey: 'dashboard.settings',
      icon: Settings,
      route: '/settings',
      color: '#3B82F6',
    },
    {
      id: 'compare',
      titleKey: 'dashboard.compare',
      icon: GitCompare,
      route: '/comparison',
      color: '#3B82F6',
    },
  ];

  useEffect(() => {
    loadCardOrder();
  }, []);

  const loadCardOrder = async () => {
    try {
      const defaultCards = getDefaultCards();
      const savedOrder = await AsyncStorage.getItem('cardOrder');
      if (savedOrder) {
        const orderIds = JSON.parse(savedOrder);
        const orderedCards = orderIds.map((id: string) => 
          defaultCards.find(card => card.id === id)
        ).filter(Boolean);
        
        // Add any new cards that weren't in the saved order
        const newCards = defaultCards.filter(card => 
          !orderIds.includes(card.id)
        );
        
        setCards([...orderedCards, ...newCards]);
      } else {
        setCards(defaultCards);
      }
    } catch (error) {
      console.error('Error loading card order:', error);
      setCards(getDefaultCards());
    }
  };

  const saveCardOrder = async (newCards: any[]) => {
    try {
      const orderIds = newCards.map(card => card.id);
      await AsyncStorage.setItem('cardOrder', JSON.stringify(orderIds));
    } catch (error) {
      console.error('Error saving card order:', error);
    }
  };

  const moveCard = (fromIndex: number, toIndex: number) => {
    const newCards = [...cards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, movedCard);
    setCards(newCards);
    saveCardOrder(newCards);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
    I18nManager.forceRTL(newLanguage === 'ar');
  };

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 50) / 3;

  const handleShare = () => {
    // هنا تضيف وظيفة الشير
    console.log('Share button pressed');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.modernHeader, { backgroundColor: colors.primary }]}>
        {/* زر التحرير */}
        <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
          {isEditMode ? (
            <Save size={20} color="#FFFFFF" />
          ) : (
            <Edit3 size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        {/* العنوان */}
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('app.title')}
        </Text>
        
        {/* أزرار اللغة والمشاركة */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
            <Globe size={18} color="#FFFFFF" />
            <Text style={styles.languageText}>
              {language === 'ar' ? 'EN' : 'ع'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {isEditMode && (
        <View style={[styles.editModeNotice, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.editModeText, { color: colors.text }]}>
            {t('dashboard.editMode')}
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.modernGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.modernCardWrapper, 
                { width: cardWidth },
                isEditMode && styles.editModeCard
              ]}
              onPress={() => !isEditMode && router.push(card.route as any)}
              onLongPress={() => setIsEditMode(true)}
              activeOpacity={isEditMode ? 1 : 0.8}
              disabled={isEditMode}>
              <View style={[
                styles.modernCard, 
                { 
                  backgroundColor: colors.surface
                }
              ]}>
                <View style={[styles.modernIconContainer, { backgroundColor: card.color + '20' }]}>
                  <card.icon size={32} color={card.color} strokeWidth={2} />
                </View>
                <Text style={[styles.modernCardTitle, { color: colors.text }]}>
                  {t(card.titleKey)}
                </Text>
                {isEditMode && (
                  <View style={[styles.dragIndicator, { [isRTL ? 'left' : 'right']: 8 }]}>
                    <View style={[styles.dragDot, { backgroundColor: colors.textSecondary }]} />
                    <View style={[styles.dragDot, { backgroundColor: colors.textSecondary }]} />
                    <View style={[styles.dragDot, { backgroundColor: colors.textSecondary }]} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Modern Header
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Edit Mode Notice
  editModeNotice: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.3)',
  },
  editModeText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },

  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  // Modern Grid
  modernGrid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  modernCardWrapper: {
    marginBottom: 16,
  },
  editModeCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  modernCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  modernIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modernCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Drag Indicator
  dragIndicator: {
    position: 'absolute',
    top: 8,
    flexDirection: 'column',
    gap: 2,
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});