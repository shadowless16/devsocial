// lib/lightweight-replacements.ts
// Lightweight replacements for heavy dependencies

// Replace heavy date-fns with minimal date utilities
export const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatRelativeTime = (date: Date | string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

// Replace heavy chart library with simple SVG charts
export const SimpleBarChart = ({ data, width = 300, height = 200 }: {
  data: { name: string; value: number }[];
  width?: number;
  height?: number;
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = width / data.length - 10;
  
  return (
    <svg width={width} height={height} className="border rounded">
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 40);
        const x = index * (barWidth + 10) + 5;
        const y = height - barHeight - 20;
        
        return (
          <g key={item.name}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="rgb(34, 197, 94)"
              className="hover:opacity-80"
            />
            <text
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
            >
              {item.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Replace heavy syntax highlighter with simple pre/code
export const SimpleSyntaxHighlighter = ({ 
  children, 
  language = 'javascript' 
}: { 
  children: string; 
  language?: string; 
}) => {
  return (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
      <code className={`language-${language} text-sm`}>
        {children}
      </code>
    </pre>
  );
};

// Replace heavy markdown with simple text formatting
export const SimpleMarkdown = ({ content }: { content: string }) => {
  // Basic markdown parsing (bold, italic, links, code)
  let html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
  
  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Replace heavy animation library with CSS animations
export const SimpleAnimation = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  slideOut: 'animate-out slide-out-to-bottom-4 duration-200',
};

// Simple loading spinner instead of heavy animation library
export const SimpleSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
  );
};