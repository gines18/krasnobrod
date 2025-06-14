import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { ImagePicker } from './ImagePicker';
import { uploadImage, deleteImage } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PostFormProps {
  type: 'lost_found' | 'job';
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PostForm({
  type,
  initialData,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [postType, setPostType] = useState(
    initialData?.type || (type === 'lost_found' ? 'lost' : 'offer')
  );
  const [location, setLocation] = useState(initialData?.location || '');
  const [contactInfo, setContactInfo] = useState(
    initialData?.contact_info || ''
  );
  const [salaryRange, setSalaryRange] = useState(
    initialData?.salary_range || ''
  );
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      const data: any = {
        title: title.trim(),
        description: description.trim(),
        type: postType,
        location: location.trim() || null,
        contact_info: contactInfo.trim() || null,
      };

      if (type === 'job' && salaryRange.trim()) {
        data.salary_range = salaryRange.trim();
      }

      onSubmit(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to save post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getTypeOptions = () => {
    if (type === 'lost_found') {
      return [
        { value: 'lost', label: 'Lost Item' },
        { value: 'found', label: 'Found Item' },
      ];
    }
    return [
      { value: 'offer', label: 'Job Offer' },
      { value: 'request', label: 'Job Request' },
    ];
  };

  const getTitle = () => {
    if (initialData) {
      return type === 'lost_found' ? 'Edit Lost & Found Post' : 'Edit Job Post';
    }
    return type === 'lost_found' ? 'New Lost & Found Post' : 'New Job Post';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.typeSelector}>
            {getTypeOptions().map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.typeOption,
                  postType === option.value && styles.typeOptionActive,
                ]}
                onPress={() => setPostType(option.value)}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    postType === option.value && styles.typeOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a descriptive title"
              multiline={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Provide detailed information"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Where was it lost/found or job location"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Information</Text>
            <TextInput
              style={styles.input}
              value={contactInfo}
              onChangeText={setContactInfo}
              placeholder="Phone number or email"
              keyboardType="email-address"
            />
          </View>

          {type === 'job' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Salary Range</Text>
              <TextInput
                style={styles.input}
                value={salaryRange}
                onChangeText={setSalaryRange}
                placeholder="e.g., $15-20/hour or $50,000-60,000/year"
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={uploading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!title.trim() || !description.trim() || uploading) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!title.trim() || !description.trim() || uploading}
            >
              <Text style={styles.submitButtonText}>
                {uploading ? 'Saving...' : initialData ? 'Update' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeOptionActive: {
    backgroundColor: '#2563eb',
  },
  typeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeOptionTextActive: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
