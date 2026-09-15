import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

export interface Translations {
  // Brands
  brandIslamicName: string;
  brandIslamicTagline: string;
  brandIslamicShort: string;
  brandPsychologyName: string;
  brandPsychologyTagline: string;
  brandPsychologyShort: string;

  // Navigation
  navHome: string;
  navFeed: string;
  navAdmin: string;
  navProfile: string;
  navSignIn: string;
  navSignOut: string;
  navNewPost: string;
  navInstallApp: string;
  profile: string;
  signOut: string;
  newPost: string;

  // Themes & Modes
  darkMode: string;
  lightMode: string;
  offlineBanner: string;
  backOnline: string;

  // Feed & Filtering
  searchPlaceholder: string;
  filterAll: string;
  filterArticles: string;
  filterVideos: string;
  allTypes: string;
  articles: string;
  videos: string;
  allTopics: string;
  clearFilters: string;
  readTimeSuffix: string;
  likesCount: string;
  commentsCount: string;
  noPostsFound: string;
  noPostsDesc: string;
  exploreMore: string;

  // Post Detail
  backToFeed: string;
  publishedOn: string;
  byAuthor: string;
  sharePost: string;
  linkCopied: string;
  likeAction: string;
  likedStatus: string;
  signInToLike: string;
  commentsHeading: string;
  commentPlaceholder: string;
  submitComment: string;
  submitting: string;
  signInToComment: string;
  studyMaterials: string;
  videoTranscript: string;
  downloadOrView: string;

  // Admin
  adminTitle: string;
  adminSub: string;
  createNewPost: string;
  newArticle: string;
  newVideo: string;
  editPostTitle: string;
  titleLabel: string;
  slugLabel: string;
  excerptLabel: string;
  coverImageLabel: string;
  uploadImageBtn: string;
  tagsLabel: string;
  youtubeUrlLabel: string;
  studyMaterialsLabel: string;
  transcriptLabel: string;
  saveDraftBtn: string;
  publishBtn: string;
  savingBtn: string;
  deleteBtn: string;
  confirmDeleteMsg: string;
  statusPublished: string;
  statusDraft: string;
  tableTitle: string;
  tableBrand: string;
  tableType: string;
  tableStatus: string;
  tableActions: string;
  exitAdmin: string;

  // Auth
  signInHeading: string;
  signUpHeading: string;
  emailLabel: string;
  passwordLabel: string;
  displayNameLabel: string;
  signInSubmit: string;
  signUpSubmit: string;
  continueWithGoogle: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;

  // Profile
  profileHeading: string;
  profileSub: string;
  signInPrompt: string;
  signInPromptTitle: string;
  signInPromptDesc: string;
  editProfile: string;
  saveProfile: string;
  bioLabel: string;
  brandPrefLabel: string;
  roleBadge: string;
}

