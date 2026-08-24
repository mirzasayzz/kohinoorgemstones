import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search gemstones...", 
  initialValue = "",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          relative flex items-center transition-all duration-200
          ${isFocused 
            ? 'ring-2 ring-sapphire dark:ring-golden' 
            : 'ring-1 ring-gray-300 dark:ring-gray-600'
          }
          rounded-lg bg-white dark:bg-gray-700
        `}
      >
        {/* Search Icon */}
        <div className="absolute left-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-3 
            bg-transparent text-gray-900 dark:text-white 
            placeholder-gray-500 dark:placeholder-gray-400
            border-0 focus:outline-none focus:ring-0
            text-sm md:text-base
            rounded-lg
          `}
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </button>
        )}
      </div>

      {/* Mobile: Show search term count if applicable */}
      {searchTerm && (
        <div className="md:hidden mt-2 text-xs text-gray-500 dark:text-gray-400 px-1">
          Searching for "{searchTerm.slice(0, 20)}{searchTerm.length > 20 ? '...' : ''}"
        </div>
      )}
    </div>
  );
};

export default SearchBar; 