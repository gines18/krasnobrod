import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, MapPin, Clock, Phone, ImageIcon } from 'lucide-react-native';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PostForm } from '@/components/PostForm';

type LostFoundPost = Database['public']['Tables']['lost_found_posts']['Row'];

export default function LostFound() {
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<LostFoundPost | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<string, boolean>
  >({});
  const [imageErrorStates, setImageErrorStates] = useState<
    Record<string, boolean>
  >({});
  const { user } = useAuth();


  useEffect(() => {
    fetchPosts();
  }, []);

  // New useEffect to initialize imageLoadingStates for new posts
  useEffect(() => {
    const newStates: Record<string, boolean> = {};
    posts.forEach((post) => {
      if (imageLoadingStates[post.id] === undefined) {
        newStates[post.id] = true;
      }
    });
    if (Object.keys(newStates).length > 0) {
      setImageLoadingStates((prev) => ({ ...prev, ...newStates }));
    }
  }, [posts]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('lost_found_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingPost) {
        const { error } = await supabase
          .from('lost_found_posts')
          .update(formData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lost_found_posts')
          .insert([{ ...formData, user_id: user!.id }]);
        if (error) throw error;
      }

      fetchPosts();
      setShowForm(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Error', 'Failed to save post');
    }
  };

  const handleDelete = async (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('lost_found_posts')
              .delete()
              .eq('id', postId);
            if (error) throw error;
            fetchPosts();
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const handleEdit = (post: LostFoundPost) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleImageLoad = (postId: string) => {
    console.log('Image loaded successfully for post:', postId);
    setImageLoadingStates((prev) => ({ ...prev, [postId]: false }));
    setImageErrorStates((prev) => ({ ...prev, [postId]: false }));
  };

  const handleImageError = (postId: string, imageUrl: string) => {
    console.error('Failed to load image:', { postId, imageUrl });
    setImageLoadingStates((prev) => ({ ...prev, [postId]: false }));
    setImageErrorStates((prev) => ({ ...prev, [postId]: true }));
  };

  const renderPost = ({ item }: { item: LostFoundPost }) => {
    // Removed setState call from render to avoid React warning

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View
            style={[
              styles.typeTag,
              { backgroundColor: item.type === 'lost' ? '#fef3c7' : '#d1fae5' },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                { color: item.type === 'lost' ? '#92400e' : '#047857' },
              ]}
            >
              {item.type === 'lost' ? 'LOST' : 'FOUND'}
            </Text>
          </View>
          {item.user_id === user?.id && (
            <View style={styles.postActions}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDescription}>{item.description}</Text>

        {item.image_url && (
          <View style={styles.imageContainer}>
            {imageLoadingStates[item.id] && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            )}
            {imageErrorStates[item.id] ? (
              <View style={styles.imageErrorContainer}>
                <ImageIcon size={32} color="#ef4444" />
                <Text style={styles.imageErrorText}>Failed to load image</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    console.log(
                      'Retrying image load for post:',
                      item.id,
                      'URL:',
                      item.image_url
                    );
                    setImageLoadingStates((prev) => ({
                      ...prev,
                      [item.id]: true,
                    }));
                    setImageErrorStates((prev) => ({
                      ...prev,
                      [item.id]: false,
                    }));
                  }}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Image
                source={{ uri: item.image_url }}
                style={styles.postImage}
                onLoad={() => handleImageLoad(item.id)}
                onError={() => handleImageError(item.id, item.image_url!)}
                resizeMode="cover"
              />
            )}
          </View>
        )}

        <View style={styles.postMeta}>
          {item.location && (
            <View style={styles.metaItem}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          )}
          {item.contact_info && (
            <View style={styles.metaItem}>
              <Phone size={16} color="#6b7280" />
              <Text style={styles.metaText}>{item.contact_info}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.metaText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (showForm) {
    return (
      <PostForm
        type="lost_found"
        initialData={editingPost}
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lost & Found</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPosts} />
        }
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#3730a3',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageErrorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageErrorText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  postMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
  },
  retryText: {
    color: '#3730a3',
    fontSize: 12,
    fontWeight: '600',
  },
});
