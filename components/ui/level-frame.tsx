"use client"

interface LevelFrameProps {
  level: number;
  children: React.ReactNode;
  className?: string;
}

export function LevelFrame({ level, children, className = "" }: LevelFrameProps) {
  const getFrameStyle = () => {
    if (level >= 50) return "ring-4 ring-purple-500 shadow-lg shadow-purple-500/50";
    if (level >= 30) return "ring-4 ring-yellow-500 shadow-lg shadow-yellow-500/50";
    if (level >= 15) return "ring-4 ring-blue-500 shadow-lg shadow-blue-500/50";
    if (level >= 5) return "ring-4 ring-green-500 shadow-lg shadow-green-500/50";
    return "ring-2 ring-gray-400";
  };

  const getGlowAnimation = () => {
    if (level >= 30) return "animate-pulse";
    return "";
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`rounded-full ${getFrameStyle()} ${getGlowAnimation()}`}>
        {children}
      </div>
      {level >= 50 && (
        <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          ⭐
        </div>
      )}
    </div>
  );
}
