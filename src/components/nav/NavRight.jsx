// src/components/nav/NavRight.jsx
import React from "react";
import { Search as SearchIcon } from "lucide-react";
import { NavIcon } from "./NavIcon";

export const NavRight = ({ colors, openSearch, iconsRef }) => {
  return (
    <NavIcon
      onClick={openSearch}
      className={`${colors.navTextColor} ${colors.navHoverColor}`}
      iconRef={(el) => (iconsRef.current[1] = el)}
    >
      <SearchIcon size={18} />
    </NavIcon>
  );
};
