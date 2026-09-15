import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { Post, CommentItem, UserProfile, BrandId } from '../types';
import { INITIAL_POSTS, INITIAL_COMMENTS, INITIAL_USERS } from './mockData';

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCg82Ze3cesFKwjPOFS1X_ROBUG7yGl6ks',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'akash-website-1d796.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'akash-website-1d796',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'akash-website-1d796.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '119705738297',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:119705738297:web:f74e919ae1cef0958501e8',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PYVPM4LLX0',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  firebaseConfig.apiKey !== ''
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.info('Firebase initialized with live credentials for akash-website-1d796.');

    // Initialize Analytics if supported in this environment
    if (typeof window !== 'undefined') {
      isSupported().then(supported => {
        if (supported && app) {
          analytics = getAnalytics(app);
          console.info('Firebase Analytics active.');
        }
      }).catch(err => {
        console.debug('Firebase Analytics is not supported in this container environment:', err);
      });
    }
  } catch (error) {
    console.warn('Firebase initialization error, falling back to local storage engine:', error);
  }
} else {
  console.info('Firebase keys not configured. Running in high-fidelity local demo engine.');
}

// Local storage keys for seamless persistence & live experience
const STORAGE_KEY_POSTS = 'akash_blog_posts_v2';
const STORAGE_KEY_COMMENTS = 'akash_blog_comments_v2';
const STORAGE_KEY_USERS = 'akash_blog_users_v2';
const STORAGE_KEY_CURRENT_USER = 'akash_blog_current_user_v2';
const STORAGE_KEY_LIKED_POSTS = 'akash_blog_liked_posts_v2';

export const ADMIN_EMAILS: string[] = [
  'akash994220@gmail.com',
  'akashdaraz994@gmail.com',
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// Initialise local storage if empty
function getLocalPosts(): Post[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_POSTS;
  }
}

function saveLocalPosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
}

function getLocalComments(): CommentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(INITIAL_COMMENTS));
      return INITIAL_COMMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMMENTS;
  }
}

function saveLocalComments(comments: CommentItem[]) {
  localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
}

function getLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

function saveLocalUsers(users: UserProfile[]) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

// Global subscribers for reactive UI updates in local mode
type Listener = () => void;
const listeners: Set<Listener> = new Set();
const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

export const subscribeDataChanges = (callback: Listener) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

// ==========================================
// AUTHENTICATION API
// ==========================================

export async function getCurrentUserProfile(uid: string): Promise<UserProfile | null> {
  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as UserProfile;
      }
    } catch (err) {
      console.warn('Error fetching user profile from Firestore, checking local store:', err);
    }
  }
  const users = getLocalUsers();
  return users.find(u => u.id === uid) || null;
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (err) {
      console.warn('Firestore user save error:', err);
    }
  }
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user };
  } else {
    users.push(user);
  }
  saveLocalUsers(users);
  
  // Also update session user if active
  const current = getSessionUser();
  if (current && current.id === user.id) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify({ ...current, ...user }));
  }
  notifyListeners();
}

export function getSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      const user = JSON.parse(raw) as UserProfile;
      if (isAdminEmail(user.email) && user.role !== 'admin') {
        user.role = 'admin';
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      }
      return user;
    }
  } catch {}
  return null;
}

export function setSessionUser(user: UserProfile | null) {
  if (user) {
    if (isAdminEmail(user.email) && user.role !== 'admin') {
      user.role = 'admin';
    }
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }
  notifyListeners();
}

export async function signInEmailPassword(email: string, pass: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (auth && isFirebaseConfigured) {
    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      let profile = await getCurrentUserProfile(cred.user.uid);
      if (!profile) {
        profile = {
          id: cred.user.uid,
          displayName: cred.user.displayName || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          photoURL: cred.user.photoURL || undefined,
          role: isAdminEmail(normalizedEmail) ? 'admin' : 'user',
          brandPreference: 'islamic',
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(profile);
      } else if (isAdminEmail(profile.email) && profile.role !== 'admin') {
        profile.role = 'admin';
        await saveUserProfile(profile);
      }
      setSessionUser(profile);
      return profile;
    } catch (err) {
      console.error('Firebase Auth sign in error:', err);
      throw err;
    }
  }

  // Local authentication simulation
  const users = getLocalUsers();
  let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    // Automatically register if not found in demo mode for convenience
    user = {
      id: 'usr-' + Date.now(),
      displayName: normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
      email: normalizedEmail,
      role: isAdminEmail(normalizedEmail) ? 'admin' : 'user',
      brandPreference: 'islamic',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveLocalUsers(users);
  } else if (isAdminEmail(user.email) && user.role !== 'admin') {
    user.role = 'admin';
    saveLocalUsers(users);
  }
  setSessionUser(user);
  return user;
}

