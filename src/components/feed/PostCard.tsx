import React from 'react';
import { Heart, MessageSquare, Eye, Play, BookOpen, Calendar } from 'lucide-react';
import { Post } from '../../types';
import { useBrand } from '../../context/BrandContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../common/Card';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  onLikeToggle?: (e: React.MouseEvent) => void;
  isLiked?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onClick,
  onLikeToggle,
  isLiked = false,
}) => {
  const { brand, isDarkMode } = useBrand();
  const { t, language } = useLanguage();

  const title = language === 'bn' ? (post.titleBn || post.title) : post.title;
  const excerpt = language === 'bn' ? (post.excerptBn || post.excerpt) : post.excerpt;

  const formattedDate = new Date(post.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      interactive
      onClick={onClick}
      className="flex flex-col group p-0 !overflow-hidden border border-black/10 dark:border-white/10"
    >
      {/* Cover Image container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-black/5 dark:bg-white/5">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/5 to-black/15 dark:from-white/5 dark:to-white/10">
            {post.type === 'video' ? (
              <Play className="w-12 h-12 opacity-30" />
            ) : (
              <BookOpen className="w-12 h-12 opacity-30" />
            )}
          </div>
        )}

        {/* Post Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md shadow-md text-white bg-black/60">
          {post.type === 'video' ? (
            <>
              <Play className="w-3 h-3 text-red-400 fill-red-400" />
              <span>{language === 'bn' ? 'ভিডিও লেকচার' : 'Video Lecture'}</span>
            </>
          ) : (
            <>
              <BookOpen className="w-3 h-3 text-emerald-300" />
              <span>{language === 'bn' ? 'প্রবন্ধ' : 'Article'}</span>
            </>
          )}
        </div>

        {/* Brand indicator pill */}
        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/50 text-white/90">
          {post.brand === 'islamic'
            ? (language === 'bn' ? 'আকাশ ইসলামিক' : 'Akash Islamic')
            : (language === 'bn' ? 'মাইন্ডস্কোপ' : 'Mindscope')}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    brand === 'islamic'
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                      : 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Title with brand typography */}
          <h3
            className={`text-base sm:text-lg font-bold leading-snug line-clamp-2 mb-2 transition-colors ${
              brand === 'islamic'
                ? 'font-serif group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                : 'font-sans group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
            }`}
          >
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
            {excerpt}
          </p>
        </div>

        {/* Footer: Author info & Engagement stats */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {/* Author avatar and name */}
          <div className="flex items-center gap-2 min-w-0">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.authorName || 'Author'}
                className="w-6 h-6 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {(post.authorName || 'A').charAt(0)}
              </div>
            )}
            <span className="font-medium truncate text-zinc-700 dark:text-zinc-300">
              {post.authorName || (brand === 'islamic' ? (language === 'bn' ? 'আকাশ ইসলামিক সেন্টার' : 'Akash Islamic Center') : (language === 'bn' ? 'মাইন্ডস্কোপ পাবলিকেশন্স' : 'Mindscope'))}
            </span>
          </div>

          {/* Stats: likes, comments */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={e => {
                e.stopPropagation();
                onLikeToggle?.(e);
              }}
              className={`flex items-center gap-1 transition cursor-pointer hover:scale-110 active:scale-95 ${
                isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
              }`}
              title="Like"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{post.likeCount || 0}</span>
            </button>

            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{post.commentCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
