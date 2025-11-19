import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({ 
  label, 
  error, 
  helper, 
  variant = 'default',
  size = 'md',
  className = '',
  required = false,
  ...props 
}, ref) => {
  const baseClasses = 'w-full transition-all duration-300 focus:outline-none focus:ring-2';
  
  const variants = {
    default: 'bg-white border border-gray-300 text-gray-900 focus:ring-[#00b9ae] focus:border-[#00b9ae] placeholder-gray-500',
    dark: 'bg-[#3730a3] border border-gray-600 text-white placeholder-gray-400 focus:ring-[#00b9ae] focus:border-[#00b9ae]'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-5 py-4 text-lg rounded-xl'
  };
  
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${errorClasses} ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-2 ${variant === 'dark' ? 'text-white' : 'text-gray-700'}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={classes}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className={`mt-2 text-sm ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helper: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'dark']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  required: PropTypes.bool
};

export default Input;
