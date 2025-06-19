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
import { Plus, Clock, User, MapPin, ImageIcon } from 'lucide-react-native';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { NewsForm } from '@/components/NewsForm';

type NewsPost = Database['public']['Tables']['news_posts']['Row'];

export default function News() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<string, boolean>
  >({});
  const [imageErrorStates, setImageErrorStates] = useState<
    Record<string, boolean>
  >({});
  const { user, isAdmin } = useAuth();

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
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Błąd', 'Nie udało się załadować aktualności');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingPost) {
        const { error } = await supabase
          .from('news_posts')
          .update(formData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news_posts')
          .insert([{ ...formData, author_id: user!.id }]);
        if (error) throw error;
      }

      fetchPosts();
      setShowForm(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać wpisu');
    }
  };

  const handleDelete = async (postId: string) => {
    Alert.alert('Usuń aktualność', 'Czy na pewno chcesz usunąć ten wpis?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('news_posts')
              .delete()
              .eq('id', postId);
            if (error) throw error;
            fetchPosts();
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Błąd', 'Nie udało się usunąć wpisu');
          }
        },
      },
    ]);
  };

  const handleEdit = (post: NewsPost) => {
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

  const renderPost = ({ item }: { item: NewsPost }) => {
    // Removed setState call from render to avoid React warning

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>AKTUALNOŚCI</Text>
          </View>
          {isAdmin && (
            <View style={styles.postActions}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edytuj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDescription}>{item.content}</Text>

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
                <Text style={styles.imageErrorText}>
                  Nie udało się załadować obrazu
                </Text>
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
                  <Text style={styles.retryText}>Ponów próbę</Text>
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
          {/* Removed location block because NewsPost type has no location property */}
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
      <NewsForm
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
        <Text style={styles.headerTitle}>Aktualności społeczności</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {!isAdmin && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Aktualności i ogłoszenia od administratorów
          </Text>
        </View>
      )}

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
  infoCard: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  postDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
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
