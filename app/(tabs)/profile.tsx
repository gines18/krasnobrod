import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Trash2,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { router } from 'expo-router';

export default function Profile() {
  const { user, isAdmin, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Wyloguj się', 'Czy na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyloguj się',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Usuń konto',
      'Czy na pewno chcesz trwale usunąć swoje konto? Ta operacja jest nieodwracalna.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Kontynuuj',
          style: 'destructive',
          onPress: () => setShowDeleteModal(true),
        },
      ]
    );
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    Alert.alert('Konto usunięte', 'Twoje konto zostało trwale usunięte.', [
      {
        text: 'OK',
        onPress: () => router.replace('/(auth)/login'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#2563eb" />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Shield size={16} color="#059669" />
                <Text style={styles.adminText}>Administrator</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informacje o koncie</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <Mail size={20} color="#6b7280" />
              <Text style={styles.infoLabelText}>Adres email</Text>
            </View>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <User size={20} color="#6b7280" />
              <Text style={styles.infoLabelText}>Typ konta</Text>
            </View>
            <Text style={styles.infoValue}>
              {isAdmin ? 'Administrator' : 'Użytkownik społeczności'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <Shield size={20} color="#6b7280" />
              <Text style={styles.infoLabelText}>Data dołączenia</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uprawnienia</Text>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>
              • Tworzenie i zarządzanie ogłoszeniami Zgubione i znalezione
            </Text>
          </View>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>
              • Tworzenie i zarządzanie ogłoszeniami o pracę
            </Text>
          </View>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>
              • Przeglądanie aktualności społeczności
            </Text>
          </View>
          {isAdmin && (
            <View style={styles.permissionItem}>
              <Text style={[styles.permissionText, styles.adminPermission]}>
                • Zarządzanie aktualnościami i ogłoszeniami społeczności
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Akcje na koncie</Text>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="white" />
            <Text style={styles.signOutText}>Wyloguj się</Text>
          </TouchableOpacity>

          <View style={styles.dangerZone}>
            <View style={styles.dangerHeader}>
              <AlertTriangle size={20} color="#dc2626" />
              <Text style={styles.dangerTitle}>Strefa zagrożenia</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Trash2 size={20} color="#dc2626" />
              <Text style={styles.deleteButtonText}>Usuń konto</Text>
            </TouchableOpacity>

            <Text style={styles.deleteWarning}>
              Trwale usuń swoje konto i wszystkie powiązane dane. Ta operacja
              jest nieodwracalna.
            </Text>
          </View>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDeleteSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  adminText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabelText: {
    fontSize: 16,
    color: '#374151',
  },
  infoValue: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'right',
    flex: 1,
  },
  permissionItem: {
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  adminPermission: {
    color: '#059669',
    fontWeight: '500',
  },
  actionsSection: {
    margin: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerZone: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteWarning: {
    fontSize: 14,
    color: '#7f1d1d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
