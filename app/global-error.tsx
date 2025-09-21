'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Animated Error Icon */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-500/30">
              <svg 
                className="w-12 h-12 text-red-400 animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            {/* Glowing rings */}
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-red-500/30 animate-ping"></div>
            <div className="absolute inset-2 w-20 h-20 mx-auto rounded-full border border-red-400/20 animate-pulse"></div>
          </div>

          {/* Error Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Oops! Something Went Wrong
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              We encountered an unexpected error. Don't worry, our team has been notified and we're working on fixing it.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-red-900/30 rounded-lg border border-red-700/30 text-left">
                <h3 className="text-red-300 font-semibold mb-2 text-sm">Error Details:</h3>
                <p className="text-red-200 text-xs font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-red-200/70 text-xs mt-2">
                    ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => reset()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go Home
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-gray-400 text-sm mt-6">
            If this problem persists, please contact our support team.
          </p>
        </div>

        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </body>
    </html>
  )
}