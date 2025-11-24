import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NavLinkProps {
  to: string;
  children: ReactNode;
}

export const NavLink = ({ to, children }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/');

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
};
