import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';

// ============================================
// USER OPERATIONS
// ============================================

export const userService = {
  // Get a single user by ID
  getUser: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  updateUser: async (userId, data) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: users };
    } catch (error) {
      console.error('Error getting users:', error);
      return { success: false, error: error.message };
    }
  }
};

// ============================================
// POSTS OPERATIONS (for Communities)
// ============================================

export const postsService = {
  // Create a new post
  createPost: async (postData) => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all posts (with optional filters)
  getPosts: async (filters = {}) => {
    try {
      let q = collection(db, 'posts');
      
      // Apply filters
      const constraints = [];
      
      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }
      
      if (filters.tags && filters.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', filters.tags));
      }
      
      // Always order by most recent
      constraints.push(orderBy('createdAt', 'desc'));
      
      // Apply limit if specified
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
      
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: posts };
    } catch (error) {
      console.error('Error getting posts:', error);
      return { success: false, error: error.message };
    }
  },

  // Get a single post
  getPost: async (postId) => {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        return { success: true, data: { id: postDoc.id, ...postDoc.data() } };
      } else {
        return { success: false, error: 'Post not found' };
      }
    } catch (error) {
      console.error('Error getting post:', error);
      return { success: false, error: error.message };
    }
  },

  // Update a post
  updatePost: async (postId, data) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating post:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a post
  deletePost: async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  },

  // Like/Unlike a post
  toggleLike: async (postId, userId) => {
    try {
      const likeRef = doc(db, 'posts', postId, 'likes', userId);
      const likeDoc = await getDoc(likeRef);
      
      if (likeDoc.exists()) {
        // Unlike
        await deleteDoc(likeRef);
        await updateDoc(doc(db, 'posts', postId), {
          likes: increment(-1)
        });
        return { success: true, isLiked: false };
      } else {
        // Like
        await setDoc(likeRef, {
          userId,
          createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'posts', postId), {
          likes: increment(1)
        });
        return { success: true, isLiked: true };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  },

  // Subscribe to posts updates (real-time)
  subscribeToPosts: (callback, filters = {}) => {
    let q = collection(db, 'posts');
    
    const constraints = [];
    if (filters.userId) {
      constraints.push(where('userId', '==', filters.userId));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(posts);
    }, (error) => {
      console.error('Error in posts subscription:', error);
      callback([]);
    });
  }
};

// ============================================
// COMMENTS OPERATIONS
// ============================================

export const commentsService = {
  // Add a comment to a post
  addComment: async (postId, commentData) => {
    try {
      const docRef = await addDoc(collection(db, 'posts', postId, 'comments'), {
        ...commentData,
        createdAt: serverTimestamp()
      });
      
      // Update comment count
      await updateDoc(doc(db, 'posts', postId), {
        comments: increment(1)
      });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  },

  // Get comments for a post
  getComments: async (postId) => {
    try {
      const q = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: comments };
    } catch (error) {
      console.error('Error getting comments:', error);
      return { success: false, error: error.message };
    }
  }
};

// ============================================
// ADVOCACY OPERATIONS
// ============================================

export const advocacyService = {
  // Submit advocacy feedback
  submitAdvocacy: async (advocacyData) => {
    try {
      const docRef = await addDoc(collection(db, 'advocacies'), {
        ...advocacyData,
        status: 'pending', // pending, reviewed, resolved
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error submitting advocacy:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's advocacy submissions
  getUserAdvocacies: async (userId) => {
    try {
      const q = query(
        collection(db, 'advocacies'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const advocacies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: advocacies };
    } catch (error) {
      console.error('Error getting user advocacies:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all advocacies (admin view)
  getAllAdvocacies: async (filters = {}) => {
    try {
      let q = collection(db, 'advocacies');
      const constraints = [];
      
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      if (filters.tags && filters.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', filters.tags));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
      
      const querySnapshot = await getDocs(q);
      const advocacies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: advocacies };
    } catch (error) {
      console.error('Error getting advocacies:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete an advocacy submission
  deleteAdvocacy: async (advocacyId) => {
    try {
      await deleteDoc(doc(db, 'advocacies', advocacyId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting advocacy:', error);
      return { success: false, error: error.message };
    }
  }
};

// Helper function for increment (needs to be imported from firebase/firestore)
import { increment } from 'firebase/firestore';

