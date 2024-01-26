import Link, { LinkProps } from "next/link";
import Button from "./Button";

export interface LinkButtonProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  arrow?: "left" | "right";
}

export default function LinkButton({
  children,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={`w-fit ${className}`} {...props}>
      <Button>
        {props.arrow === "left" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        )}
        {children}
        {props.arrow === "right" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </Button>
    </Link>
  );
}
