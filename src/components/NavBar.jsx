// src/components/NavBar.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useSearchStore } from "../stores/searchStore";
import { useAuthModalStore } from "../stores/useAuthModalStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useMenuStore } from "../stores/useMenuStore";

import MobileMenu from "./MobileMenu";
import MegaMenu from "./nav/MegaMenu";
import { NavLeft } from "./nav/NavLeft";
import { NavRight } from "./nav/NavRight";
import { NavLogo } from "./nav/NavLogo";

import { useNavScroll } from "../hooks/useNavScroll";
import { useNavAnimations } from "../hooks/useNavAnimations";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useNavigationData } from "../hooks/useNavigationData";
import { useMegaMenu } from "../hooks/useMegaMenu";
import { useNavTheme } from "../hooks/useNavTheme";

import {
  getNavColors,
  getFloatingStyles,
  getFloatingPosition,
} from "../utils/navThemeStyles";

const NavBar = ({ variant = "light", isMobile, isNotDesktop }) => {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const iconsRef = useRef([]);
  const chevronRef = useRef(null);

  // Stores
  const { isOpen: menuOpen, toggle: toggleMenu, close: closeMenu } =
    useMenuStore();
  const { open: openSearch } = useSearchStore();
  const { open: openAuth } = useAuthModalStore();
  const { isAuthenticated, user, clearAuth, initializeAuth } = useAuthStore();

  const location = useLocation();
  const navigate = useNavigate();

  // Custom hooks
  const { navItems, megaMenuContent } = useNavigationData();
  const {
    megaMenuOpen,
    setMegaMenuOpen,
    caretPosition,
    aggregatedMegaContent,
    handleChevronHover,
    handleNavAreaLeave,
    closeMegaMenu,
    contentWrapperRef,
    shopButtonRef,
    megaMenuRef,
  } = useMegaMenu(navItems, megaMenuContent);

  const { navTheme, colorAnalysis } = useNavTheme(
    variant,
    navRef,
    isMobile,
    location,
    megaMenuOpen
  );

  useNavScroll(navRef, logoRef, scrolled, variant === "dark");
  useNavAnimations(navRef, logoRef, iconsRef);
  useKeyboardShortcuts(openSearch);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Prevent body scroll when mega menu is open
  useEffect(() => {
    if (megaMenuOpen && !isMobile) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [megaMenuOpen, isMobile]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShopClick = (event) => {
    event.preventDefault();
    setMegaMenuOpen(false);
    navigate("/shop");
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return "User";
  };

  // Computed styles
  const colors = useMemo(
    () => getNavColors(scrolled, navTheme),
    [scrolled, navTheme]
  );

  const floatingStyles = useMemo(
    () => getFloatingStyles(scrolled, navTheme, colorAnalysis),
    [scrolled, navTheme, colorAnalysis]
  );

  const floatingPosition = useMemo(
    () => getFloatingPosition(scrolled, isMobile),
    [scrolled, isMobile]
  );

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed z-50 transition-all duration-400 ${floatingPosition} ${
          scrolled ? "rounded-2xl shadow-md" : ""
        } px-3 lg:px-4 py-1`}
        style={floatingStyles}
        onMouseLeave={handleNavAreaLeave}
        data-theme={navTheme}
        data-analysis={colorAnalysis ? JSON.stringify(colorAnalysis) : null}
      >
        <div
          ref={contentWrapperRef}
          className="mx-auto flex items-center justify-between relative max-w-7xl"
        >
          {/* Left Section */}
          <div className="flex-1 flex items-center gap-4 lg:gap-8">
            <NavLeft
              isMobile={isMobile}
              colors={colors}
              menuOpen={menuOpen}
              toggleMenu={toggleMenu}
              iconsRef={iconsRef}
              shopButtonRef={shopButtonRef}
              chevronRef={chevronRef}
              megaMenuOpen={megaMenuOpen}
              handleShopClick={handleShopClick}
              handleChevronHover={handleChevronHover}
              closeMegaMenu={closeMegaMenu}
            />
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NavLogo
              logoRef={logoRef}
              colors={colors}
              closeMegaMenu={closeMegaMenu}
            />
          </div>

          {/* Right Section */}
          <div className="flex-1 flex justify-end items-center">
            <NavRight
              colors={colors}
              openSearch={openSearch}
              iconsRef={iconsRef}
            />
          </div>
        </div>

        {/* Mega Menu */}
        {!isMobile && (
          <MegaMenu
            ref={megaMenuRef}
            isOpen={megaMenuOpen}
            content={aggregatedMegaContent}
            caretPosition={caretPosition}
            onClose={closeMegaMenu}
            onMouseLeave={handleNavAreaLeave}
          />
        )}
      </nav>

      {/* Mobile Menu */}
      {isNotDesktop && (
        <MobileMenu
          isOpen={menuOpen}
          onClose={closeMenu}
          onAuthOpen={openAuth}
          categories={navItems}
          megaMenuContent={megaMenuContent}
          isLoggedIn={isAuthenticated}
          user={
            user
              ? {
                  name: getUserDisplayName(),
                  email: user.email,
                  username: user.username,
                  isEmailVerified: user.isEmailVerified,
                  authType: user.authType,
                }
              : null
          }
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default NavBar;