const translations: Record<Language, Translations> = {
  bn: {
    // Brands
    brandIslamicName: 'আকাশ ইসলামিক সেন্টার',
    brandIslamicTagline: 'ইসলামিক শিক্ষা, কুরআনীয় গবেষণা ও আত্মিক দিকনির্দেশনা',
    brandIslamicShort: 'আকাশ ইসলামিক',
    brandPsychologyName: 'মাইন্ডস্কোপ এডুকেশন',
    brandPsychologyTagline: 'মনস্তত্ত্ব, মানসিক বিকাশ ও আচরণ বিজ্ঞান',
    brandPsychologyShort: 'মাইন্ডস্কোপ',

    // Navigation
    navHome: 'হোম',
    navFeed: 'ফিড',
    navAdmin: 'অ্যাডমিন',
    navProfile: 'প্রোফাইল',
    navSignIn: 'সাইন ইন',
    navSignOut: 'লগআউট',
    navNewPost: 'পোস্ট',
    navInstallApp: 'অ্যাপ ইনস্টল করুন',
    profile: 'প্রোফাইল',
    signOut: 'লগআউট',
    newPost: 'নতুন পোস্ট',

    // Themes & Modes
    darkMode: 'ডার্ক মোড',
    lightMode: 'লাইট মোড',
    offlineBanner: 'অফলাইন মোড সক্রিয় — সংরক্ষিত তথ্য প্রদর্শিত হচ্ছে',
    backOnline: 'আপনি আবার ইন্টারনেটে যুক্ত হয়েছেন',

    // Feed & Filtering
    searchPlaceholder: 'পোস্ট, বিষয় বা ট্যাগ অনুসন্ধান করুন...',
    filterAll: 'সকল কনটেন্ট',
    filterArticles: 'নিবন্ধ',
    filterVideos: 'ভিডিও ও লেকচার',
    allTypes: 'সকল ধরন',
    articles: 'নিবন্ধ',
    videos: 'ভিডিও',
    allTopics: 'সকল বিষয়',
    clearFilters: 'ফিল্টার রিসেট করুন',
    readTimeSuffix: 'মিনিট পাঠ',
    likesCount: 'পছন্দ',
    commentsCount: 'মন্তব্য',
    noPostsFound: 'কোনো পোস্ট পাওয়া যায়নি',
    noPostsDesc: 'এই ক্যাটাগরিতে বা অনুসন্ধান অনুযায়ী কোনো পোস্ট খুঁজে পাওয়া যায়নি।',
    exploreMore: 'আরও দেখুন',

    // Post Detail
    backToFeed: 'পূর্বের পৃষ্ঠায় ফিরে যান',
    publishedOn: 'প্রকাশের তারিখ:',
    byAuthor: 'লেখক:',
    sharePost: 'শেয়ার করুন',
    linkCopied: 'পোস্টের লিংক কপি করা হয়েছে!',
    likeAction: 'পছন্দ করুন',
    likedStatus: 'পছন্দ করেছেন',
    signInToLike: 'পছন্দ করতে অনুগ্রহ করে সাইন ইন করুন',
    commentsHeading: 'মন্তব্য ও আলোচনা',
    commentPlaceholder: 'আপনার গঠনমূলক মতামত বা প্রশ্ন লিখুন...',
    submitComment: 'মন্তব্য প্রকাশ করুন',
    submitting: 'প্রকাশ হচ্ছে...',
    signInToComment: 'আলোচনায় অংশ নিতে অনুগ্রহ করে সাইন ইন করুন',
    studyMaterials: 'স্টাডি ম্যাটেরিয়াল ও সহায়ক নোটস',
    videoTranscript: 'ভিডিও ট্রান্সক্রিপ্ট ও সারসংক্ষেপ',
    downloadOrView: 'সংগ্রহ করুন',

    // Admin
    adminTitle: 'পোস্ট পরিচালনা ও অ্যাডমিন প্যানেল',
    adminSub: 'আকাশ ইসলামিক সেন্টার ও মাইন্ডস্কোপের কনটেন্ট ম্যানেজমেন্ট',
    createNewPost: 'নতুন পোস্ট তৈরি করুন',
    newArticle: 'নতুন নিবন্ধ',
    newVideo: 'নতুন ভিডিও',
    editPostTitle: 'পোস্ট সম্পাদনা',
    titleLabel: 'পোস্টের পূর্ণাঙ্গ শিরোনাম',
    slugLabel: 'ইউআরএল স্লাগ (ইংরেজিতে সংক্ষেপ)',
    excerptLabel: 'সংক্ষিপ্ত সারসংক্ষেপ ও ভূমিকা',
    coverImageLabel: 'কভার ছবির লিংক (URL)',
    uploadImageBtn: 'ছবি আপলোড',
    tagsLabel: 'ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)',
    youtubeUrlLabel: 'ইউটিউব ভিডিও ইউআরএল বা আইডি',
    studyMaterialsLabel: 'সহায়ক স্টাডি ম্যাটেরিয়াল (PDF / লিংক)',
    transcriptLabel: 'ভিডিও বিস্তারিত ট্রান্সক্রিপ্ট',
    saveDraftBtn: 'ড্রাফট হিসেবে রাখুন',
    publishBtn: 'এখনই প্রকাশ করুন',
    savingBtn: 'সংরক্ষণ করা হচ্ছে...',
    deleteBtn: 'মুছে ফেলুন',
    confirmDeleteMsg: 'আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান?',
    statusPublished: 'প্রকাশিত',
    statusDraft: 'ড্রাফট',
    tableTitle: 'শিরোনাম',
    tableBrand: 'ব্র্যান্ড',
    tableType: 'ধরন',
    tableStatus: 'অবস্থা',
    tableActions: 'কার্যক্রম',
    exitAdmin: 'অ্যাডমিন থেকে প্রস্থান',

    // Auth
    signInHeading: 'আপনার অ্যাকাউন্টে প্রবেশ করুন',
    signUpHeading: 'নতুন অ্যাকাউন্ট তৈরি করুন',
    emailLabel: 'ইমেইল ঠিকানা',
    passwordLabel: 'পাসওয়ার্ড',
    displayNameLabel: 'আপনার পুরো নাম',
    signInSubmit: 'সাইন ইন করুন',
    signUpSubmit: 'নিবন্ধন সম্পন্ন করুন',
    continueWithGoogle: 'গুগল দিয়ে চালিয়ে যান',
    dontHaveAccount: 'অ্যাকাউন্ট নেই? নতুন অ্যাকাউন্ট খুলুন',
    alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন',

    // Profile
    profileHeading: 'ব্যবহারকারী প্রোফাইল',
    profileSub: 'ব্যক্তিগত তথ্য ও ডিফল্ট পছন্দসমূহ',
    signInPrompt: 'আপনার প্রোফাইল দেখতে সাইন ইন করুন',
    signInPromptTitle: 'প্রোফাইল দেখতে সাইন ইন করুন',
    signInPromptDesc: 'আপনার পছন্দের ব্র্যান্ড নির্ধারণ করতে এবং মন্তব্যের হিস্টোরি রাখতে সাইন ইন করুন।',
    editProfile: 'প্রোফাইল সম্পাদনা',
    saveProfile: 'পরিবর্তন সংরক্ষণ করুন',
    bioLabel: 'সংক্ষিপ্ত পরিচয় / বায়ো',
    brandPrefLabel: 'ডিফল্ট ব্র্যান্ড পছন্দ',
    roleBadge: 'পদবি',
  },
  en: {
    // Brands
    brandIslamicName: 'Akash Islamic Center',
    brandIslamicTagline: 'Islamic Education, Quranic Teachings & Spiritual Guidance',
    brandIslamicShort: 'Akash Islamic',
    brandPsychologyName: 'Mindscope Education',
    brandPsychologyTagline: 'Psychology, Cognitive Growth & Human Behavior',
    brandPsychologyShort: 'Mindscope',

    // Navigation
    navHome: 'Home',
    navFeed: 'Feed',
    navAdmin: 'Admin',
    navProfile: 'Profile',
    navSignIn: 'Sign In',
    navSignOut: 'Sign Out',
    navNewPost: 'Post',
    navInstallApp: 'Install App',
    profile: 'Profile',
    signOut: 'Sign Out',
    newPost: 'New Post',

    // Themes & Modes
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    offlineBanner: 'Offline mode active — browsing cached content',
    backOnline: 'You are back online',

    // Feed & Filtering
    searchPlaceholder: 'Search posts, topics or tags...',
    filterAll: 'All Posts',
    filterArticles: 'Articles',
    filterVideos: 'Videos & Lectures',
    allTypes: 'All Types',
    articles: 'Articles',
    videos: 'Videos',
    allTopics: 'All Topics',
    clearFilters: 'Clear Filters',
    readTimeSuffix: 'min read',
    likesCount: 'likes',
    commentsCount: 'comments',
    noPostsFound: 'No posts found',
    noPostsDesc: 'No posts match your active search or filter criteria.',
    exploreMore: 'Explore More',

    // Post Detail
    backToFeed: 'Back to Feed',
    publishedOn: 'Published on:',
    byAuthor: 'By:',
    sharePost: 'Share',
    linkCopied: 'Link copied to clipboard!',
    likeAction: 'Like',
    likedStatus: 'Liked',
    signInToLike: 'Please sign in to like this post',
    commentsHeading: 'Comments & Reflections',
    commentPlaceholder: 'Write your constructive reflection or query...',
    submitComment: 'Post Comment',
    submitting: 'Posting...',
    signInToComment: 'Please sign in to join the discussion',
    studyMaterials: 'Study Materials & Notes',
    videoTranscript: 'Video Transcript & Summary',
    downloadOrView: 'Access',

    // Admin
    adminTitle: 'Admin Content Manager',
    adminSub: 'Manage posts across Akash Islamic Center and Mindscope',
    createNewPost: 'Create New Post',
    newArticle: 'New Article',
    newVideo: 'New Video',
    editPostTitle: 'Edit Post',
    titleLabel: 'Post Title',
    slugLabel: 'URL Slug',
    excerptLabel: 'Summary / Excerpt',
    coverImageLabel: 'Cover Image URL',
    uploadImageBtn: 'Upload Image',
    tagsLabel: 'Tags (comma separated)',
    youtubeUrlLabel: 'YouTube Video URL or ID',
    studyMaterialsLabel: 'Study Materials (PDF / Resource links)',
    transcriptLabel: 'Full Transcript / Lecture Notes',
    saveDraftBtn: 'Save Draft',
    publishBtn: 'Publish Now',
    savingBtn: 'Saving...',
    deleteBtn: 'Delete',
    confirmDeleteMsg: 'Are you sure you want to delete this post?',
    statusPublished: 'Published',
    statusDraft: 'Draft',
    tableTitle: 'Title',
    tableBrand: 'Brand',
    tableType: 'Type',
    tableStatus: 'Status',
    tableActions: 'Actions',
    exitAdmin: 'Exit Admin',

    // Auth
    signInHeading: 'Sign In to Your Account',
    signUpHeading: 'Create New Account',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    displayNameLabel: 'Full Name',
    signInSubmit: 'Sign In',
    signUpSubmit: 'Complete Registration',
    continueWithGoogle: 'Continue with Google',
    dontHaveAccount: "Don't have an account? Register",
    alreadyHaveAccount: 'Already have an account? Sign In',

    // Profile
    profileHeading: 'User Profile',
    profileSub: 'Personal information & default preferences',
    signInPrompt: 'Sign In to View Your Profile',
    signInPromptTitle: 'Sign In to View Your Profile',
    signInPromptDesc: 'Sign in to customize your brand preference and manage your activity.',
    editProfile: 'Edit Profile',
    saveProfile: 'Save Changes',
    bioLabel: 'Bio / Reflection',
    brandPrefLabel: 'Default Brand Preference',
    roleBadge: 'Role',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_LANG_KEY = 'akash_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Main language is BANGLA ('bn') by default as explicitly requested by user
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_LANG_KEY) as Language | null;
    if (stored === 'bn' || stored === 'en') {
      return stored;
    }
    return 'bn'; // MAIN LANGUAGE IS BANGLA
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
