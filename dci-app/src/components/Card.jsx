import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  variant = 'default',
  className = '',
  padding = 'md',
  hover = false,
  ...props 
}) => {
  const baseClasses = 'transition-all duration-300';
  
  const variants = {
    default: 'bg-white border border-gray-200 shadow-lg rounded-xl',
    dark: 'bg-[#00b9ae]/50 backdrop-blur-sm border border-[#00b9ae]/30 rounded-xl',
    glass: 'glass rounded-xl',
    elevated: 'bg-white shadow-xl rounded-xl border-0'
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'dark', 'glass', 'elevated']),
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  hover: PropTypes.bool
};

export default Card;
