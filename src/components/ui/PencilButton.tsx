import React from 'react';

interface PencilButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'rose' | 'pink' | 'sage' | 'olive' | 'gold' | 'graphite' | 'paper';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const PencilButton: React.FC<PencilButtonProps> = ({
  variant = 'rose',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    rose: 'bg-pencil-rose text-paper-white hover:bg-[#b8646b]',
    pink: 'bg-pencil-pink text-pencil-dark hover:bg-[#d09196]',
    sage: 'bg-pencil-sage text-pencil-dark hover:bg-[#97a888]',
    olive: 'bg-pencil-olive text-paper-white hover:bg-[#7a8865]',
    gold: 'bg-pencil-gold text-pencil-dark hover:bg-[#d1b068]',
    graphite: 'bg-pencil-graphite text-paper-white hover:bg-[#4d423d]',
    paper: 'bg-paper-white text-pencil-graphite hover:bg-[#f2ecde]',
  }[variant];

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm font-hand tracking-wide',
    md: 'px-5 py-2.5 text-base font-hand tracking-wide',
    lg: 'px-7 py-3.5 text-lg font-hand tracking-wide font-bold',
  }[size];

  return (
    <button
      className={`sketch-btn inline-flex items-center justify-center gap-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
