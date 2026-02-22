import { useState, useCallback } from 'react';

/**
 * Custom hook for handling async operations with loading states and error handling
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} - { execute, loading, error, data, reset }
 */
export const useAsyncOperation = (asyncFunction, options = {}) => {
  const {
    initialLoading = false,
    onSuccess = null,
    onError = null,
    transformData = null,
  } = options;

  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
      
      // Transform data if transformer is provided
      const finalData = transformData ? transformData(result) : result;
      
      setData(finalData);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(finalData);
      }
      
      return finalData;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError({ message: errorMessage, originalError: err });
      
      // Call error callback if provided
      if (onError) {
        onError(err);
      }
      
      throw err; // Re-throw to allow caller to handle if needed
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, transformData, onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
};

/**
 * Hook for managing form submission states
 * @param {Function} submitFunction - The function to call on form submission
 * @param {Object} options - Configuration options
 * @returns {Object} - { handleSubmit, submitting, error, reset }
 */
export const useFormSubmit = (submitFunction, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    resetOnSuccess = true,
  } = options;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const result = await submitFunction(formData);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (resetOnSuccess) {
        setError(null);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit form';
      setError({ message: errorMessage, originalError: err });
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [submitFunction, onSuccess, onError, resetOnSuccess]);

  const reset = useCallback(() => {
    setSubmitting(false);
    setError(null);
  }, []);

  return {
    handleSubmit,
    submitting,
    error,
    reset,
  };
};

/**
 * Hook for managing data fetching with automatic retry functionality
 * @param {Function} fetchFunction - The function to fetch data
 * @param {Array} dependencies - Dependencies array for refetching
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, refetch, retry }
 */
export const useDataFetching = (fetchFunction, dependencies = [], options = {}) => {
  const {
    immediate = true,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }
      
      const result = await fetchFunction();
      setData(result);
      setRetryCount(0);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch data';
      setError({ message: errorMessage, originalError: err });
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, onSuccess, onError]);

  const retry = useCallback(async () => {
    if (retryCount < retryAttempts) {
      try {
        setRetryCount(prev => prev + 1);
        
        // Add delay before retry
        if (retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        
        await fetchData(true);
      } catch (err) {
        // If we've exhausted retry attempts, don't retry again
        if (retryCount + 1 >= retryAttempts) {
          console.error(`Failed after ${retryAttempts} retry attempts:`, err);
        }
      }
    }
  }, [fetchData, retryCount, retryAttempts, retryDelay]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    return fetchData();
  }, [fetchData]);

  // Auto-fetch on mount and dependency changes
  React.useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refetch,
    retry,
    canRetry: retryCount < retryAttempts,
    retryCount,
  };
};

/**
 * Hook for debouncing async operations
 * @param {Function} asyncFunction - The async function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Object} - { execute, loading, error, cancel }
 */
export const useDebouncedAsyncOperation = (asyncFunction, delay = 500) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  const execute = useCallback((...args) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        await asyncFunction(...args);
      } catch (err) {
        setError({ message: err.message || 'Operation failed', originalError: err });
      } finally {
        setLoading(false);
        setTimeoutId(null);
      }
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [asyncFunction, delay, timeoutId]);

  const cancel = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
      setLoading(false);
    }
  }, [timeoutId]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    execute,
    loading,
    error,
    cancel,
  };
};

/**
 * Hook for optimistic updates
 * @param {Function} updateFunction - The function that performs the update
 * @param {Function} rollbackFunction - The function to rollback on failure
 * @returns {Object} - { executeOptimistically, loading, error }
 */
export const useOptimisticUpdate = (updateFunction, rollbackFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeOptimistically = useCallback(async (optimisticUpdate, actualUpdate) => {
    try {
      setLoading(true);
      setError(null);
      
      // Apply optimistic update immediately
      if (optimisticUpdate) {
        optimisticUpdate();
      }
      
      // Perform actual update
      const result = await updateFunction(actualUpdate);
      
      return result;
    } catch (err) {
      // Rollback on error
      if (rollbackFunction) {
        rollbackFunction();
      }
      
      const errorMessage = err.message || 'Update failed';
      setError({ message: errorMessage, originalError: err });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateFunction, rollbackFunction]);

  return {
    executeOptimistically,
    loading,
    error,
  };
};