import React, { useState, useEffect, useCallback } from 'react';
import { BrandProvider, useBrand } from './context/BrandContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/navigation/Navbar';
import { BottomNav } from './components/navigation/BottomNav';
import { FeedView } from './components/feed/FeedView';
import { PostDetailView } from './components/post/PostDetailView';
import { AdminPanel } from './components/admin/AdminPanel';
import { ProfileView } from './components/profile/ProfileView';
import { AuthModal } from './components/auth/AuthModal';
import { Post } from './types';
import { fetchPostsByBrand, getPostBySlug, subscribeDataChanges } from './lib/firebase';
import { WifiOff } from 'lucide-react';
import { haptic } from './lib/haptics';

function MainAppContent() {
  const { brand } = useBrand();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Load posts for the currently active brand
  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      // Include drafts if user is admin
      const data = await fetchPostsByBrand(brand, true);
      setPosts(data);
    } catch (err) {
      console.warn('Error fetching posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [brand]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Subscribe to changes (e.g. new post created, comment added, like toggled)
  useEffect(() => {
    const unsub = subscribeDataChanges(() => {
      loadPosts();
    });
    return () => unsub();
  }, [loadPosts]);

  // Handle URL hash changes for deep linking (#admin, #profile, #post/slug)
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setCurrentTab('home');
        setSelectedPost(null);
        return;
      }

      if (hash.startsWith('post/')) {
        const slug = hash.replace('post/', '');
        const post = await getPostBySlug(slug);
        if (post) {
          setSelectedPost(post);
          setCurrentTab('post');
        }
      } else if (hash === 'admin') {
        setCurrentTab('admin');
        setSelectedPost(null);
      } else if (hash === 'profile') {
        setCurrentTab('profile');
        setSelectedPost(null);
      } else if (hash === 'feed') {
        setCurrentTab('feed');
        setSelectedPost(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Sync tab navigation to URL hash
  const navigateToTab = (tab: string) => {
    if (tab === 'admin') {
      haptic.admin();
    } else {
      haptic.light();
    }
    setCurrentTab(tab);
    if (tab === 'home' || tab === 'feed') {
      setSelectedPost(null);
      window.location.hash = '';
    } else if (tab === 'admin') {
      setSelectedPost(null);
      window.location.hash = 'admin';
    } else if (tab === 'profile') {
      setSelectedPost(null);
      window.location.hash = 'profile';
    }
  };

  const handleSelectPost = (post: Post) => {
    haptic.light();
    setSelectedPost(post);
    setCurrentTab('post');
    window.location.hash = `post/${post.slug}`;
  };

  // Monitor network status for offline notification
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast(t.backOnline, 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast(t.offlineBanner, 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, t]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Offline Banner for Android / mobile users */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 flex items-center justify-center gap-2 font-medium z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t.offlineBanner}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentTab === 'post' && selectedPost ? (
          <PostDetailView
            post={selectedPost}
            onBack={() => navigateToTab('home')}
            onRefreshPost={loadPosts}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        ) : currentTab === 'admin' ? (
          <AdminPanel
            posts={posts}
            onRefreshPosts={loadPosts}
            onViewPost={handleSelectPost}
            onExitAdmin={() => navigateToTab('home')}
          />
        ) : currentTab === 'profile' ? (
          <ProfileView
            posts={posts}
            onSelectPost={handleSelectPost}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        ) : (
          /* Default: Feed / Home */
          <FeedView
            posts={posts}
            isLoading={isLoadingPosts}
            onSelectPost={handleSelectPost}
            onRefreshPosts={loadPosts}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (fixed at bottom for Android ergonomics) */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
        onNewPostClick={isAdmin ? () => navigateToTab('admin') : undefined}
      />

      {/* Auth Modal for Sign In / Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrandProvider>
        <AuthProvider>
          <ToastProvider>
            <MainAppContent />
          </ToastProvider>
        </AuthProvider>
      </BrandProvider>
    </LanguageProvider>
  );
}
