// lib/dynamic-imports.ts
import React from 'react';
import dynamic from 'next/dynamic';

// Simple loading component
const LoadingDiv = () => 
  React.createElement('div', { className: 'animate-pulse bg-gray-200 h-64 rounded' });

// Heavy components that should be loaded dynamically
export const DynamicRecharts = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), {
  loading: LoadingDiv,
  ssr: false,
});

export const DynamicSyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then(mod => mod.Prism),
  {
    loading: LoadingDiv,
    ssr: false,
  }
);

export const DynamicMarkdown = dynamic(() => import('react-markdown'), {
  loading: LoadingDiv,
  ssr: false,
});

export const DynamicQRCode = dynamic(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG || mod })), {
  loading: LoadingDiv,
  ssr: false,
});

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