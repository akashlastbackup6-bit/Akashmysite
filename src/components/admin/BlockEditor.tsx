import React from 'react';
import {
  Type,
  Heading,
  Image as ImageIcon,
  Quote,
  Youtube,
  Minus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
} from 'lucide-react';
import { ContentBlock, ContentBlockType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const { language } = useLanguage();

  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: 'block-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      content: '',
      caption: type === 'quote' 
        ? (language === 'bn' ? 'উৎস বা লেখক' : 'Source or Author') 
        : type === 'image' 
        ? (language === 'bn' ? 'ছবির ক্যাপশন' : 'Image caption') 
        : undefined,
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlockContent = (id: string, content: string) => {
    onChange(blocks.map(b => (b.id === id ? { ...b, content } : b)));
  };

  const updateBlockCaption = (id: string, caption: string) => {
    onChange(blocks.map(b => (b.id === id ? { ...b, caption } : b)));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const clone = [...blocks];
    const temp = clone[index];
    clone[index] = clone[targetIdx];
    clone[targetIdx] = temp;
    onChange(clone);
  };

  const getBlockTypeName = (type: ContentBlockType) => {
    if (language !== 'bn') return `${type} block`;
    switch (type) {
      case 'text': return 'টেক্সট ব্লক';
      case 'heading': return 'শিরোনাম ব্লক';
      case 'image': return 'ছবি ব্লক';
      case 'quote': return 'উদ্ধৃতি / আয়াত ব্লক';
      case 'youtube': return 'ভিডিও ব্লক';
      case 'divider': return 'ডিভাইডার ব্লক';
      default: return `${type} ব্লক`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
          {language === 'bn' ? 'আর্টিকেল কনটেন্ট ব্লক' : 'Article Content Blocks'} ({blocks.length})
        </span>
        <span className="text-[11px] opacity-60">
          {language === 'bn' ? 'মডুলার ব্লক সিস্টেম' : 'Modular Blocks'}
        </span>
      </div>

      {/* Rendered Block Items */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2 group transition"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-black/10 dark:bg-white/10 text-xs">
                  {block.type === 'text' && <Type className="w-3.5 h-3.5" />}
                  {block.type === 'heading' && <Heading className="w-3.5 h-3.5" />}
                  {block.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                  {block.type === 'quote' && <Quote className="w-3.5 h-3.5" />}
                  {block.type === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-500" />}
                  {block.type === 'divider' && <Minus className="w-3.5 h-3.5" />}
                </span>
                <span className="text-xs font-semibold capitalize opacity-80">
                  {getBlockTypeName(block.type)}
                </span>
              </div>

              {/* Block reorder / delete controls */}
              <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveBlock(index, 'up')}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === blocks.length - 1}
                  onClick={() => moveBlock(index, 'down')}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                  title="Delete Block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Block Input fields based on type */}
            {block.type === 'text' && (
              <textarea
                value={block.content}
                onChange={e => updateBlockContent(block.id, e.target.value)}
                placeholder={language === 'bn' ? 'অনুচ্ছেদ লিখুন বা আলোচনা...' : 'Write paragraph text or reflections...'}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none resize-y"
              />
            )}

            {block.type === 'heading' && (
              <input
                type="text"
                value={block.content}
                onChange={e => updateBlockContent(block.id, e.target.value)}
                placeholder={language === 'bn' ? 'সেকশন শিরোনাম (H2)...' : 'Section Heading (H2)...'}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs sm:text-sm font-bold focus:outline-none"
              />
            )}

            {block.type === 'quote' && (
              <div className="space-y-2">
                <textarea
                  value={block.content}
                  onChange={e => updateBlockContent(block.id, e.target.value)}
                  placeholder={language === 'bn' ? 'উদ্ধৃতি বা কুরআনের আয়াত অনুবাদ লিখুন...' : 'Insert quote or Quranic ayah translation...'}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs sm:text-sm italic focus:outline-none"
                />
                <input
                  type="text"
                  value={block.caption || ''}
                  onChange={e => updateBlockCaption(block.id, e.target.value)}
                  placeholder={language === 'bn' ? 'উৎস বা রেফারেন্স (যেমন: সূরা আল-বাক্বারাহ ২:২৫৫)' : 'Citation or source (e.g. Surah Al-Baqarah 2:255)'}
                  className="w-full p-2 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs focus:outline-none"
                />
              </div>
            )}

            {block.type === 'image' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={block.content}
                  onChange={e => updateBlockContent(block.id, e.target.value)}
                  placeholder="Image URL (https://...)"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none"
                />
                <input
                  type="text"
                  value={block.caption || ''}
                  onChange={e => updateBlockCaption(block.id, e.target.value)}
                  placeholder={language === 'bn' ? 'ছবির বিবরণ / ক্যাপশন (ঐচ্ছিক)' : 'Image caption (optional)'}
                  className="w-full p-2 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs focus:outline-none"
                />
              </div>
            )}

            {block.type === 'youtube' && (
              <input
                type="text"
                value={block.content}
                onChange={e => updateBlockContent(block.id, e.target.value)}
                placeholder="YouTube URL or Embed ID (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full p-2.5 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 text-xs sm:text-sm focus:outline-none"
              />
            )}

            {block.type === 'divider' && (
              <div className="py-2 text-center text-xs opacity-50 italic">
                ─── {language === 'bn' ? 'ভিজ্যুয়াল সেকশন ডিভাইডার' : 'Visual Section Divider'} ───
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Block Toolbar buttons */}
      <div className="p-3 rounded-2xl border border-dashed border-black/15 dark:border-white/15 bg-black/[0.01] dark:bg-white/[0.01] space-y-2">
        <span className="text-[11px] font-semibold opacity-70 block">
          + {language === 'bn' ? 'কনটেন্ট ব্লক যোগ করুন' : 'Add Content Block'}:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addBlock('text')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-xs font-semibold cursor-pointer"
          >
            <Type className="w-3.5 h-3.5" />
            {language === 'bn' ? 'টেক্সট' : 'Text'}
          </button>
          <button
            type="button"
            onClick={() => addBlock('heading')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-xs font-semibold cursor-pointer"
          >
            <Heading className="w-3.5 h-3.5" />
            {language === 'bn' ? 'শিরোনাম' : 'Heading'}
          </button>
          <button
            type="button"
            onClick={() => addBlock('quote')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-xs font-semibold cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" />
            {language === 'bn' ? 'উদ্ধৃতি / আয়াত' : 'Quote / Ayah'}
          </button>
          <button
            type="button"
            onClick={() => addBlock('image')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-xs font-semibold cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {language === 'bn' ? 'ছবি' : 'Image'}
          </button>
          <button
            type="button"
            onClick={() => addBlock('youtube')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-xs font-semibold cursor-pointer"
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            {language === 'bn' ? 'ভিডিও' : 'Video'}
          </button>
          <button
            type="button"
            onClick={() => addBlock('divider')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition text-xs font-semibold cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
            {language === 'bn' ? 'ডিভাইডার' : 'Divider'}
          </button>
        </div>
      </div>
    </div>
  );
};
