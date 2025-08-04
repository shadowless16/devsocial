"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
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
                  className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="!bg-gray-900 !m-0"
                customStyle={{
                  margin: 0,
                  padding: '1.25rem',
                  backgroundColor: '#0f172a',
                  borderRadius: '0',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  minHeight: '60px',
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={`${className} bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="text-gray-900 leading-relaxed mb-4">{children}</p>;
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
      {content}
    </ReactMarkdown>
  );
}
