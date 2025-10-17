"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MentionText } from "@/components/ui/mention-text";

interface PostContentProps {
  content: string;
  onCopyCode?: (code: string) => void;
} 

export function PostContent({ content, onCopyCode }: PostContentProps) {
  const { toast } = useToast();

  const handleCopyCode = (codeContent: string) => {
    if (onCopyCode) {
      onCopyCode(codeContent);
    } else {
      navigator.clipboard.writeText(codeContent).then(() => {
        toast({
          title: "Copied to clipboard!",
          variant: "success",
        });
      }).catch(() => {
        toast({
          title: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
    }
  };

  // Auto-detect URLs in plain text and convert to markdown links
  const processContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => `[${url}](${url})`);
  };

  return (
    <ReactMarkdown
      components={{ 
        code({ node, className, children, ...props }: any) {
          const inline = !className;
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div className="relative my-4 rounded-lg overflow-hidden border border-gray-600">
              <div className="bg-gray-800 px-3 py-1 border-b border-gray-600 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium uppercase">{match[1]}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode(String(children).replace(/\n$/, ""));
                  }}
                  className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="overflow-hidden">
                <pre 
                  className="bg-gray-900 text-gray-100 p-2 rounded-none text-xs leading-relaxed overflow-hidden"
                  style={{
                    margin: 0,
                    padding: '0.5rem',
                    backgroundColor: '#0f172a',
                    fontSize: '10px',
                    lineHeight: '1.2',
                    minHeight: '40px',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'hidden',
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere',
                    overflow: 'hidden'
                  }}
                >
                  <code style={{ 
                    fontSize: '10px', 
                    wordBreak: 'break-all', 
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap',
                    display: 'block'
                  }}>{String(children).replace(/\n$/, "")}</code>
                </pre>
              </div>
            </div>
          ) : (
            <code className={`${className} bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          const textContent = React.Children.toArray(children).join('');
          return (
            <p className="text-gray-900 leading-relaxed mb-4 break-words overflow-wrap-anywhere whitespace-pre-wrap">
              <MentionText text={textContent} />
            </p>
          );
        },
        a({ href, children }) {
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
              <ExternalLink className="w-3 h-3" />
            </a>
          );
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-semibold text-gray-900 mb-2">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-gray-900">{children}</li>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">
              {children}
            </blockquote>
          );
        },
      }}
    >
      {processContent(content)}
    </ReactMarkdown>
  );
}
