import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import { gsap } from "gsap";
import LookbookProductSection from "../components/LookbookProductSection";
import { sdk } from "../lib/medusaClient";

const Lookbook = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isShowSingle, setIsShowIsSingle] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isHoveringProduct, setIsHoveringProduct] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const gridRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorTextRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const navigate = useNavigate();

  const close = () => setIsShowIsSingle(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 1. Fetch Products
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const result = await sdk.client.fetch("/store/products");
        const rawProducts = result.products || result || [];
        const mappedProducts = rawProducts.map(p => ({
          _id: p.id,
          name: p.title,
          images: [p.thumbnail || (p.images?.length ? p.images[0].url : "") || "https://placehold.co/600x800"],
          handle: p.handle,
          originalData: p,
        }));

        let filledProducts = [...mappedProducts];
        while (filledProducts.length > 0 && filledProducts.length < 30) {
          filledProducts = [...filledProducts, ...mappedProducts];
        }
        
        if (isMounted) {
          setProducts(filledProducts.slice(0, 30));
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // 2. Desktop Mouse Interactions
  useEffect(() => {
    if (isMobile) return; // Skip on mobile

    const pageElement = document.documentElement;
    if (pageElement) pageElement.setAttribute("data-wf-page", "62c3453c8232198387a52aa4");
    if (window.Webflow) {
      window.Webflow.ready();
      if (window.Webflow.require("ix2")) window.Webflow.require("ix2").init();
    }
    document.dispatchEvent(new Event("readystatechange"));

    const handleMouseMove = (e) => {
      // Smooth cursor movement
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          left: e.clientX,
          top: e.clientY,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true
        });
      }

      // Smooth grid parallax
      if (gridRef.current) {
        const gridItems = gridRef.current.querySelectorAll(".lookbook-item");
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const distMultiX = (e.clientX - centerX) / centerX;
        const distMultiY = (e.clientY - centerY) / centerY;

        gsap.to(gridItems, {
          duration: 0.8,
          x: distMultiX * -60,
          y: distMultiY * -60,
          ease: "power2.out",
          stagger: { amount: 0.05 },
          overwrite: "auto"
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  // 3. Mobile Touch Interactions
  useEffect(() => {
    if (!isMobile || !gridRef.current) return;

    const gridElement = gridRef.current;

    const handleTouchStart = (e) => {
      isDragging.current = false;
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
      
      // If moved more than 10px, consider it a drag
      if (deltaX > 10 || deltaY > 10) {
        isDragging.current = true;
      }

      // Smooth parallax on touch move
      const gridItems = gridElement.querySelectorAll(".lookbook-item");
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const distMultiX = (touch.clientX - centerX) / centerX;
      const distMultiY = (touch.clientY - centerY) / centerY;

      gsap.to(gridItems, {
        duration: 0.5,
        x: distMultiX * -40,
        y: distMultiY * -40,
        ease: "power2.out",
        stagger: { amount: 0.03 },
        overwrite: "auto"
      });
    };

    const handleTouchEnd = () => {
      // Reset position smoothly after touch ends
      if (gridElement) {
        const gridItems = gridElement.querySelectorAll(".lookbook-item");
        gsap.to(gridItems, {
          duration: 0.6,
          x: 0,
          y: 0,
          ease: "power2.out",
          stagger: { amount: 0.05 }
        });
      }
    };

    gridElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    gridElement.addEventListener("touchmove", handleTouchMove, { passive: true });
    gridElement.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      gridElement.removeEventListener("touchstart", handleTouchStart);
      gridElement.removeEventListener("touchmove", handleTouchMove);
      gridElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, products]);

  // 4. Show/Hide "View" text on hover (desktop only)
  useEffect(() => {
    if (isMobile) return;
    
    if (cursorTextRef.current) {
      gsap.to(cursorTextRef.current, {
        opacity: isHoveringProduct ? 1 : 0,
        scale: isHoveringProduct ? 1 : 0.8,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [isHoveringProduct, isMobile]);

  // Handle product click - navigate to product page
  const handleProductClick = (product, e) => {
    e.preventDefault();
    
    // On mobile, check if it was a drag
    if (isMobile && isDragging.current) {
      isDragging.current = false;
      return;
    }

    // Navigate to product page
    if (product.handle) {
      navigate(`/products/${product.handle}`);
    }
  };

  const renderProductItem = (product, i, columnKey) => (
    <div 
      key={`${product._id}-${columnKey}-${i}`} 
      role="listitem" 
      className="lookbook-item w-dyn-item cursor-pointer"
      onMouseEnter={() => !isMobile && setIsHoveringProduct(true)}
      onMouseLeave={() => !isMobile && setIsHoveringProduct(false)}
    >
      <a 
        className="cursor-pointer lookbook-item-link w-inline-block" 
        onClick={(e) => handleProductClick(product, e)}
        style={{ 
          cursor: isMobile ? 'pointer' : 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <img 
          src={product.images[0]} 
          loading="eager" 
          alt={product.name} 
          className="lookbook-item-image"
          draggable="false"
          style={{
            userSelect: 'none',
            WebkitUserDrag: 'none'
          }}
        />
      </a>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="global-styles w-embed">
        <style dangerouslySetInnerHTML={{
            __html: `
              * {
                -webkit-tap-highlight-color: transparent;
              }

              .cursor-wrapper {
                position: fixed !important;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none !important;
                z-index: 99999 !important;
                display: ${isMobile ? 'none' : 'block'} !important;
              }

              .cursor {
                position: fixed !important;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%) !important;
                pointer-events: none !important;
                z-index: 99999 !important;
              }

              .cursor-text.view {
                display: block !important;
                visibility: visible !important;
                background: #000 !important;
                color: #fff !important;
                padding: 12px 24px !important;
                border-radius: 50px !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                letter-spacing: 2px !important;
                white-space: nowrap !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
                opacity: 0;
                transform: scale(0.8);
              }

              .lookbook-grid {
                will-change: transform;
              }

              .lookbook-item {
                will-change: transform;
                transform: translateZ(0);
                backface-visibility: hidden;
              }

              .lookbook-item-image {
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                            filter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
              }

              .lookbook-item:hover .lookbook-item-image {
                transform: scale(1.05);
              }

              .lookbook-item:active .lookbook-item-image {
                transform: scale(0.98);
              }

              @media (max-width: 1023px) {
                .lookbook-item-image {
                  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .lookbook-item:active .lookbook-item-image {
                  transform: scale(0.95);
                  filter: brightness(0.9);
                }
              }

              .journal-post:last-child .journal-post-line { 
                display: none; 
              }

              /* Smooth scrolling */
              html {
                scroll-behavior: smooth;
              }

              /* Disable text selection on images */
              .lookbook-item-image {
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
              }
            `
        }} />
      </div>
      
      {loading && <LoadingOverlay />}
      
      {/* CURSOR - Desktop Only */}
      {!isMobile && (
        <div className="cursor-wrapper">
          <div className="cursor" ref={cursorRef}>
            <div className="cursor-text view" ref={cursorTextRef}>View</div>
          </div>
        </div>
      )}

      <main className="main-wrapper">
        <div className="lookbook-wrapper">
          <div className="lookbook-grid" ref={gridRef}>
            
            {/* COLUMN 1 */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(0, 6).map((product, i) => renderProductItem(product, i, '1'))}
              </div>
            </div>

            {/* COLUMN 2 */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(6, 12).map((product, i) => renderProductItem(product, i, '2'))}
              </div>
            </div>

            {/* COLUMN 3 */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(12, 18).map((product, i) => renderProductItem(product, i, '3'))}
              </div>
            </div>

            {/* COLUMN 4 */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(18, 24).map((product, i) => renderProductItem(product, i, '4'))}
              </div>
            </div>

            {/* COLUMN 5 (Repeat) */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(0, 6).map((product, i) => renderProductItem(product, i, '5'))}
              </div>
            </div>

            {/* COLUMN 6 (Repeat) */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(6, 12).map((product, i) => renderProductItem(product, i, '6'))}
              </div>
            </div>

          </div>
        </div>
        <LookbookProductSection
          open={isShowSingle}
          close={close}
          product={selectedProduct}
        />
      </main>
    </div>
  );
};

export default Lookbook;
