import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  className = "",
  isOpen,
  onToggle
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    purpose: false,
    color: false
  });

  // Filter options matching database enum values
  const filterOptions = {
    category: [
      'Ruby', 'Emerald', 'Diamond', 'Sapphire', 'Pearl', 
      'Topaz', 'Coral', 'Turquoise', 'Onyx', 'Aqeeq', 
      'Moonstone', 'Zircon', 'Opal', 'Tourmaline', 'Garnet', 'Other'
    ],
    purpose: [
      'Love', 'Health', 'Wealth', 'Protection', 'Spiritual Growth', 
      'Success', 'Peace', 'Wisdom'
    ],
    color: [
      'Red', 'Blue', 'Green', 'Yellow', 'White', 'Black',
      'Pink', 'Purple', 'Orange', 'Clear', 'Multi-Color'
    ]
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    let newValues;

    if (currentValues.includes(value)) {
      // Remove filter
      newValues = currentValues.filter(item => item !== value);
    } else {
      // Add filter
      newValues = [...currentValues, value];
    }

    onFiltersChange({
      ...filters,
      [filterType]: newValues
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => {
      return count + (Array.isArray(filterArray) ? filterArray.length : 0);
    }, 0);
  };

  const FilterSection = ({ title, filterType, options, icon }) => (
    <div className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
      <button
        onClick={() => toggleSection(filterType)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
          {filters[filterType]?.length > 0 && (
            <span className="bg-luxury-gold text-luxury-charcoal text-xs px-2 py-0.5 rounded-full">
              {filters[filterType].length}
            </span>
          )}
        </div>
        {expandedSections[filterType] ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {expandedSections[filterType] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2 bg-gray-50 dark:bg-gray-700/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {options.map((option) => {
                  const isSelected = filters[filterType]?.includes(option);
                  return (
                    <label
                      key={option}
                      className={`
                        flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'bg-luxury-gold/10 border-2 border-luxury-gold text-luxury-gold dark:text-luxury-gold dark:border-luxury-gold dark:bg-luxury-gold/10' 
                          : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFilterChange(filterType, option)}
                        className="hidden"
                      />
                      <span className="text-sm font-medium break-words">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Mobile Slide-up Panel
  const MobileFilterPanel = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-sapphire dark:text-golden" />
                <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                  Filter Gemstones
                </h2>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-sapphire text-white text-sm px-2 py-1 rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
              <FilterSection 
                title="Category" 
                filterType="category" 
                options={filterOptions.category}
                icon={<div className="w-2 h-2 bg-luxury-emerald rounded-full" />}
              />
              <FilterSection 
                title="Purpose" 
                filterType="purpose" 
                options={filterOptions.purpose}
                icon={<div className="w-2 h-2 bg-luxury-gold rounded-full" />}
              />
              <FilterSection 
                title="Color" 
                filterType="color" 
                options={filterOptions.color}
                icon={<div className="w-2 h-2 bg-luxury-ruby rounded-full" />}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex space-x-3">
              <button
                onClick={onClearFilters}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onToggle}
                className="flex-1 btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Desktop Sidebar
  const DesktopFilterPanel = () => (
    <div className={`hidden md:block ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-luxury-gold dark:text-luxury-gold" />
            <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
            {getActiveFilterCount() > 0 && (
              <span className="bg-luxury-gold text-luxury-charcoal text-sm px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          {getActiveFilterCount() > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <FilterSection 
          title="Category" 
          filterType="category" 
          options={filterOptions.category}
          icon={<div className="w-2 h-2 bg-luxury-emerald rounded-full" />}
        />
        <FilterSection 
          title="Purpose" 
          filterType="purpose" 
          options={filterOptions.purpose}
          icon={<div className="w-2 h-2 bg-luxury-gold rounded-full" />}
        />
        <FilterSection 
          title="Color" 
          filterType="color" 
          options={filterOptions.color}
          icon={<div className="w-2 h-2 bg-luxury-ruby rounded-full" />}
        />
      </div>
    </div>
  );

  return (
    <>
      <MobileFilterPanel />
      <DesktopFilterPanel />
    </>
  );
};

export default FilterPanel; 