export async function signUpEmailPassword(email: string, pass: string, displayName: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();

  if (auth && isFirebaseConfigured) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      const profile: UserProfile = {
        id: cred.user.uid,
        displayName: displayName.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: isAdminEmail(normalizedEmail) ? 'admin' : 'user',
        brandPreference: 'islamic',
        createdAt: new Date().toISOString(),
      };
      await saveUserProfile(profile);
      setSessionUser(profile);
      return profile;
    } catch (err) {
      console.error('Firebase Auth sign up error:', err);
      throw err;
    }
  }

  const users = getLocalUsers();
  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newUser: UserProfile = {
    id: 'usr-' + Date.now(),
    displayName: displayName.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role: isAdminEmail(normalizedEmail) ? 'admin' : 'user',
    brandPreference: 'islamic',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveLocalUsers(users);
  setSessionUser(newUser);
  return newUser;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  if (auth && isFirebaseConfigured) {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const email = res.user.email || '';
      let profile = await getCurrentUserProfile(res.user.uid);
      if (!profile) {
        profile = {
          id: res.user.uid,
          displayName: res.user.displayName || email.split('@')[0] || 'User',
          email: email,
          photoURL: res.user.photoURL || undefined,
          role: isAdminEmail(email) ? 'admin' : 'user',
          brandPreference: 'islamic',
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(profile);
      } else if (isAdminEmail(profile.email) && profile.role !== 'admin') {
        profile.role = 'admin';
        await saveUserProfile(profile);
      }
      setSessionUser(profile);
      return profile;
    } catch (err) {
      console.error('Google sign in error:', err);
      throw err;
    }
  }

  // Simulated Google Sign In
  const adminEmail = 'akash994220@gmail.com';
  const users = getLocalUsers();
  let user = users.find(u => u.email.toLowerCase() === adminEmail);
  if (!user) {
    user = {
      id: 'admin-akash-primary',
      displayName: 'আকাশ (পরিচালক ও গবেষক)',
      email: adminEmail,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: 'admin',
      brandPreference: 'islamic',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveLocalUsers(users);
  }
  setSessionUser(user);
  return user;
}

export async function logoutUser(): Promise<void> {
  if (auth && isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign out error:', err);
    }
  }
  setSessionUser(null);
}

// ==========================================
// POSTS API
// ==========================================

export async function fetchAllPosts(): Promise<Post[]> {
  if (db && isFirebaseConfigured) {
    try {
      const colRef = collection(db, 'posts');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Post[];
      }
    } catch (err) {
      console.warn('Firestore fetchAllPosts error, using local fallback:', err);
    }
  }
  return getLocalPosts();
}

export async function fetchPostsByBrand(brand: BrandId, includeDrafts: boolean = false): Promise<Post[]> {
  const all = await fetchAllPosts();
  return all
    .filter(p => p.brand === brand)
    .filter(p => includeDrafts || p.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const all = await fetchAllPosts();
  return all.find(p => p.slug === slug) || null;
}

export async function getPostById(id: string): Promise<Post | null> {
  const all = await fetchAllPosts();
  return all.find(p => p.id === id) || null;
}

export async function createPost(postData: Omit<Post, 'id' | 'createdAt' | 'likeCount' | 'commentCount' | 'viewCount'>): Promise<Post> {
  const newPost: Post = {
    ...postData,
    id: 'post-' + Date.now(),
    likeCount: 0,
    commentCount: 0,
    viewCount: 1,
    createdAt: new Date().toISOString(),
    publishedAt: postData.status === 'published' ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };

  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'posts', newPost.id), newPost);
    } catch (err) {
      console.warn('Firestore createPost error:', err);
    }
  }

  const posts = getLocalPosts();
  posts.unshift(newPost);
  saveLocalPosts(posts);
  notifyListeners();
  return newPost;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post> {
  const posts = getLocalPosts();
  const idx = posts.findIndex(p => p.id === id);
  if (idx < 0) throw new Error('Post not found');

  const updated: Post = {
    ...posts[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
    publishedAt: updates.status === 'published' && !posts[idx].publishedAt ? new Date().toISOString() : posts[idx].publishedAt,
  };

  if (db && isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'posts', id), updated as any);
    } catch (err) {
      console.warn('Firestore updatePost error:', err);
    }
  }

  posts[idx] = updated;
  saveLocalPosts(posts);
  notifyListeners();
  return updated;
}

