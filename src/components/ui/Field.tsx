import { type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

const shell =
  "peer w-full rounded-xl border border-glow-mist/15 bg-abyss-900/50 px-5 pb-2.5 pt-6 text-white placeholder-transparent outline-none transition-all duration-500 focus:border-glow-cyan/60 focus:bg-abyss-900/70 focus:shadow-[0_0_30px_rgba(0,229,255,0.08)]";

const floatLabel =
  "pointer-events-none absolute left-5 top-2 font-mono text-[9px] uppercase tracking-widest2 text-glow-mist/70 transition-all duration-300 peer-placeholder-shown:top-4.5 peer-placeholder-shown:translate-y-0.5 peer-placeholder-shown:font-body peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:font-mono peer-focus:text-[9px] peer-focus:uppercase peer-focus:tracking-widest2 peer-focus:text-glow-cyan";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Field({ label, className, id, ...props }: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cn("relative", className)}>
      <input id={fieldId} placeholder=" " className={shell} data-cursor="hover" {...props} />
      <label htmlFor={fieldId} className={floatLabel}>
        {label}
      </label>
    </div>
  );
}

interface AreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextArea({ label, className, id, ...props }: AreaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cn("relative", className)}>
      <textarea
        id={fieldId}
        placeholder=" "
        className={cn(shell, "min-h-[140px] resize-y")}
        data-cursor="hover"
        {...props}
      />
      <label htmlFor={fieldId} className={floatLabel}>
        {label}
      </label>
    </div>
  );
}
