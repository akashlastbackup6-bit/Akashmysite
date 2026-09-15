import { BrandConfig, BrandId } from '../types';

export const BRANDS: Record<BrandId, BrandConfig> = {
  islamic: {
    id: 'islamic',
    name: 'Akash Islamic Center',
    nameBn: 'আকাশ ইসলামিক সেন্টার',
    tagline: 'Islamic Education & Quranic Teachings',
    taglineBn: 'ইসলামিক শিক্ষা, কুরআনীয় গবেষণা ও আত্মিক নির্দেশনা',
    shortName: 'Akash Islamic',
    shortNameBn: 'আকাশ ইসলামিক',
    primaryColor: '#064e3b', // Deep emerald green
    accentColor: '#d97706',  // Warm gold / amber
    headingFont: "'Playfair Display', 'Hind Siliguri', serif",
    bodyFont: "'Plus Jakarta Sans', 'Noto Sans Bengali', sans-serif",
    logoIcon: 'BookOpen',
    description: 'Enlightening hearts and minds through authentic Quranic reflections, prophetic teachings, and timeless spiritual guidance.',
    descriptionBn: 'সহিহ কুরআনীয় ভাবনা, সুন্নাহর দিকনির্দেশনা ও আত্মিক মূল্যবোধের সমন্বয়ে অন্তর ও জীবনকে আলোকিত করার প্ল্যাটফর্ম।',
  },
  psychology: {
    id: 'psychology',
    name: 'Mindscope Education',
    nameBn: 'মাইন্ডস্কোপ এডুকেশন',
    tagline: 'Psychology, Cognitive Growth & Human Behavior',
    taglineBn: 'মনস্তত্ত্ব, মানসিক বিকাশ ও আচরণ বিজ্ঞান',
    shortName: 'Mindscope',
    shortNameBn: 'মাইন্ডস্কোপ',
    primaryColor: '#4f46e5', // Indigo / Teal gradient tone
    accentColor: '#f97316',  // Vibrant coral accent
    headingFont: "'Outfit', 'Hind Siliguri', sans-serif",
    bodyFont: "'Outfit', 'Noto Sans Bengali', sans-serif",
    logoIcon: 'Brain',
    description: 'Exploring scientific psychology, mental resilience, cognitive models, and educational strategies for personal mastery.',
    descriptionBn: 'বিজ্ঞানসম্মত মনস্তত্ত্ব, মানসিক দৃঢ়তা, কগনিটিভ মডেল ও আত্মউন্নয়নের কার্যকর কৌশল।',
  },
};

export const DEFAULT_BRAND: BrandId = 'islamic';
