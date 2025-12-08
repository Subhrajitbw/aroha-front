import { useEffect, useState, useRef } from "react";
import NavBarLight from "../components/NavbarLight";
import LoadingOverlay from "../components/LoadingOverlay";
import { gsap } from "gsap";
import LookbookProductSection from "../components/LookbookProductSection";
import { sdk } from "../lib/medusaClient"; 

const Lookbook = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isShowSingle, setIsShowIsSingle] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isHoveringProduct, setIsHoveringProduct] = useState(false); // Track hover state
  
  const gridRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorTextRef = useRef(null); // Reference for the "View" text

  const close = () => setIsShowIsSingle(false);

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

  // 2. Animations & Cursor
  useEffect(() => {
    // Webflow
    const pageElement = document.documentElement;
    if (pageElement) pageElement.setAttribute("data-wf-page", "62c3453c8232198387a52aa4");
    if (window.Webflow) {
      window.Webflow.ready();
      if (window.Webflow.require("ix2")) window.Webflow.require("ix2").init();
    }
    document.dispatchEvent(new Event("readystatechange"));

    const handleMouseMove = (e) => {
      // Cursor Movement
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          left: e.clientX,
          top: e.clientY,
          duration: 0.15,
          ease: "power2.out",
          overwrite: true
        });
      }

      // Grid Parallax
      if (gridRef.current) {
        const gridItems = gridRef.current.querySelectorAll(".lookbook-item");
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const distMultiX = (e.clientX - centerX) / centerX;
        const distMultiY = (e.clientY - centerY) / centerY;

        gsap.to(gridItems, {
          duration: 0.5,
          x: distMultiX * -100,
          y: distMultiY * -100,
          ease: "power3.out",
          stagger: { amount: 0 },
          overwrite: "auto"
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 3. Show/Hide "View" text based on hover state
  useEffect(() => {
    if (cursorTextRef.current) {
      gsap.to(cursorTextRef.current, {
        opacity: isHoveringProduct ? 1 : 0,
        scale: isHoveringProduct ? 1 : 0.8,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [isHoveringProduct]);

  return (
    <div className="page-wrapper">
      <div className="global-styles w-embed">
        <style dangerouslySetInnerHTML={{
            __html: `
              .cursor-wrapper {
                position: fixed !important;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none !important;
                z-index: 99999 !important;
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
                /* Start hidden */
                opacity: 0;
                transform: scale(0.8);
              }

              .journal-post:last-child .journal-post-line { display: none; }
            `
        }} />
      </div>
      
      {loading && <LoadingOverlay />}
      
      {/* CURSOR */}
      <div className="cursor-wrapper">
        <div className="cursor" ref={cursorRef}>
          <div className="cursor-text view" ref={cursorTextRef}>View</div>
        </div>
      </div>

      <main className={`main-wrapper`}>
        <div className={`lookbook-wrapper`}>
          <div className="lookbook-grid" ref={gridRef}>
            
            {/* COLUMN 1 */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(0, 6).map((product, i) => (
                  <div 
                    key={`${product._id}-1-${i}`} 
                    role="listitem" 
                    className="lookbook-item w-dyn-item cursor-pointer"
                    onMouseEnter={() => setIsHoveringProduct(true)}
                    onMouseLeave={() => setIsHoveringProduct(false)}
                  >
                    <a className="cusror-pointer lookbook-item-link w-inline-block" onClick={() => { setSelectedProduct(product.originalData || product); setIsShowIsSingle(true); }}>
                      <img src={product.images[0]} loading="eager" alt={product.name} className="lookbook-item-image" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2 */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(6, 12).map((product, i) => (
                  <div 
                    key={`${product._id}-2-${i}`} 
                    role="listitem" 
                    className="lookbook-item w-dyn-item cursor-pointer"
                    onMouseEnter={() => setIsHoveringProduct(true)}
                    onMouseLeave={() => setIsHoveringProduct(false)}
                  >
                    <a className="cusror-pointer lookbook-item-link w-inline-block" onClick={() => { setSelectedProduct(product.originalData || product); setIsShowIsSingle(true); }}>
                      <img src={product.images[0]} loading="eager" alt={product.name} className="lookbook-item-image" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3 */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(12, 18).map((product, i) => (
                  <div 
                    key={`${product._id}-3-${i}`} 
                    role="listitem" 
                    className="lookbook-item w-dyn-item cursor-pointer"
                    onMouseEnter={() => setIsHoveringProduct(true)}
                    onMouseLeave={() => setIsHoveringProduct(false)}
                  >
                    <a className="cusror-pointer lookbook-item-link w-inline-block" onClick={() => { setSelectedProduct(product.originalData || product); setIsShowIsSingle(true); }}>
                      <img src={product.images[0]} loading="eager" alt={product.name} className="lookbook-item-image" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 4 */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(18, 24).map((product, i) => (
                  <div 
                    key={`${product._id}-4-${i}`} 
                    role="listitem" 
                    className="lookbook-item w-dyn-item cursor-pointer"
                    onMouseEnter={() => setIsHoveringProduct(true)}
                    onMouseLeave={() => setIsHoveringProduct(false)}
                  >
                    <a className="cusror-pointer lookbook-item-link w-inline-block" onClick={() => { setSelectedProduct(product.originalData || product); setIsShowIsSingle(true); }}>
                      <img src={product.images[0]} loading="eager" alt={product.name} className="lookbook-item-image" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 5 (Repeat) */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(0, 6).map((product, i) => (
                  <div 
                    key={`${product._id}-5-${i}`} 
                    role="listitem" 
                    className="lookbook-item w-dyn-item cursor-pointer"
                    onMouseEnter={() => setIsHoveringProduct(true)}
                    onMouseLeave={() => setIsHoveringProduct(false)}
                  >
                    <a className="cusror-pointer lookbook-item-link w-inline-block" onClick={() => { setIsShowIsSingle(true); }}>
                      <img src={product.images[0]} loading="eager" alt={product.name} className="lookbook-item-image" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 6 (Repeat) */}
            <div className="lookbook-grid-column w-dyn-list">
              <div role="list" className="lookbook-grid-column-inner w-dyn-items">
                {products.slice(6, 12).map((product, i) => (
                  <div 
                    key={`${product._id}-6-${i}`} 
                    role="listitem" 
                    className="lookbook-item w-dyn-item cursor-pointer"
                    onMouseEnter={() => setIsHoveringProduct(true)}
                    onMouseLeave={() => setIsHoveringProduct(false)}
                  >
                    <a className="cusror-pointer lookbook-item-link w-inline-block" onClick={() => { setSelectedProduct(product.originalData || product); setIsShowIsSingle(true); }}>
                      <img src={product.images[0]} loading="eager" alt={product.name} className="lookbook-item-image" />
                    </a>
                  </div>
                ))}
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
