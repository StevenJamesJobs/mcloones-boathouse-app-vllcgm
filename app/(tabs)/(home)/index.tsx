
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, Alert } from 'react-native';
import { Stack, Link } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { weeklySpecials, upcomingEvents, contactInfo } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();

  const handleLogin = () => {
    if (login(email, password)) {
      setLoginModalVisible(false);
      setEmail('');
      setPassword('');
      
      // Navigate based on role
      if (user?.role === 'manager') {
        router.push('/manager/home');
      } else if (user?.role === 'employee') {
        router.push('/employee/home');
      }
    } else {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => setLoginModalVisible(true)}
      style={styles.headerButton}
    >
      <IconSymbol name="person.circle.fill" color={colors.accent} size={28} />
    </Pressable>
  );

  // Get next two upcoming events
  const nextTwoEvents = upcomingEvents.slice(0, 2);

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "McLoone's Boathouse",
            headerRight: renderHeaderRight,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
      )}
      
      <View style={[commonStyles.container, styles.container]}>
        {/* Banner for non-iOS */}
        {Platform.OS !== 'ios' && (
          <CustomerBanner onLoginPress={() => setLoginModalVisible(true)} />
        )}

        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome to McLoone&apos;s Boathouse Deck Team</Text>
            <Text style={styles.welcomeText}>
              Let&apos;s get you ready for your next adventure!
            </Text>
          </View>

          {/* Weekly Specials */}
          <View style={styles.section}>
            <Text style={commonStyles.subtitle}>Weekly Specials</Text>
            {weeklySpecials.map((special) => (
              <View key={special.id} style={commonStyles.card}>
                <Text style={styles.specialTitle}>{special.title}</Text>
                <Text style={styles.specialDescription}>{special.description}</Text>
                {special.price && (
                  <Text style={styles.specialPrice}>${special.price.toFixed(2)}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Upcoming Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={commonStyles.subtitle}>Upcoming Events</Text>
              <Link href="/(tabs)/events" asChild>
                <Pressable>
                  <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
              </Link>
            </View>
            {nextTwoEvents.map((event) => (
              <View key={event.id} style={commonStyles.card}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {event.time}
                </Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </View>
            ))}
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={commonStyles.subtitle}>Contact Us</Text>
            <View style={commonStyles.card}>
              <View style={styles.contactRow}>
                <IconSymbol name="phone.fill" color={colors.accent} size={20} />
                <Text style={styles.contactText}>{contactInfo.phone}</Text>
              </View>
              <View style={styles.contactRow}>
                <IconSymbol name="envelope.fill" color={colors.accent} size={20} />
                <Text style={styles.contactText}>{contactInfo.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <IconSymbol name="mappin.circle.fill" color={colors.accent} size={20} />
                <Text style={styles.contactText}>{contactInfo.address}</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.hoursTitle}>Hours</Text>
              <Text style={styles.hoursText}>Mon-Fri: {contactInfo.hours.weekday}</Text>
              <Text style={styles.hoursText}>Sat-Sun: {contactInfo.hours.weekend}</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Login Modal */}
      <Modal
        visible={loginModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Employee Login</Text>
              <Pressable onPress={() => setLoginModalVisible(false)}>
                <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
              </Pressable>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="employee@mcloones.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Pressable style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>

            <Text style={styles.helpText}>
              Demo credentials:{'\n'}
              Manager: manager@mcloones.com{'\n'}
              Employee: employee@mcloones.com{'\n'}
              Password: any
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  headerButton: {
    padding: 4,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: colors.primary,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  specialDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  specialPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
});
