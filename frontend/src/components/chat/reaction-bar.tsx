'use client';

interface ChatReaction {
  emoji: string;
  users: string[];
}

interface ReactionBarProps {
  reactions: ChatReaction[];
  onReact: (emoji: string) => void;
  currentUserId: string;
}

export function ReactionBar({ reactions, onReact, currentUserId }: ReactionBarProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction, i) => (
        <button
          key={i}
          onClick={() => onReact(reaction.emoji)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
            reaction.users.includes(currentUserId)
              ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{reaction.emoji}</span>
          <span className="text-gray-600 dark:text-gray-400">{reaction.users.length}</span>
        </button>
      ))}
    </div>
  );
}
