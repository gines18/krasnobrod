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
import { User, Mail, Shield, LogOut, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { router } from 'expo-router';

export default function Profile() {
  const { user, isAdmin, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => setShowDeleteModal(true),
        },
      ]
    );
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    Alert.alert(
      'Account Deleted',
      'Your account has been permanently deleted.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
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
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <Mail size={20} color="#6b7280" />
              <Text style={styles.infoLabelText}>Email Address</Text>
            </View>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <User size={20} color="#6b7280" />
              <Text style={styles.infoLabelText}>Account Type</Text>
            </View>
            <Text style={styles.infoValue}>
              {isAdmin ? 'Administrator' : 'Community Member'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <Shield size={20} color="#6b7280" />
              <Text style={styles.infoLabelText}>Join Date</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          
          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>• Create and manage Lost & Found posts</Text>
          </View>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>• Create and manage Job posts</Text>
          </View>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>• View community news</Text>
          </View>
          {isAdmin && (
            <View style={styles.permissionItem}>
              <Text style={[styles.permissionText, styles.adminPermission]}>
                • Manage community news and announcements
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="white" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.dangerZone}>
            <View style={styles.dangerHeader}>
              <AlertTriangle size={20} color="#dc2626" />
              <Text style={styles.dangerTitle}>Danger Zone</Text>
            </View>
            
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Trash2 size={20} color="#dc2626" />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
            
            <Text style={styles.deleteWarning}>
              Permanently delete your account and all associated data. This action cannot be undone.
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