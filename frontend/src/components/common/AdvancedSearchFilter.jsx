import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  User,
  MapPin,
  Heart,
  Activity,
  Trash2,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const AdvancedSearchFilter = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  filterConfig,
  resultsCount,
  totalCount,
  placeholder = "Search...",
  className = "",
  showFilterCount = true,
  onReset,
  customActions = []
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Count active filters
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== '';
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = useCallback((filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = Object.keys(filters).reduce((acc, key) => {
      const config = filterConfig.find(f => f.key === key);
      if (config?.type === 'multiselect' || config?.type === 'tags') {
        acc[key] = [];
      } else {
        acc[key] = '';
      }
      return acc;
    }, {});
    onFiltersChange(resetFilters);
    if (onReset) onReset();
  }, [filters, filterConfig, onFiltersChange, onReset]);

  const renderFilterInput = (config) => {
    const value = filters[config.key] || (config.type === 'multiselect' || config.type === 'tags' ? [] : '');

    switch (config.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(config.key, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">{config.placeholder || `All ${config.label}`}</option>
            {config.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {config.options.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...value, option.value]
                      : value.filter(v => v !== option.value);
                    handleFilterChange(config.key, newValue);
                  }}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder={config.minPlaceholder || "Min"}
              value={value.min || ''}
              onChange={(e) => handleFilterChange(config.key, { ...value, min: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <input
              type="number"
              placeholder={config.maxPlaceholder || "Max"}
              value={value.max || ''}
              onChange={(e) => handleFilterChange(config.key, { ...value, max: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(config.key, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case 'daterange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              placeholder="From"
              value={value.from || ''}
              onChange={(e) => handleFilterChange(config.key, { ...value, from: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <input
              type="date"
              placeholder="To"
              value={value.to || ''}
              onChange={(e) => handleFilterChange(config.key, { ...value, to: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            placeholder={config.placeholder}
            value={value}
            onChange={(e) => handleFilterChange(config.key, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case 'tags':
        const availableTags = config.options || [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {value.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                >
                  {tag}
                  <button
                    onClick={() => {
                      const newValue = value.filter((_, i) => i !== index);
                      handleFilterChange(config.key, newValue);
                    }}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {availableTags.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value && !value.includes(e.target.value)) {
                    handleFilterChange(config.key, [...value, e.target.value]);
                    e.target.value = '';
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Add tag...</option>
                {availableTags.map(tag => (
                  <option key={tag.value} value={tag.value} disabled={value.includes(tag.value)}>
                    {tag.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getFilterIcon = (type) => {
    switch (type) {
      case 'date':
      case 'daterange':
        return Calendar;
      case 'range':
        return DollarSign;
      case 'tags':
        return Tag;
      case 'select':
        return Filter;
      default:
        return Filter;
    }
  };

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          {filterConfig && filterConfig.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors",
                showFilters
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", showFilters ? "rotate-180" : "")} />
            </button>
          )}

          {/* Reset Button */}
          {(searchTerm || activeFiltersCount > 0) && (
            <button
              onClick={() => {
                onSearchChange('');
                handleResetFilters();
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </button>
          )}

          {/* Custom Actions */}
          {customActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={cn(
                "inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium",
                action.variant === 'primary'
                  ? "border-transparent bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              )}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {showFilterCount && (
          <div className="text-sm text-gray-600">
            {resultsCount !== undefined && totalCount !== undefined ? (
              <>
                {resultsCount.toLocaleString()} of {totalCount.toLocaleString()} results
                {(searchTerm || activeFiltersCount > 0) && ` (filtered)`}
              </>
            ) : (
              'Loading...'
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && filterConfig && filterConfig.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filterConfig.map((config) => {
              const Icon = getFilterIcon(config.type);
              return (
                <div key={config.key} className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Icon className="h-4 w-4 mr-2 text-gray-400" />
                    {config.label}
                    {config.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderFilterInput(config)}
                  {config.description && (
                    <p className="text-xs text-gray-500">{config.description}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              {activeFiltersCount > 0 && (
                <span>{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleResetFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                disabled={activeFiltersCount === 0}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Predefined filter configurations for common use cases
export const filterConfigs = {
  patients: [
    {
      key: 'constitution',
      label: 'Constitution',
      type: 'select',
      options: [
        { value: 'vata', label: 'Vata' },
        { value: 'pitta', label: 'Pitta' },
        { value: 'kapha', label: 'Kapha' },
        { value: 'vata-pitta', label: 'Vata-Pitta' },
        { value: 'pitta-kapha', label: 'Pitta-Kapha' },
        { value: 'vata-kapha', label: 'Vata-Kapha' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      key: 'ageRange',
      label: 'Age Range',
      type: 'range',
      minPlaceholder: 'Min age',
      maxPlaceholder: 'Max age'
    },
    {
      key: 'lastVisit',
      label: 'Last Visit',
      type: 'daterange',
      description: 'Filter by last visit date range'
    },
    {
      key: 'practitioner',
      label: 'Preferred Practitioner',
      type: 'select',
      options: [
        { value: 'dr-sarah-smith', label: 'Dr. Sarah Smith' },
        { value: 'dr-raj-patel', label: 'Dr. Raj Patel' },
        { value: 'dr-maya-sharma', label: 'Dr. Maya Sharma' }
      ]
    },
    {
      key: 'allergies',
      label: 'Critical Allergies',
      type: 'select',
      options: [
        { value: 'none', label: 'No Critical Allergies' },
        { value: 'mild', label: 'Has Mild Allergies' },
        { value: 'severe', label: 'Has Severe Allergies' },
        { value: 'life-threatening', label: 'Life-threatening Allergies' }
      ]
    }
  ],

  bookings: [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no-show', label: 'No Show' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange'
    },
    {
      key: 'therapy',
      label: 'Therapy Type',
      type: 'select',
      options: [
        { value: 'abhyanga', label: 'Abhyanga' },
        { value: 'shirodhara', label: 'Shirodhara' },
        { value: 'panchakarma', label: 'Panchakarma' },
        { value: 'udvartana', label: 'Udvartana' }
      ]
    },
    {
      key: 'practitioner',
      label: 'Practitioner',
      type: 'select',
      options: [
        { value: 'dr-sarah-smith', label: 'Dr. Sarah Smith' },
        { value: 'dr-raj-patel', label: 'Dr. Raj Patel' },
        { value: 'dr-maya-sharma', label: 'Dr. Maya Sharma' }
      ]
    },
    {
      key: 'priceRange',
      label: 'Price Range',
      type: 'range',
      minPlaceholder: '$0',
      maxPlaceholder: '$500'
    }
  ],

  therapies: [
    {
      key: 'category',
      label: 'Category',
      type: 'multiselect',
      options: [
        { value: 'massage', label: 'Massage' },
        { value: 'detox', label: 'Detoxification' },
        { value: 'rejuvenation', label: 'Rejuvenation' },
        { value: 'stress-relief', label: 'Stress Relief' },
        { value: 'pain-management', label: 'Pain Management' }
      ]
    },
    {
      key: 'duration',
      label: 'Duration (minutes)',
      type: 'range',
      minPlaceholder: '30',
      maxPlaceholder: '180'
    },
    {
      key: 'price',
      label: 'Price Range',
      type: 'range',
      minPlaceholder: '$50',
      maxPlaceholder: '$300'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'draft', label: 'Draft' }
      ]
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'tags',
      options: [
        { value: 'popular', label: 'Popular' },
        { value: 'seasonal', label: 'Seasonal' },
        { value: 'beginner-friendly', label: 'Beginner Friendly' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'couples', label: 'Couples' }
      ]
    }
  ]
};

export default AdvancedSearchFilter;