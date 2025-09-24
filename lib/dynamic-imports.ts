// lib/dynamic-imports.ts
import dynamic from 'next/dynamic';

// Minimal loading
const Loading = () => null;

// Lazy load heavy components only when needed
export const DynamicRecharts = dynamic(() => import('recharts'), {
  loading: Loading,
  ssr: false,
});

export const DynamicSyntaxHighlighter = dynamic(() => import('react-syntax-highlighter'), {
  loading: Loading,
  ssr: false,
});

export const DynamicMarkdown = dynamic(() => import('react-markdown'), {
  loading: Loading,
  ssr: false,
});

// Load only when actually used
export const loadSocketIO = () => import('socket.io-client');
export const loadFramerMotion = () => import('framer-motion');
export const loadQRCode = () => import('qrcode.react');




