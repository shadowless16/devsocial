// lib/dynamic-imports.ts
import dynamic from 'next/dynamic';

// Heavy components that should be loaded dynamically
export const DynamicRecharts = dynamic(() => import('recharts'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded" />,
  ssr: false,
});

export const DynamicSyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then(mod => mod.Prism),
  {
    loading: () => <div className="animate-pulse bg-gray-100 h-32 rounded" />,
    ssr: false,
  }
);

export const DynamicMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <div className="animate-pulse bg-gray-100 h-24 rounded" />,
  ssr: false,
});

export const DynamicQRCode = dynamic(() => import('qrcode.react'), {
  loading: () => <div className="animate-pulse bg-gray-100 w-32 h-32 rounded" />,
  ssr: false,
});

// 3D components (if used)
export const Dynamic3DViewer = dynamic(
  () => import('@react-three/fiber').then(mod => mod.Canvas),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded" />,
    ssr: false,
  }
);

// Avatar creator (heavy component)
export const DynamicAvatarCreator = dynamic(
  () => import('@readyplayerme/react-avatar-creator'),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded" />,
    ssr: false,
  }
);

// Socket.io client (only load when needed)
export const loadSocketIO = () => {
  return import('socket.io-client');
};

// Framer Motion (only load when animations are needed)
export const DynamicMotion = {
  div: dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
    ssr: false,
  }),
  span: dynamic(() => import('framer-motion').then(mod => mod.motion.span), {
    ssr: false,
  }),
};