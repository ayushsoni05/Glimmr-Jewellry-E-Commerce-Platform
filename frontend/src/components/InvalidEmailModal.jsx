import { useState, useEffect } from 'react';

const InvalidEmailModal = ({ isOpen, error, message, suggestion, onClose, onAcceptSuggestion }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsClosing(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleAcceptSuggestion = () => {
    setIsClosing(true);
    setTimeout(() => {
      onAcceptSuggestion();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0-10a9 9 0 110 18 9 9 0 010-18z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-center text-gray-900 mb-4">
          Invalid Email Address
        </h3>

        {/* Error message */}
        <p className="text-center text-gray-700 mb-6 leading-relaxed">
          {message || error}
        </p>

        {/* Suggestion box (if applicable) */}
        {suggestion && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-gray-600 mb-2">Did you mean this instead?</p>
            <p className="text-blue-700 font-semibold font-mono">{suggestion}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>

          {suggestion && (
            <button
              onClick={handleAcceptSuggestion}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Use Suggestion
            </button>
          )}
        </div>

        {/* Helpful tips */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-2">💡 Tips:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ Use a permanent email address (not temporary)</li>
            <li>✓ Check for typos in the domain name</li>
            <li>✓ Common domains: gmail.com, yahoo.com, outlook.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvalidEmailModal;
