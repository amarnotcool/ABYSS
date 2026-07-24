import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMagnetic } from "@/hooks/useMagnetic";

const base =
  "btn-primary group relative inline-flex items-center justify-center gap-3 rounded-full font-body text-sm tracking-[0.18em] uppercase transition-all duration-500 focus-visible:outline-glow-cyan disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-gradient-to-r from-abyss-600 to-abyss-700 text-glow-ice border border-glow-mist/25 shadow-[0_0_35px_rgba(0,229,255,0.15)] hover:shadow-[0_0_55px_rgba(0,229,255,0.35)] hover:border-glow-cyan/50",
  ghost:
    "border border-slate-400/25 text-slate-200 hover:border-glow-cyan/60 hover:text-glow-ice hover:shadow-[0_0_30px_rgba(0,229,255,0.12)]",
  glow:
    "bg-glow-cyan/10 text-glow-cyan border border-glow-cyan/40 hover:bg-glow-cyan/20 shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:shadow-[0_0_60px_rgba(0,229,255,0.4)]",
};

const sizes = {
  md: "px-7 py-3",
  lg: "px-10 py-4 text-base",
  sm: "px-5 py-2 text-xs",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, _ref) => {
    const magnet = useMagnetic<HTMLButtonElement>(0.25);
    return (
      <button
        ref={magnet}
        data-cursor="hover"
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({
  to,
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonLinkProps) {
  const magnet = useMagnetic<HTMLAnchorElement>(0.25);
  return (
    <Link
      to={to}
      ref={magnet}
      data-cursor="hover"
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
