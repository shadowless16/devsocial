"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface UserLinkProps {
  username: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export function UserLink({ username, children, className = "", onClick, disabled = false }: UserLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (onClick) {
      onClick(e);
    }
    
    // Navigate to the user's profile page
    router.push(`/profile/${username}`);
  };
  
  if (disabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      type="button"
    >
      {children}
    </button>
  );
}
