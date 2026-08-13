import React, { forwardRef } from "react";

type InputProps = (React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) & {
  textarea?: boolean;
  label?: string;
  id?: string;
  className?: string;
};

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(function Input({ textarea = false, label, id, className = "", ...props }, ref) {
  if (textarea) {
    return (
      <div>
        {label && <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>}
        <textarea id={id} ref={ref as React.Ref<HTMLTextAreaElement>} className={["w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500", className].join(" ")} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      </div>
    );
  }

  return (
    <div>
      {label && <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>}
      <input id={id} ref={ref as React.Ref<HTMLInputElement>} className={["w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500", className].join(" ")} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
    </div>
  );
});

export default Input;