export async function deletePost(id: string): Promise<void> {
  if (db && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (err) {
      console.warn('Firestore deletePost error:', err);
    }
  }
  const posts = getLocalPosts().filter(p => p.id !== id);
  saveLocalPosts(posts);
  notifyListeners();
}

export async function togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; newCount: number }> {
  const key = `${STORAGE_KEY_LIKED_POSTS}_${userId}`;
  let likedIds: string[] = [];
  try {
    likedIds = JSON.parse(localStorage.getItem(key) || '[]');
  } catch {}

  const isLiked = likedIds.includes(postId);
  let newLikedIds: string[];
  let delta = 0;

  if (isLiked) {
    newLikedIds = likedIds.filter(id => id !== postId);
    delta = -1;
  } else {
    newLikedIds = [...likedIds, postId];
    delta = 1;
  }
  localStorage.setItem(key, JSON.stringify(newLikedIds));

  const posts = getLocalPosts();
  const post = posts.find(p => p.id === postId);
  let newCount = 0;
  if (post) {
    post.likeCount = Math.max(0, (post.likeCount || 0) + delta);
    newCount = post.likeCount;
    saveLocalPosts(posts);
    if (db && isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'posts', postId), { likeCount: post.likeCount });
      } catch (err) {
        console.warn('Firestore togglePostLike error:', err);
      }
    }
    notifyListeners();
  }

  return { liked: !isLiked, newCount };
}

export function isPostLikedByUser(postId: string, userId: string): boolean {
  try {
    const likedIds = JSON.parse(localStorage.getItem(`${STORAGE_KEY_LIKED_POSTS}_${userId}`) || '[]');
    return likedIds.includes(postId);
  } catch {
    return false;
  }
}

// ==========================================
// COMMENTS API
// ==========================================

export async function fetchCommentsForPost(postId: string): Promise<CommentItem[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() })) as CommentItem[];
      }
    } catch (err) {
      console.warn('Firestore fetchCommentsForPost error:', err);
    }
  }

  const all = getLocalComments();
  return all.filter(c => c.postId === postId);
}

export async function addComment(comment: Omit<CommentItem, 'id' | 'createdAt'>): Promise<CommentItem> {
  const newComment: CommentItem = {
    ...comment,
    id: 'c-' + Date.now(),
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'comments', newComment.id), newComment);
    } catch (err) {
      console.warn('Firestore addComment error:', err);
    }
  }

  const comments = getLocalComments();
  comments.push(newComment);
  saveLocalComments(comments);

  // Increment comment count on the post
  const posts = getLocalPosts();
  const post = posts.find(p => p.id === comment.postId);
  if (post) {
    post.commentCount = (post.commentCount || 0) + 1;
    saveLocalPosts(posts);
  }

  notifyListeners();
  return newComment;
}

// ==========================================
// FILE UPLOAD SIMULATOR (STORAGE)
// ==========================================

export async function uploadMediaFile(file: File, folder: string = 'covers'): Promise<string> {
  if (storage && isFirebaseConfigured) {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadResult.ref);
    } catch (err) {
      console.warn('Firebase Storage upload failed, converting to local data URI:', err);
    }
  }

  // Client-side fallback: Convert File to base64 Data URL so images display natively
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Export references for direct Firebase operations
export { app, auth, db, storage, analytics };
