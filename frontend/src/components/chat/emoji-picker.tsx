'use client';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EMOJI_LIST = ['👍', '❤️', '🎉', '🤔', '👏', '🔥', '💯', '✅'];

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex gap-1 z-10">
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
