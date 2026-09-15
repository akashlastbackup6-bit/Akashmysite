import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  FileText,
  Video,
  BookOpen,
  Brain,
  Heart,
  MessageSquare,
  Upload,
  ArrowLeft,
} from 'lucide-react';
import { Post, PostType, BrandId, ContentBlock, StudyMaterial } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useBrand } from '../../context/BrandContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { createPost, updatePost, deletePost, uploadMediaFile } from '../../lib/firebase';
import { CapsuleButton } from '../common/CapsuleButton';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { BlockEditor } from './BlockEditor';
import { haptic } from '../../lib/haptics';

interface AdminPanelProps {
  posts: Post[];
  onRefreshPosts: () => void;
  onViewPost: (post: Post) => void;
  onExitAdmin: () => void;
  initialEditingPost?: Post | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  posts,
  onRefreshPosts,
  onViewPost,
  onExitAdmin,
  initialEditingPost = null,
}) => {
  const { user, isAdmin } = useAuth();
  const { brand: activeContextBrand } = useBrand();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [filterBrand, setFilterBrand] = useState<BrandId | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Editor Modal / Screen State
  const [isEditing, setIsEditing] = useState<boolean>(Boolean(initialEditingPost));
  const [editingPostId, setEditingPostId] = useState<string | null>(initialEditingPost?.id || null);

  // Form Fields
  const [postType, setPostType] = useState<PostType>(initialEditingPost?.type || 'article');
  const [targetBrand, setTargetBrand] = useState<BrandId>(initialEditingPost?.brand || activeContextBrand);
  const [title, setTitle] = useState(initialEditingPost?.title || '');
  const [titleBn, setTitleBn] = useState(initialEditingPost?.titleBn || '');
  const [slug, setSlug] = useState(initialEditingPost?.slug || '');
  const [excerpt, setExcerpt] = useState(initialEditingPost?.excerpt || '');
  const [excerptBn, setExcerptBn] = useState(initialEditingPost?.excerptBn || '');
  const [tagsInput, setTagsInput] = useState(initialEditingPost?.tags?.join(', ') || '');
  const [coverImage, setCoverImage] = useState(initialEditingPost?.coverImage || '');
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialEditingPost?.body || []);

  // Video Specific
  const [youtubeUrl, setYoutubeUrl] = useState(initialEditingPost?.youtubeUrl || '');
  const [transcript, setTranscript] = useState(initialEditingPost?.transcript || '');
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(
    initialEditingPost?.studyMaterials || []
  );
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');

  // Delete Confirmation Modal
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Helper: auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPostId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const openCreateNew = (type: PostType = 'article') => {
    haptic.admin();
    setEditingPostId(null);
    setPostType(type);
    setTargetBrand(activeContextBrand);
    setTitle('');
    setTitleBn('');
    setSlug('');
    setExcerpt('');
    setExcerptBn('');
    setTagsInput('');
    setCoverImage('');
    setYoutubeUrl('');
    setTranscript('');
    setStudyMaterials([]);
    setBlocks([
      {
        id: 'block-1',
        type: 'text',
        content: language === 'bn' ? 'এই গভীর আলোচনা এবং ভাবনায় স্বাগতম...' : 'Welcome to this in-depth guide and reflection...',
      },
    ]);
    setIsEditing(true);
  };

  const openEdit = (post: Post) => {
    haptic.admin();
    setEditingPostId(post.id);
    setPostType(post.type);
    setTargetBrand(post.brand);
    setTitle(post.title);
    setTitleBn(post.titleBn || '');
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setExcerptBn(post.excerptBn || '');
    setTagsInput(post.tags?.join(', ') || '');
    setCoverImage(post.coverImage || '');
    setYoutubeUrl(post.youtubeUrl || '');
    setTranscript(post.transcript || '');
    setStudyMaterials(post.studyMaterials || []);
    setBlocks(post.body || []);
    setIsEditing(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadMediaFile(file, 'covers');
      setCoverImage(url);
      showToast(language === 'bn' ? 'ছবি সফলভাবে আপলোড হয়েছে!' : 'Image uploaded successfully!', 'success');
    } catch {
      showToast(language === 'bn' ? 'আপলোড ব্যর্থ হয়েছে, ফাইল চেক করুন' : 'Upload failed, please check file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddStudyMaterial = () => {
    if (!newMaterialTitle.trim() || !newMaterialUrl.trim()) return;
    setStudyMaterials([
      ...studyMaterials,
      {
        title: newMaterialTitle.trim(),
        url: newMaterialUrl.trim(),
        type: 'pdf',
      },
    ]);
    setNewMaterialTitle('');
    setNewMaterialUrl('');
  };

  const handleRemoveStudyMaterial = (idx: number) => {
    setStudyMaterials(studyMaterials.filter((_, i) => i !== idx));
  };

  const handleSave = async (status: 'published' | 'draft') => {
    const effectiveTitle = title.trim() || titleBn.trim();
    if (!effectiveTitle || !slug.trim()) {
      showToast(language === 'bn' ? 'অনুগ্রহ করে শিরোনাম এবং স্লাগ প্রদান করুন' : 'Please provide both Title and Slug', 'error');
      return;
    }

    setIsSaving(true);
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      const postPayload = {
        title: title.trim() || titleBn.trim(),
        titleBn: titleBn.trim() || undefined,
        slug: slug.trim(),
        excerpt: excerpt.trim() || excerptBn.trim() || effectiveTitle,
        excerptBn: excerptBn.trim() || undefined,
        brand: targetBrand,
        type: postType,
        status,
        authorId: user?.id || 'admin-akash',
        authorName: user?.displayName || (language === 'bn' ? 'আকাশ (ডিরেক্টর)' : 'Akash (Director)'),
        authorAvatar: user?.photoURL,
        coverImage: coverImage.trim() || undefined,
        tags: parsedTags,
        body: postType === 'article' ? blocks : [],
        youtubeUrl: postType === 'video' ? youtubeUrl.trim() : undefined,
        transcript: postType === 'video' ? transcript.trim() : undefined,
        studyMaterials: postType === 'video' ? studyMaterials : undefined,
      };

      if (editingPostId) {
        await updatePost(editingPostId, postPayload);
        haptic.success();
        showToast(
          status === 'published'
            ? (language === 'bn' ? 'পোস্ট আপডেট এবং প্রকাশিত হয়েছে!' : 'Post updated and published!')
            : (language === 'bn' ? 'খসড়া সংরক্ষিত হয়েছে!' : 'Draft updated!'),
          'success'
        );
      } else {
        await createPost(postPayload);
        haptic.success();
        showToast(
          status === 'published'
            ? (language === 'bn' ? 'পোস্ট তৈরি এবং প্রকাশিত হয়েছে!' : 'Post created and published!')
            : (language === 'bn' ? 'খসড়া হিসেবে সংরক্ষিত!' : 'Saved as draft!'),
          'success'
        );
      }

      setIsEditing(false);
      onRefreshPosts();
    } catch (err: any) {
      haptic.error();
      showToast(err?.message || (language === 'bn' ? 'পোস্ট সংরক্ষণে ব্যর্থ' : 'Failed to save post'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete.id);
      haptic.error();
      showToast(language === 'bn' ? 'পোস্ট সফলভাবে মুছে ফেলা হয়েছে' : 'Post deleted successfully', 'info');
      setPostToDelete(null);
      if (editingPostId === postToDelete.id) {
        setIsEditing(false);
      }
      onRefreshPosts();
    } catch {
      haptic.error();
      showToast(language === 'bn' ? 'পোস্ট মুছতে ব্যর্থ' : 'Failed to delete post', 'error');
    }
  };

  const handleTogglePublish = async (post: Post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updatePost(post.id, { status: nextStatus });
      haptic.success();
      showToast(
        nextStatus === 'published'
          ? (language === 'bn' ? 'পোস্টটি প্রকাশিত হয়েছে' : 'Post marked as published')
          : (language === 'bn' ? 'পোস্টটি খসড়ায় নেওয়া হয়েছে' : 'Post marked as draft'),
        'success'
      );
      onRefreshPosts();
    } catch {
      haptic.error();
      showToast(language === 'bn' ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Failed to update status', 'error');
    }
  };

  // Filtered post list for admin table
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (filterBrand !== 'all' && p.brand !== filterBrand) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      return true;
    });
  }, [posts, filterBrand, filterStatus]);

  // High-level overview stats
  const stats = useMemo(() => {
    const islamicCount = posts.filter(p => p.brand === 'islamic').length;
    const psychCount = posts.filter(p => p.brand === 'psychology').length;
    const totalViews = posts.reduce((acc, p) => acc + (p.viewCount || 0), 0);
    const totalLikes = posts.reduce((acc, p) => acc + (p.likeCount || 0), 0);
    const totalComments = posts.reduce((acc, p) => acc + (p.commentCount || 0), 0);
    return { islamicCount, psychCount, totalViews, totalLikes, totalComments };
  }, [posts]);

  // Guard: Not an admin
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">
          {language === 'bn' ? 'অ্যাডমিন অনুমতি প্রয়োজন' : 'Admin Privileges Required'}
        </h2>
        <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
          {language === 'bn' ? (
            <>
              <strong>/admin</strong> ড্যাশবোর্ডটি শুধুমাত্র অনুমোদিত অ্যাডমিনিস্ট্রেটর অ্যাকাউন্ট (
              <code>akash994220@gmail.com</code> / <code>akashdaraz994@gmail.com</code>) এর জন্য সংরক্ষিত।
            </>
          ) : (
            <>
              The <strong>/admin</strong> dashboard is restricted to administrator accounts (
              <code>akash994220@gmail.com</code> / <code>akashdaraz994@gmail.com</code>).
            </>
          )}
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <CapsuleButton variant="primary" size="md" onClick={onExitAdmin}>
            {language === 'bn' ? 'ফিডে ফিরে যান' : 'Return to Feed'}
          </CapsuleButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 sm:px-6 py-6 pb-28 md:pb-16 space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30">
              {language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস' : 'Admin Access'}
            </span>
            <span className="text-xs opacity-60">·</span>
            <span className="text-xs opacity-75">{user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'bn' ? 'কন্টেন্ট ও পোস্ট ব্যবস্থাপনা' : 'Content Management'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <CapsuleButton
            variant="secondary"
            size="sm"
            onClick={onExitAdmin}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            {language === 'bn' ? 'প্রস্থান' : 'Exit Admin'}
          </CapsuleButton>

          <CapsuleButton
            variant="primary"
            size="sm"
            onClick={() => openCreateNew('article')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            {language === 'bn' ? 'নতুন পোস্ট' : 'New Post'}
          </CapsuleButton>
        </div>
      </div>

      {/* Stats Summary Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] opacity-70 font-semibold uppercase">
              {language === 'bn' ? 'আকাশ ইসলামিক' : 'Akash Islamic'}
            </p>
            <p className="text-lg sm:text-xl font-bold">
              {stats.islamicCount} {language === 'bn' ? 'টি পোস্ট' : 'posts'}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] opacity-70 font-semibold uppercase">
              {language === 'bn' ? 'মাইন্ডস্কোপ' : 'Mindscope'}
            </p>
            <p className="text-lg sm:text-xl font-bold">
              {stats.psychCount} {language === 'bn' ? 'টি পোস্ট' : 'posts'}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] opacity-70 font-semibold uppercase">
              {language === 'bn' ? 'মোট লাইক' : 'Total Likes'}
            </p>
            <p className="text-lg sm:text-xl font-bold">{stats.totalLikes}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] opacity-70 font-semibold uppercase">
              {language === 'bn' ? 'মন্তব্য/আলোচনা' : 'Discussions'}
            </p>
            <p className="text-lg sm:text-xl font-bold">{stats.totalComments}</p>
          </div>
        </Card>
      </div>

      {/* Post Manager Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Brand Filter */}
          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold focus:outline-none"
          >
            <option value="all">{language === 'bn' ? 'সকল ব্র্যান্ড' : 'All Brands'}</option>
            <option value="islamic">{language === 'bn' ? 'আকাশ ইসলামিক সেন্টার' : 'Akash Islamic Center'}</option>
            <option value="psychology">{language === 'bn' ? 'মাইন্ডস্কোপ এডুকেশন' : 'Mindscope Education'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold focus:outline-none"
          >
            <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
            <option value="published">{language === 'bn' ? 'প্রকাশিত' : 'Published'}</option>
            <option value="draft">{language === 'bn' ? 'খসড়া' : 'Drafts'}</option>
          </select>
        </div>

        <span className="text-xs opacity-60">
          {language === 'bn'
            ? `${posts.length}টির মধ্যে ${filteredPosts.length}টি পোস্ট দেখাচ্ছে`
            : `Showing ${filteredPosts.length} of ${posts.length} posts`}
        </span>
      </div>

      {/* Post List Table / Cards */}
      <div className="space-y-3">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => {
            const displayTitle = language === 'bn' ? (post.titleBn || post.title) : post.title;
            const displayExcerpt = language === 'bn' ? (post.excerptBn || post.excerpt) : post.excerpt;

            return (
              <Card
                key={post.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-black/10 dark:border-white/10"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="w-16 h-14 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 shrink-0 hidden min-[400px]:block">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-30">
                        {post.type === 'video' ? (
                          <Video className="w-6 h-6" />
                        ) : (
                          <FileText className="w-6 h-6" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          post.brand === 'islamic'
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300'
                        }`}
                      >
                        {post.brand === 'islamic'
                          ? (language === 'bn' ? 'ইসলামিক' : 'Islamic')
                          : (language === 'bn' ? 'মাইন্ডস্কোপ' : 'Mindscope')}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          post.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {post.status === 'published'
                          ? (language === 'bn' ? 'প্রকাশিত' : 'Published')
                          : (language === 'bn' ? 'খসড়া' : 'Draft')}
                      </span>

                      <span className="text-[10px] opacity-60">
                        {new Date(post.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : undefined)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold truncate">{displayTitle}</h3>
                    <p className="text-xs opacity-70 truncate max-w-lg">{displayExcerpt}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      post.status === 'published'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                    }`}
                  >
                    {post.status === 'published'
                      ? (language === 'bn' ? 'খসড়া করুন' : 'Make Draft')
                      : (language === 'bn' ? 'প্রকাশ করুন' : 'Publish')}
                  </button>

                  <button
                    onClick={() => onViewPost(post)}
                    className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold transition cursor-pointer"
                    title={language === 'bn' ? 'পোস্ট দেখুন' : 'View post'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold transition cursor-pointer"
                    title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit post'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setPostToDelete(post)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold transition cursor-pointer"
                    title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete post'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 border border-dashed border-black/15 dark:border-white/15 rounded-3xl opacity-70 space-y-2">
            <p className="text-sm font-semibold">
              {language === 'bn' ? 'ফিল্টারের সাথে কোনো পোস্ট মিলছে না।' : 'No posts matching filters.'}
            </p>
            <CapsuleButton variant="primary" size="sm" onClick={() => openCreateNew('article')}>
              {language === 'bn' ? 'প্রথম পোস্ট তৈরি করুন' : 'Create Your First Post'}
            </CapsuleButton>
          </div>
        )}
      </div>

      {/* Post Editor Modal / Full View */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title={
            editingPostId
              ? (language === 'bn' ? 'পোস্ট সম্পাদনা করুন' : 'Edit Post')
              : (language === 'bn' ? 'নতুন পোস্ট তৈরি করুন' : 'Create New Post')
          }
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* Type & Brand selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {language === 'bn' ? 'পোস্টের ধরন' : 'Post Type'}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('article')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      postType === 'article'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                        : 'border-black/10 dark:border-white/10 opacity-70'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    {language === 'bn' ? 'প্রবন্ধ' : 'Article'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('video')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      postType === 'video'
                        ? 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-300'
                        : 'border-black/10 dark:border-white/10 opacity-70'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {language === 'bn' ? 'ভিডিও লেকচার' : 'Video Lecture'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {language === 'bn' ? 'ব্র্যান্ড বিভাগ' : 'Brand Identity'}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetBrand('islamic')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      targetBrand === 'islamic'
                        ? 'bg-emerald-800 text-amber-200 border-emerald-700'
                        : 'border-black/10 dark:border-white/10 opacity-70'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'আকাশ ইসলামিক' : 'Akash Islamic'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetBrand('psychology')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      targetBrand === 'psychology'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'border-black/10 dark:border-white/10 opacity-70'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'মাইন্ডস্কোপ' : 'Mindscope'}
                  </button>
                </div>
              </div>
            </div>

            {/* Title (Bengali & English) */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {language === 'bn' ? 'পোস্টের শিরোনাম (বাংলা)' : 'Post Title (Bangla)'}
                </label>
                <input
                  type="text"
                  value={titleBn}
                  onChange={e => setTitleBn(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: কুরআনে ধৈর্যের আধ্যাত্মিক শক্তি' : 'e.g. কুরআনে ধৈর্যের আধ্যাত্মিক শক্তি'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {language === 'bn' ? 'পোস্টের শিরোনাম (English)' : 'Post Title (English)'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Architecture of Patience in the Quran"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {language === 'bn' ? 'ইউআরএল স্লাগ (URL Slug)' : 'URL Slug'}
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="architecture-of-patience"
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {language === 'bn' ? 'ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)' : 'Tags (comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="quran, patience, reflection"
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Excerpt (Bangla & English) */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {language === 'bn' ? 'সংক্ষিপ্ত বিবরণ / সারসংক্ষেপ (বাংলা)' : 'Summary / Excerpt (Bangla)'}
                </label>
                <textarea
                  value={excerptBn}
                  onChange={e => setExcerptBn(e.target.value)}
                  rows={2}
                  placeholder={language === 'bn' ? 'ফিড কার্ডের জন্য আকর্ষণীয় বিবরণ...' : 'Bangla summary for feed cards...'}
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  {language === 'bn' ? 'সংক্ষিপ্ত বিবরণ (English)' : 'Summary / Excerpt (English)'}
                </label>
                <textarea
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Brief hook for feed cards..."
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold opacity-80">
                {language === 'bn' ? 'কভার ইমেজ ইউআরএল' : 'Cover Image URL'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs focus:outline-none"
                />
                <label className="px-3 py-2 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/15 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isUploading
                      ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...')
                      : (language === 'bn' ? 'আপলোড' : 'Upload')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {coverImage && (
                <div className="w-full h-32 rounded-xl overflow-hidden mt-2 bg-black/10">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* VIDEO FIELDS */}
            {postType === 'video' && (
              <div className="space-y-4 pt-3 border-t border-black/10 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">
                  {language === 'bn' ? 'ভিডিও সেটিংস' : 'Video Settings'}
                </h4>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {language === 'bn' ? 'ইউটিউব ভিডিও ইউআরএল' : 'YouTube Video URL'}
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    {language === 'bn' ? 'সম্পূর্ণ ভিডিও প্রতিলিপি / ট্রান্সক্রিপ্ট (ঐচ্ছিক)' : 'Full Video Transcript (Optional)'}
                  </label>
                  <textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    rows={4}
                    placeholder={language === 'bn' ? 'শিক্ষার্থীদের অধ্যয়নের জন্য সেশনের প্রতিলিপি এখানে দিন...' : 'Paste the session transcript here for students...'}
                    className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                {/* Supplementary Study Materials */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold opacity-80">
                    {language === 'bn' ? 'সম্পূরক পাঠ্য উপকরণ' : 'Supplementary Study Materials'} ({studyMaterials.length})
                  </label>
                  <div className="space-y-1.5">
                    {studyMaterials.map((sm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs"
                      >
                        <span className="font-semibold truncate">{sm.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStudyMaterial(idx)}
                          className="text-rose-500 hover:text-rose-700 ml-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMaterialTitle}
                      onChange={e => setNewMaterialTitle(e.target.value)}
                      placeholder={language === 'bn' ? 'ডকুমেন্ট শিরোনাম (যেমন: তাজবীদ চার্ট PDF)' : 'Doc title (e.g. Tajweed Chart PDF)'}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs"
                    />
                    <input
                      type="url"
                      value={newMaterialUrl}
                      onChange={e => setNewMaterialUrl(e.target.value)}
                      placeholder="URL (https://...)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddStudyMaterial}
                      className="px-3 py-1.5 rounded-xl bg-black/10 dark:bg-white/10 text-xs font-bold hover:bg-black/20 cursor-pointer"
                    >
                      {language === 'bn' ? 'যোগ করুন' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ARTICLE BLOCK EDITOR */}
            {postType === 'article' && (
              <div className="pt-3 border-t border-black/10 dark:border-white/10">
                <BlockEditor blocks={blocks} onChange={setBlocks} />
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
              <div>
                {editingPostId && (
                  <button
                    type="button"
                    onClick={() => {
                      const found = posts.find(p => p.id === editingPostId);
                      if (found) setPostToDelete(found);
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <CapsuleButton
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </CapsuleButton>

                <CapsuleButton
                  variant="secondary"
                  size="sm"
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('draft')}
                >
                  {language === 'bn' ? 'খসড়া সংরক্ষণ' : 'Save Draft'}
                </CapsuleButton>

                <CapsuleButton
                  variant="primary"
                  size="sm"
                  type="button"
                  isLoading={isSaving}
                  onClick={() => handleSave('published')}
                  icon={<CheckCircle className="w-3.5 h-3.5" />}
                >
                  {language === 'bn' ? 'এখনই প্রকাশ করুন' : 'Publish Now'}
                </CapsuleButton>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <Modal
          isOpen={Boolean(postToDelete)}
          onClose={() => setPostToDelete(null)}
          title={language === 'bn' ? 'পোস্ট মুছে ফেলার নিশ্চিতকরণ' : 'Delete Post Confirmation'}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              {language === 'bn' ? (
                <>
                  আপনি কি নিশ্চিত যে আপনি স্থায়ীভাবে মুছে ফেলতে চান{' '}
                  <strong>"{postToDelete.titleBn || postToDelete.title}"</strong>? এই কাজটি আর পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete{' '}
                  <strong>"{postToDelete.title}"</strong>? This action cannot be undone.
                </>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <CapsuleButton
                variant="ghost"
                size="sm"
                onClick={() => setPostToDelete(null)}
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </CapsuleButton>
              <CapsuleButton
                variant="danger"
                size="sm"
                onClick={handleDelete}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                {language === 'bn' ? 'স্থায়ীভাবে মুছুন' : 'Delete Permanently'}
              </CapsuleButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
