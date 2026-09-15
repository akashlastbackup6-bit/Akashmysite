import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Filter, Video, BookOpen, Layers } from 'lucide-react';
import { Post, PostType } from '../../types';
import { useBrand } from '../../context/BrandContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { togglePostLike, isPostLikedByUser } from '../../lib/firebase';
import { PostCard } from './PostCard';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { haptic } from '../../lib/haptics';

interface FeedViewProps {
  posts: Post[];
  isLoading: boolean;
  onSelectPost: (post: Post) => void;
  onRefreshPosts: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  isLoading,
  onSelectPost,
  onRefreshPosts,
}) => {
  const { brand, brandConfig, isDarkMode } = useBrand();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<PostType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique tags for this brand
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [posts]);

  // Filtered posts list
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Type match
      if (selectedType !== 'all' && post.type !== selectedType) return false;
      // Tag match
      if (selectedTag !== 'all' && !post.tags?.includes(selectedTag)) return false;
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q) || (post.titleBn && post.titleBn.toLowerCase().includes(q));
        const matchExcerpt = post.excerpt.toLowerCase().includes(q) || (post.excerptBn && post.excerptBn.toLowerCase().includes(q));
        const matchTags = post.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt && !matchTags) return false;
      }
      return true;
    });
  }, [posts, selectedType, selectedTag, searchQuery]);

  const handleLike = async (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      haptic.light();
      showToast(language === 'bn' ? 'লাইক দিতে অনুগ্রহ করে সাইন ইন করুন' : 'Please sign in to like this post', 'info');
      return;
    }

    try {
      const res = await togglePostLike(post.id, user.id);
      if (res.liked) {
        haptic.like();
      } else {
        haptic.unlike();
      }
      showToast(
        res.liked
          ? (language === 'bn' ? 'পছন্দের তালিকায় যোগ হয়েছে' : 'Added to liked posts')
          : (language === 'bn' ? 'পছন্দ সরানো হয়েছে' : 'Unliked post'),
        'info'
      );
      onRefreshPosts();
    } catch {
      haptic.error();
      showToast(language === 'bn' ? 'লাইক স্ট্যাটাস আপডেট করা যায়নি' : 'Could not update like status', 'error');
    }
  };

  const brandName = language === 'bn' ? (brandConfig.nameBn || brandConfig.name) : brandConfig.name;
  const brandTagline = language === 'bn' ? (brandConfig.taglineBn || brandConfig.tagline) : brandConfig.tagline;
  const brandDescription = language === 'bn' ? (brandConfig.descriptionBn || brandConfig.description) : brandConfig.description;
  const brandShortName = language === 'bn' ? (brandConfig.shortNameBn || brandConfig.shortName) : brandConfig.shortName;

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 sm:px-6 py-6 pb-28 md:pb-16 space-y-6">
      {/* Hero Banner with Gradient Title */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 border border-black/10 dark:border-white/10 transition-all duration-300 shadow-sm">
        {/* Decorative background aura */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none ${
            brand === 'islamic'
              ? 'bg-emerald-500 dark:bg-emerald-400'
              : 'bg-indigo-500 dark:bg-teal-400'
          }`}
        />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{brandShortName}</span>
          </div>

          <h1
            className={`text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${
              brand === 'islamic'
                ? 'font-serif bg-gradient-to-r from-emerald-900 via-emerald-700 to-amber-700 dark:from-emerald-200 dark:via-teal-200 dark:to-amber-300 bg-clip-text text-transparent'
                : 'font-sans bg-gradient-to-r from-indigo-700 via-teal-600 to-orange-500 dark:from-indigo-300 dark:via-teal-300 dark:to-orange-400 bg-clip-text text-transparent'
            }`}
          >
            {brandName}
          </h1>

          <p className="text-sm sm:text-base opacity-80 leading-relaxed max-w-xl">
            {brandDescription}
          </p>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        {/* Search bar and Post type toggle */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Type selector: All, Articles, Video */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-black/10 dark:bg-white/15 font-bold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              {t.allTypes}
            </button>
            <button
              onClick={() => setSelectedType('article')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedType === 'article'
                  ? 'bg-black/10 dark:bg-white/15 font-bold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              {t.articles}
            </button>
            <button
              onClick={() => setSelectedType('video')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedType === 'video'
                  ? 'bg-black/10 dark:bg-white/15 font-bold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Video className="w-3 h-3" />
              {t.videos}
            </button>
          </div>
        </div>

        {/* Tag Pills Scrolling Strip */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedTag === 'all'
                  ? brand === 'islamic'
                    ? 'bg-emerald-800 text-amber-200'
                    : 'bg-indigo-600 text-white'
                  : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100'
              }`}
            >
              {t.allTopics}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedTag === tag
                    ? brand === 'islamic'
                      ? 'bg-emerald-800 text-amber-200'
                      : 'bg-indigo-600 text-white'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Grid or Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <SkeletonLoader type="card" count={3} />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => onSelectPost(post)}
              onLikeToggle={e => handleLike(post, e)}
              isLiked={user ? isPostLikedByUser(post.id, user.id) : false}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-black/15 dark:border-white/15 space-y-3">
          <p className="text-base font-semibold">{t.noPostsFound}</p>
          <p className="text-xs opacity-70 max-w-sm mx-auto">
            {searchQuery || selectedTag !== 'all' || selectedType !== 'all'
              ? (language === 'bn'
                  ? 'অনুগ্রহ করে ফিল্টার রিসেট করুন অথবা অন্য ট্যাগ বেছে নিন।'
                  : 'Try resetting the search filters or choosing a different tag.')
              : (language === 'bn'
                  ? 'এই বিভাগে এখনও কোনো পোস্ট প্রকাশিত হয়নি।'
                  : 'There are no published posts yet under this brand identity.')}
          </p>
          {(searchQuery || selectedTag !== 'all' || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('all');
                setSelectedType('all');
              }}
              className="mt-2 text-xs font-bold underline cursor-pointer text-emerald-600 dark:text-emerald-400"
            >
              {t.clearFilters}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
