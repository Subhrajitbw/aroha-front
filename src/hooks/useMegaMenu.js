// src/hooks/useMegaMenu.js
import { useState, useMemo, useCallback, useRef } from "react";

export const useMegaMenu = (navItems, megaMenuContent) => {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [caretPosition, setCaretPosition] = useState(null);
  
  const contentWrapperRef = useRef(null);
  const shopButtonRef = useRef(null);
  const megaMenuRef = useRef(null);

  const aggregatedMegaContent = useMemo(() => {
    const columns = [];
    const allFeatured = [];

    navItems.forEach((parentItem) => {
      const parentContent = megaMenuContent[parentItem.href];
      if (!parentContent) return;

      const subcategories = [];

      if (parentContent.columns) {
        parentContent.columns.forEach((childColumn) => {
          subcategories.push({
            name: childColumn.title,
            href: childColumn.href,
          });

          if (childColumn.items && subcategories.length < 5) {
            const remaining = 5 - subcategories.length;
            subcategories.push(...childColumn.items.slice(0, remaining));
          }
        });
      }

      columns.push({
        title: parentItem.name,
        href: parentItem.href,
        items: subcategories.slice(0, 5),
      });

      if (parentContent.featured) {
        allFeatured.push(...parentContent.featured);
      }
    });

    return {
      columns,
      featured: allFeatured.slice(0, 3),
    };
  }, [navItems, megaMenuContent]);

  const calculateCaretPosition = useCallback((event) => {
    if (!contentWrapperRef.current || !shopButtonRef.current) return;

    const wrapperBounds = contentWrapperRef.current.getBoundingClientRect();
    const btnBounds = shopButtonRef.current.getBoundingClientRect();

    const btnCenter = btnBounds.left + btnBounds.width / 2;
    const positionInPx = btnCenter - wrapperBounds.left;

    const positionInPercent = Math.max(
      5,
      Math.min(95, (positionInPx / wrapperBounds.width) * 100)
    );

    setCaretPosition(positionInPercent);
  }, []);

  const handleChevronHover = useCallback(
    (event) => {
      if (window.matchMedia("(hover: hover)").matches) {
        setMegaMenuOpen(true);
        calculateCaretPosition(event);
      }
    },
    [calculateCaretPosition]
  );

  const handleNavAreaLeave = useCallback((event) => {
    const relatedTarget = event.relatedTarget;

    if (!relatedTarget) {
      setMegaMenuOpen(false);
      return;
    }

    if (megaMenuRef.current?.contains(relatedTarget)) {
      return;
    }

    if (event.currentTarget?.contains(relatedTarget)) {
      return;
    }

    setMegaMenuOpen(false);
  }, []);

  const closeMegaMenu = useCallback(() => {
    setMegaMenuOpen(false);
  }, []);

  return {
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
  };
};
