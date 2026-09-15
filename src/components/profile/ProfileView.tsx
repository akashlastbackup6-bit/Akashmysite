import React, { useState } from 'react';
import { User, Mail, Shield, BookOpen, Brain, Edit3, Check, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBrand } from '../../context/BrandContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { CapsuleButton } from '../common/CapsuleButton';
import { Card } from '../common/Card';
import { Post, BrandId } from '../../types';
import { haptic } from '../../lib/haptics';

interface ProfileViewProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  openAuthModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  posts,
  onSelectPost,
  openAuthModal,
}) => {
  const { user, isAdmin, updateProfile, logout } = useAuth();
  const { brand, setBrand, isDarkMode } = useBrand();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [preferredBrand, setPreferredBrand] = useState<BrandId>(user?.brandPreference || 'islamic');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mx-auto">
          <User className="w-8 h-8 opacity-50" />
        </div>
        <h2 className="text-xl font-bold">{t.signInPrompt}</h2>
        <p className="text-xs sm:text-sm opacity-70">
          {language === 'bn'
            ? 'আপনার প্রিয় ব্র্যান্ড সেভ করতে এবং আলোচনায় যুক্ত হতে সাইন ইন করুন।'
            : 'Save your brand preferences, engage with comments, and save liked articles.'}
        </p>
        <CapsuleButton
          variant="primary"
          size="md"
          onClick={() => {
            haptic.light();
            openAuthModal();
          }}
        >
          {t.navSignIn}
        </CapsuleButton>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL: photoURL.trim() || undefined,
        brandPreference: preferredBrand,
      });
      setBrand(preferredBrand);
      setIsEditing(false);
      haptic.success();
      showToast(language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!', 'success');
    } catch {
      haptic.error();
      showToast(language === 'bn' ? 'প্রোফাইল আপডেট ব্যর্থ হয়েছে' : 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-6 pb-28 md:pb-16 space-y-6">
      {/* Profile Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-black/10 dark:border-white/20 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-800 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${
                isAdmin ? 'bg-amber-600' : 'bg-zinc-700'
              }`}
            >
              {user.role === 'admin' ? (language === 'bn' ? 'অ্যাডমিন' : 'Admin') : (language === 'bn' ? 'সদস্য' : 'Member')}
            </span>
          </div>

          {/* User info */}
          <div className="flex-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.displayName}</h1>
            <p className="text-xs sm:text-sm opacity-70 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 opacity-60" />
              <span>{user.email}</span>
            </p>
            {user.bio && (
              <p className="text-xs sm:text-sm opacity-90 pt-2 leading-relaxed max-w-md">
                {user.bio}
              </p>
            )}
          </div>

          <CapsuleButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setDisplayName(user.displayName);
              setBio(user.bio || '');
              setPhotoURL(user.photoURL || '');
              setPreferredBrand(user.brandPreference || 'islamic');
              setIsEditing(!isEditing);
            }}
            icon={<Edit3 className="w-3.5 h-3.5" />}
          >
            {isEditing ? t.cancel : t.edit}
          </CapsuleButton>
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="pt-4 border-t border-black/10 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-bold">{t.editProfile}</h3>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">{t.displayNameLabel}</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">{t.photoUrlLabel}</label>
              <input
                type="url"
                value={photoURL}
                onChange={e => setPhotoURL(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">{t.bioLabel}</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder={language === 'bn' ? 'নিজের সম্পর্কে কিছু লিখুন...' : 'Tell readers about yourself...'}
                className="w-full px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none resize-none"
              />
            </div>

            {/* Default Brand Preference */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 opacity-80">
                {t.brandPreferenceLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    setPreferredBrand('islamic');
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                    preferredBrand === 'islamic'
                      ? 'border-emerald-600 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'border-black/10 dark:border-white/10 opacity-70'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block">{language === 'bn' ? 'আকাশ ইসলামিক' : 'Akash Islamic'}</span>
                    <span className="text-[10px] opacity-70">{language === 'bn' ? 'ইসলামিক শিক্ষা ও কুরআন' : 'Islamic Education'}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    haptic.light();
                    setPreferredBrand('psychology');
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                    preferredBrand === 'psychology'
                      ? 'border-indigo-600 bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 font-bold'
                      : 'border-black/10 dark:border-white/10 opacity-70'
                  }`}
                >
                  <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="block">{language === 'bn' ? 'মাইন্ডস্কোপ' : 'Mindscope'}</span>
                    <span className="text-[10px] opacity-70">{language === 'bn' ? 'মনস্তত্ত্ব ও আচরণবিজ্ঞান' : 'Psychology/Edu'}</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <CapsuleButton variant="ghost" size="sm" type="button" onClick={() => setIsEditing(false)}>
                {t.cancel}
              </CapsuleButton>
              <CapsuleButton
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSaving}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                {t.saveChanges}
              </CapsuleButton>
            </div>
          </form>
        )}

        {/* Account controls & Sign Out */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="text-xs opacity-60">
            {language === 'bn' ? 'অ্যাকাউন্ট স্ট্যাটাস: সক্রিয়' : 'Account Status: Active'}
          </div>

          <CapsuleButton
            variant="ghost"
            size="sm"
            onClick={logout}
            icon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
            className="text-rose-500 hover:bg-rose-500/10"
          >
            {t.signOut}
          </CapsuleButton>
        </div>
      </Card>
    </div>
  );
};
