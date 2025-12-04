import React from 'react';

interface ErrorMessageProps {
  error: Error | null;
  isUsingFallback?: boolean;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  isUsingFallback = false, 
  onRetry,
  className = '' 
}) => {
  if (!error) return null;

  return (
    <div className={`flex justify-center items-center min-h-64 ${className}`}>
      <div className="text-center">
        <div className="text-lg text-red-600 mb-4">
          資料載入失敗: {error.message}
        </div>
        {isUsingFallback && (
          <div className="text-sm text-gray-500 mb-4">使用本地數據</div>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重試
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
