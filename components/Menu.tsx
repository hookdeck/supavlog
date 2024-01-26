"use client";

import { useState } from "react";
import Button from "./Button";
import LinkButton from "./LinkButton";

export type MenuItem = {
  text: string;
  href: string | null;
};

export default function Menu({ items }: { items: MenuItem[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menu = items?.map(({ text, href }, index) => {
    if (!href) {
      return <Button key={`nav-${index}`}>{text}</Button>;
    }
    return (
      <LinkButton key={`nav-${index}`} arrow="right" href={href}>
        {text}
      </LinkButton>
    );
  });
  return (
    <div className="pl-4 md:pl-0">
      <div className="md:hidden">
        <Button onClick={toggleMenu}>
          {isMenuOpen ? <span>▼</span> : <span>▶</span>}
        </Button>
      </div>
      <nav
        className={`flex flex-col md:flex-row py-2 md:py-0 gap-2 md:gap-4 w-fit md:w-full ${
          isMenuOpen ? "" : "hidden md:flex"
        } md:bg-transparent rounded-md md:rounded-none`}
      >
        {menu}
      </nav>
    </div>
  );
}
