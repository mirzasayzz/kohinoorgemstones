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
      if (onSearch && searchTerm.trim()) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div 
          className={`
            relative flex items-center transition-all duration-200
            ${isFocused 
              ? 'ring-2 ring-luxury-gold/30 shadow-md' 
              : 'ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm'
            }
            rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          `}
        >
          {/* Search Icon */}
          <div className="absolute left-3 pointer-events-none">
            <Search className={`w-4 h-4 transition-colors duration-200 ${
              isFocused ? 'text-luxury-gold' : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 focus:outline-none focus:ring-0 text-sm rounded-lg"
          />

          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar; 