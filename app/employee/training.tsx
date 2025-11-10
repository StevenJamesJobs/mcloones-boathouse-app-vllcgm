
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { trainingMaterials } from '@/data/mockData';

export default function TrainingScreen() {
  const handleOpenMaterial = (url: string) => {
    Linking.openURL(url);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'doc.fill';
      case 'image':
        return 'photo.fill';
      case 'video':
        return 'play.rectangle.fill';
      default:
        return 'doc.fill';
    }
  };

  // Group materials by category
  const groupedMaterials = trainingMaterials.reduce((acc, material) => {
    if (!acc[material.category]) {
      acc[material.category] = [];
    }
    acc[material.category].push(material);
    return acc;
  }, {} as Record<string, typeof trainingMaterials>);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Training Materials',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.introText}>
            Access all training materials, guides, and handbooks here.
          </Text>

          {Object.entries(groupedMaterials).map(([category, materials]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {materials.map((material) => (
                <Pressable
                  key={material.id}
                  style={commonStyles.employeeCard}
                  onPress={() => handleOpenMaterial(material.url)}
                >
                  <View style={styles.materialHeader}>
                    <View style={styles.materialIcon}>
                      <IconSymbol 
                        name={getIconForType(material.type)} 
                        color={colors.employeeAccent} 
                        size={24} 
                      />
                    </View>
                    <View style={styles.materialInfo}>
                      <Text style={styles.materialTitle}>{material.title}</Text>
                      <Text style={styles.materialDescription}>{material.description}</Text>
                      <Text style={styles.materialType}>{material.type.toUpperCase()}</Text>
                    </View>
                    <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
                  </View>
                </Pressable>
              ))}
            </View>
          ))}

          <View style={styles.helpCard}>
            <IconSymbol name="questionmark.circle.fill" color={colors.employeeAccent} size={24} />
            <Text style={styles.helpText}>
              Need help or have questions? Contact your manager or the training department.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  introText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.employeePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  materialType: {
    fontSize: 12,
    color: colors.employeeAccent,
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
  },
});
