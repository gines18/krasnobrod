import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TriangleAlert as AlertTriangle, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteAccountModal({ visible, onClose, onSuccess }: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, deleteAccount } = useAuth();

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      Alert.alert('Error', 'Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setLoading(true);
    const { error } = await deleteAccount();
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } else {
      onSuccess();
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={32} color="#dc2626" />
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Delete Account</Text>
          <Text style={styles.subtitle}>
            This action cannot be undone. This will permanently delete your account and all associated data.
          </Text>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ What will be deleted:</Text>
            <Text style={styles.warningItem}>• Your account and profile information</Text>
            <Text style={styles.warningItem}>• All your Lost & Found posts</Text>
            <Text style={styles.warningItem}>• All your Job posts</Text>
            <Text style={styles.warningItem}>• All your News posts (if admin)</Text>
            <Text style={styles.warningItem}>• All associated data and history</Text>
          </View>

          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>
              To confirm deletion, type <Text style={styles.confirmationCode}>DELETE MY ACCOUNT</Text> below:
            </Text>
            <TextInput
              style={styles.confirmationInput}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="Type here to confirm"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userInfoLabel}>Account to be deleted:</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.deleteButton,
                (confirmationText !== 'DELETE MY ACCOUNT' || loading) && styles.deleteButtonDisabled
              ]}
              onPress={handleDeleteAccount}
              disabled={confirmationText !== 'DELETE MY ACCOUNT' || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 20,
  },
  warningCard: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 4,
  },
  confirmationSection: {
    marginBottom: 20,
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  confirmationCode: {
    fontWeight: '700',
    color: '#dc2626',
    fontFamily: 'monospace',
  },
  confirmationInput: {
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#fef2f2',
  },
  userInfo: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});