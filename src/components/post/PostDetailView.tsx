import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  User,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Send,
  Reply,
  Play,
  BookOpen,
} from 'lucide-react';
import { Post, CommentItem, ContentBlock } from '../../types';
import { useBrand } from '../../context/BrandContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchCommentsForPost,
  addComment,
  togglePostLike,
  isPostLikedByUser,
} from '../../lib/firebase';
import { CapsuleButton } from '../common/CapsuleButton';
import { Card } from '../common/Card';
import { haptic } from '../../lib/haptics';

interface PostDetailViewProps {
  post: Post;
  onBack: () => void;
  onRefreshPost?: () => void;
  openAuthModal: () => void;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({
  post,
  onBack,
  onRefreshPost,
  openAuthModal,
}) => {
  const { brand, isDarkMode } = useBrand();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const title = language === 'bn' ? (post.titleBn || post.title) : post.title;
  const excerpt = language === 'bn' ? (post.excerptBn || post.excerpt) : post.excerpt;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    user ? isPostLikedByUser(post.id, user.id) : false
  );
  const [likeCount, setLikeCount] = useState<number>(post.likeCount || 0);

  // Video specific state: transcript tab/collapsible
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadComments();
    if (user) {
      setIsLiked(isPostLikedByUser(post.id, user.id));
    }
  }, [post.id, user]);

  const loadComments = async () => {
    try {
      const data = await fetchCommentsForPost(post.id);
      setComments(data);
    } catch {
      console.warn('Could not load comments');
    }
  };

  const handleLike = async () => {
    if (!user) {
      haptic.light();
      openAuthModal();
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
      setIsLiked(res.liked);
      setLikeCount(res.newCount);
      showToast(
        res.liked
          ? (language === 'bn' ? 'পোস্টে লাইক দেওয়া হয়েছে' : 'Liked post')
          : (language === 'bn' ? 'লাইক প্রত্যাহার করা হয়েছে' : 'Removed like'),
        'info'
      );
      onRefreshPost?.();
    } catch {
      haptic.error();
      showToast(language === 'bn' ? 'লাইক আপডেট ব্যর্থ হয়েছে' : 'Failed to update like status', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(language === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Link copied to clipboard!', 'success');
    }
  };

  const handleAddComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    const textToSubmit = parentId ? replyText.trim() : newCommentText.trim();
    if (!textToSubmit) return;

    setIsSubmittingComment(true);
    try {
      await addComment({
        postId: post.id,
        userId: user.id,
        userName: user.displayName,
        userAvatar: user.photoURL,
        text: textToSubmit,
        parentCommentId: parentId,
      });

      if (parentId) {
        setReplyText('');
        setReplyingToId(null);
      } else {
        setNewCommentText('');
      }

      await loadComments();
      showToast(language === 'bn' ? 'মন্তব্য সফলভাবে পোস্ট করা হয়েছে!' : 'Comment posted successfully!', 'success');
      onRefreshPost?.();
    } catch {
      showToast(language === 'bn' ? 'মন্তব্য পোস্ট করা ব্যর্থ হয়েছে' : 'Failed to post comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Helper to extract YouTube video ID for embed
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      videoId = url;
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  };

  // Group comments: top-level and 1-level replies
  const topLevelComments = comments.filter(c => !c.parentCommentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentCommentId === parentId);

  const formattedDate = new Date(post.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-6 pb-28 md:pb-16 space-y-6">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-xs font-semibold cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToFeed}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer text-zinc-600 dark:text-zinc-300"
            title="Share post"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-3">
        {/* Brand & Type Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
              post.brand === 'islamic'
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                : 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300'
            }`}
          >
            {post.brand === 'islamic'
              ? (language === 'bn' ? 'আকাশ ইসলামিক সেন্টার' : 'Akash Islamic Center')
              : (language === 'bn' ? 'মাইন্ডস্কোপ পাবলিকেশন' : 'Mindscope')}
          </span>
          <span className="text-xs opacity-60">·</span>
          <span className="text-xs font-semibold opacity-75 capitalize">
            {post.type === 'video'
              ? (language === 'bn' ? 'ভিডিও' : 'Video')
              : (language === 'bn' ? 'প্রবন্ধ' : 'Article')}
          </span>
        </div>

        {/* Post Title */}
        <h1
          className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight ${
            brand === 'islamic' ? 'font-serif' : 'font-sans'
          }`}
        >
          {title}
        </h1>

        {/* Author details & date */}
        <div className="flex items-center gap-3 pt-1 border-b border-black/5 dark:border-white/10 pb-4">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName || 'Author'}
              className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
              {(post.authorName || 'A').charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold">
              {post.authorName || (brand === 'islamic' ? (language === 'bn' ? 'আকাশ ইসলামিক সেন্টার' : 'Akash Islamic Center') : (language === 'bn' ? 'মাইন্ডস্কোপ পাবলিকেশন্স' : 'Mindscope'))}
            </span>
            <div className="flex items-center gap-2 text-xs opacity-65">
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{post.viewCount || 1} {language === 'bn' ? 'বার দেখা হয়েছে' : 'views'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO TYPE: YouTube responsive embed at top */}
      {post.type === 'video' && (
        <div className="space-y-4">
          <div className="relative w-full aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg bg-black">
            {post.youtubeUrl ? (
              <iframe
                src={getYouTubeEmbedUrl(post.youtubeUrl) || ''}
                title={title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <Play className="w-12 h-12 opacity-40" />
              </div>
            )}
          </div>

          {/* Study Materials (Side panel / stacks below embed on mobile) */}
          {post.studyMaterials && post.studyMaterials.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {language === 'bn' ? 'সম্পূরক পাঠ্য উপকরণ ও ডকুমেন্টস' : 'Supplementary Study Materials & Documents'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {post.studyMaterials.map((sm, idx) => (
                  <a
                    key={idx}
                    href={sm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition text-xs font-semibold"
                  >
                    <span className="truncate pr-2">{sm.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Transcript Section */}
          {post.transcript && (
            <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden">
              <button
                onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
                className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition text-sm font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 opacity-70" />
                  <span>{language === 'bn' ? 'সম্পূর্ণ সেশন প্রতিলিপি / ট্রান্সক্রিপ্ট' : 'Full Session Transcript'}</span>
                </div>
                {isTranscriptOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isTranscriptOpen && (
                <div className="p-4 sm:p-6 text-xs sm:text-sm leading-relaxed whitespace-pre-line opacity-85 border-t border-black/5 dark:border-white/10 max-h-96 overflow-y-auto">
                  {post.transcript}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ARTICLE TYPE: Cover image */}
      {post.type === 'article' && post.coverImage && (
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
          <img
            src={post.coverImage}
            alt={title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Rendered Content Blocks */}
      <div className="space-y-6 pt-2 leading-relaxed">
        {post.body && post.body.length > 0 ? (
          post.body.map((block: ContentBlock) => {
            switch (block.type) {
              case 'heading':
                return (
                  <h2
                    key={block.id}
                    className={`text-xl sm:text-2xl font-bold pt-4 pb-1 ${
                      brand === 'islamic' ? 'font-serif text-emerald-950 dark:text-emerald-100' : 'font-sans'
                    }`}
                  >
                    {block.content}
                  </h2>
                );
              case 'text':
                return (
                  <div
                    key={block.id}
                    className="text-sm sm:text-base leading-relaxed whitespace-pre-line opacity-90"
                  >
                    {block.content}
                  </div>
                );
              case 'quote':
                return (
                  <blockquote
                    key={block.id}
                    className={`my-4 pl-4 sm:pl-6 py-2 border-l-4 rounded-r-2xl bg-black/5 dark:bg-white/5 ${
                      brand === 'islamic'
                        ? 'border-amber-500 font-serif italic'
                        : 'border-teal-500 font-sans italic'
                    }`}
                  >
                    <p className="text-base sm:text-lg leading-snug">{block.content}</p>
                    {block.caption && (
                      <cite className="block text-xs font-semibold opacity-70 mt-2 not-italic">
                        — {block.caption}
                      </cite>
                    )}
                  </blockquote>
                );
              case 'image':
                return (
                  <figure key={block.id} className="my-6 space-y-2">
                    <img
                      src={block.content}
                      alt={block.caption || 'Article graphic'}
                      className="w-full rounded-2xl max-h-[460px] object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    {block.caption && (
                      <figcaption className="text-center text-xs opacity-60 italic">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              case 'youtube':
                return (
                  <div key={block.id} className="my-6 aspect-[16/9] rounded-2xl overflow-hidden shadow-md">
                    <iframe
                      src={getYouTubeEmbedUrl(block.content) || ''}
                      title="Video block"
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                );
              case 'divider':
                return (
                  <div key={block.id} className="my-8 flex items-center justify-center gap-2 opacity-30">
                    <span className="w-12 h-px bg-current" />
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span className="w-12 h-px bg-current" />
                  </div>
                );
              default:
                return null;
            }
          })
        ) : (
          <p className="text-sm leading-relaxed opacity-80">{excerpt}</p>
        )}
      </div>

      {/* Tags footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-4 border-t border-black/5 dark:border-white/10 flex flex-wrap gap-2">
          {post.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-black/5 dark:bg-white/10"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Post Engagement Bar: Like & Share capsule buttons */}
      <div className="py-4 border-y border-black/5 dark:border-white/10 flex items-center justify-between">
        <CapsuleButton
          variant={isLiked ? 'primary' : 'secondary'}
          size="md"
          onClick={handleLike}
          icon={
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-current text-white' : 'text-rose-500'}`}
            />
          }
        >
          {isLiked ? t.liked : t.like} ({likeCount})
        </CapsuleButton>

        <CapsuleButton
          variant="ghost"
          size="md"
          onClick={handleShare}
          icon={<Share2 className="w-4 h-4" />}
        >
          {t.share}
        </CapsuleButton>
      </div>

      {/* COMMENTS SECTION */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 opacity-70" />
          <h3 className="text-lg sm:text-xl font-bold">
            {t.discussion} ({comments.length})
          </h3>
        </div>

        {/* Add comment input */}
        <form onSubmit={e => handleAddComment(e, null)} className="space-y-2.5">
          <textarea
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            placeholder={
              user
                ? (language === 'bn' ? 'আপনার মতামত, প্রশ্ন বা ভাবনা প্রকাশ করুন...' : 'Share your thoughts, questions, or reflections...')
                : (language === 'bn' ? 'আলোচনায় অংশ নিতে সাইন ইন করুন...' : 'Sign in to join the discussion...')
            }
            rows={3}
            className="w-full p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
          />
          <div className="flex justify-end">
            <CapsuleButton
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmittingComment}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              {t.postComment}
            </CapsuleButton>
          </div>
        </form>

        {/* Comment list */}
        <div className="space-y-4">
          {topLevelComments.length > 0 ? (
            topLevelComments.map(comment => {
              const replies = getReplies(comment.id);
              const isReplying = replyingToId === comment.id;

              return (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] space-y-3"
                >
                  {/* Top-level comment header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-7 h-7 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                          {comment.userName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="text-xs sm:text-sm font-bold block">{comment.userName}</span>
                        <span className="text-[10px] opacity-60">
                          {new Date(comment.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : undefined)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setReplyingToId(isReplying ? null : comment.id)}
                      className="flex items-center gap-1 text-xs font-semibold opacity-70 hover:opacity-100 transition cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{t.reply}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line pl-9">
                    {comment.text}
                  </p>

                  {/* Inline reply box (1 level deep) */}
                  {isReplying && (
                    <form
                      onSubmit={e => handleAddComment(e, comment.id)}
                      className="ml-9 mt-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2 animate-in fade-in duration-150"
                    >
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`${language === 'bn' ? 'উত্তর দিচ্ছেন' : 'Replying to'} ${comment.userName}...`}
                        rows={2}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs focus:outline-none resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <CapsuleButton
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                        >
                          {t.cancel}
                        </CapsuleButton>
                        <CapsuleButton
                          variant="primary"
                          size="sm"
                          type="submit"
                          isLoading={isSubmittingComment}
                        >
                          {t.reply}
                        </CapsuleButton>
                      </div>
                    </form>
                  )}

                  {/* Nested replies (1 level deep) */}
                  {replies.length > 0 && (
                    <div className="ml-8 sm:ml-10 mt-3 space-y-2.5 border-l-2 border-black/10 dark:border-white/10 pl-3">
                      {replies.map(rep => (
                        <div key={rep.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            {rep.userAvatar ? (
                              <img
                                src={rep.userAvatar}
                                alt={rep.userName}
                                className="w-5 h-5 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">
                                {rep.userName.charAt(0)}
                              </div>
                            )}
                            <span className="text-xs font-bold">{rep.userName}</span>
                            <span className="text-[10px] opacity-60">
                              {new Date(rep.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : undefined)}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-line pl-7">
                            {rep.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs opacity-60 italic text-center py-6">
              {t.noCommentsYet}
            </p>
          )}
        </div>
      </section>
    </article>
  );
};
