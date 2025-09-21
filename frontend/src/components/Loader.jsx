export default function Loader({ 
  size = "medium", 
  variant = "spinner",
  message = "Loading..." 
}) {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };

  // Spinner variant
  if (variant === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className={`${sizeClasses[size]} 
                        border-4 border-[#A020F0] border-t-transparent 
                        rounded-full animate-spin mb-4`}>
        </div>
        {message && <p className="text-gray-600 text-center">{message}</p>}
      </div>
    );
  }

  // Dots variant
  if (variant === "dots") {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="flex space-x-2 mb-4">
          <div className={`${sizeClasses.small} bg-[#A020F0] rounded-full animate-bounce`} 
               style={{ animationDelay: '0s' }}></div>
          <div className={`${sizeClasses.small} bg-[#A020F0] rounded-full animate-bounce`} 
               style={{ animationDelay: '0.1s' }}></div>
          <div className={`${sizeClasses.small} bg-[#A020F0] rounded-full animate-bounce`} 
               style={{ animationDelay: '0.2s' }}></div>
        </div>
        {message && <p className="text-gray-600 text-center">{message}</p>}
      </div>
    );
  }

  // Pulse variant (default)
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className={`${sizeClasses[size]} 
                      bg-[#A020F0] rounded-full 
                      animate-pulse mb-4`}>
      </div>
      {message && <p className="text-gray-600 text-center">{message}</p>}
    </div>
  );
}