import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', children, className = '', ...props }: ButtonProps) => {
  const baseStyles = "px-6 py-2 rounded-[12px] font-semibold transition-all duration-200 text-sm cursor-pointer inline-flex items-center justify-center";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary/5",
    danger: "bg-accent text-white hover:bg-accent/90"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};