import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { img: 'h-8 w-8', text: 'text-lg' },
    md: { img: 'h-12 w-12', text: 'text-2xl' },
    lg: { img: 'h-16 w-16', text: 'text-3xl' },
    xl: { img: 'h-20 w-20', text: 'text-4xl' }
  };
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="/logo.png" 
        alt="DCIAFRICA Logo" 
        className={sizes[size].img}
        loading="lazy" 
      />
      {showText && (
        <span className={`${sizes[size].text} font-bold bg-gradient-to-r from-[#fbbf24] to-[#00b9ae] bg-clip-text text-transparent`}>
          DCIAFRICA
        </span>
      )}
    </div>
  );
};

Logo.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showText: PropTypes.bool,
  className: PropTypes.string
};

export default Logo;
