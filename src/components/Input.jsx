import React from 'react';

const Input = React.forwardRef(({ className, type, icon: Icon, ...props }, ref) => {
  const iconElement = Icon ? (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
      <Icon size={18} />
    </div>
  ) : null;

  return (
    <div className="relative group">
      {iconElement}
      <input
        type={type}
        className={`w-full ${Icon ? 'pl-12' : 'px-6'} pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-medium ${className}`}
        ref={ref}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;