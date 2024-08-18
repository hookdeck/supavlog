import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  type?: "primary";
  children: React.ReactNode;
  className?: string;
};

export default function Button({
  children,
  type,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`py-2 px-4 rounded-md no-underline text-foreground ${
        type === "primary"
          ? "bg-blue-700"
          : "bg-btn-background hover:bg-btn-background-hover"
      } flex items-center group text-sm w-fit ${
        props.disabled && "bg-red-600"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
