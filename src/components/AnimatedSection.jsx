import React, { useState, useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { animated } from "@react-spring/web";
import { motion } from "framer-motion";
import { sdk } from "../lib/medusaClient"; // Ensure this is your initialized SDK
import { useResponsive } from "../hooks/useResponsive";
import { useBackgroundSpring } from "../hooks/useBackgroundSpring";
import { useContentAnimation } from "../hooks/useContentAnimation";

// Sub-components
import SliderColumn from "./sections/SliderColumn";
import TextColumn from "./sections/TextColumns";

const AnimatedSection = ({
  // You can pass a specific collection handle if you want this section to be static
  // Or let it auto-fetch the first one
  collectionHandle, 
  desktopViewMode = "normal",
  defaultBackground,
}) => {
  // ---------------------------------------------------------
  // 1. STATE & REFS
  // ---------------------------------------------------------
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regionId, setRegionId] = useState(null);

  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const { ref: textRef, inView } = useInView({ threshold: 0.2 });
  
  const isDesktop = useResponsive();
  const bgSpring = useBackgroundSpring(sectionRef);
  const {
    contentControls,
    desktopControls,
    mobileSliderControls,
    desktopEntered,
    textAnimationTriggered,
  } = useContentAnimation(inView, isDesktop);

  const invertLayout = desktopViewMode === "invert";

  // ---------------------------------------------------------
  // 2. DATA FETCHING
  // ---------------------------------------------------------

  // A. Fetch Region (Crucial for accurate pricing)
  useEffect(() => {
    const initRegion = async () => {
      try {
        const { regions } = await sdk.store.region.list({ limit: 1 });
        if (regions?.length > 0) setRegionId(regions[0].id);
      } catch (e) {
        console.warn("Region fetch failed", e);
      }
    };
    initRegion();
  }, []);

  // B. Fetch Collection & Products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let targetCollection = null;

        // 1. Get Collection info
        if (collectionHandle) {
            // Fetch specific collection by handle
            const { collections } = await sdk.store.collection.list({ handle: collectionHandle, limit: 1 });
            if (collections.length > 0) targetCollection = collections[0];
        } else {
            // Fetch the first available collection as default
            const { collections } = await sdk.store.collection.list({ limit: 1 });
            if (collections.length > 0) targetCollection = collections[0];
        }

        if (!targetCollection) {
            setLoading(false);
            return;
        }

        setCollection(targetCollection);

        // 2. Fetch Products for this Collection
        // Note: Medusa v2 filters by 'collection_id' array
        const queryParams = {
            collection_id: [targetCollection.id],
            limit: 10,
            fields: "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*",
        };
        if (regionId) queryParams.region_id = regionId;

        const { products: rawProducts } = await sdk.store.product.list(queryParams);

        // 3. Map Products (Robust Pricing Logic)
        const mappedProducts = rawProducts.map(product => {
            const defaultVariant = product.variants?.[0];
            
            // Price Logic
            let amount = defaultVariant?.calculated_price?.calculated_amount;
            let originalAmount = defaultVariant?.calculated_price?.original_amount;
            let currencyCode = defaultVariant?.calculated_price?.currency_code;

            // Fallback to raw prices if calculated is missing
            if (amount === undefined || amount === null) {
                const prices = defaultVariant?.prices || [];
                // Prefer INR, then USD, then first
                let priceObj = prices.find(p => p.currency_code?.toLowerCase() === 'inr');
                if (!priceObj) priceObj = prices.find(p => p.currency_code?.toLowerCase() === 'usd');
                if (!priceObj) priceObj = prices[0];

                if (priceObj) {
                    amount = priceObj.amount;
                    originalAmount = priceObj.amount;
                    currencyCode = priceObj.currency_code;
                }
            }

            amount = amount || 0;
            originalAmount = originalAmount || 0;
            currencyCode = (currencyCode || "INR").toUpperCase();

            // Discount
            let discount = 0;
            if (originalAmount > amount) {
                discount = Math.round(((originalAmount - amount) / originalAmount) * 100);
            }

            // Formatter
            const formatPrice = (val) => new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(val);

            const isSale = discount > 0;

            return {
                id: product.id,
                title: product.title,
                handle: product.handle,
                image: product.thumbnail || product.images?.[0]?.url || "https://placehold.co/600x800/f5f5f5/e0e0e0",
                price: formatPrice(amount),
                originalPrice: isSale ? formatPrice(originalAmount) : null,
                discount: discount,
                status: isSale ? "sale" : "new",
                collection: targetCollection.title
            };
        });

        setProducts(mappedProducts);

      } catch (error) {
        console.error("Error fetching animated section data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionHandle, regionId]);

  // ---------------------------------------------------------
  // 3. RENDER
  // ---------------------------------------------------------
  
  // Helper props for child components
  const sharedProps = {
    products,
    isDesktop,
    inView,
    desktopEntered,
    textAnimationTriggered,
    invertLayout,
    title: collection?.title || "Collection",
    description: collection?.metadata?.description || "Discover our latest curated collection.", // Use metadata or fallback
    desktopControls,
    mobileSliderControls,
    textRef,
  };

  // Loading State (Optional: skeleton or null)
  if (loading) return null; 

  return (
    <animated.div
      ref={sectionRef}
      style={{
        ...bgSpring,
        backgroundImage: `
          linear-gradient(to bottom, rgba(69, 69, 69, 0.4), rgba(69, 69, 69,0.7)),
          url(${collection?.metadata?.image || defaultBackground || 'https://media.designcafe.com/wp-content/uploads/2022/08/04164549/brown-leather-reading-chair.jpg'})
        `,
        backgroundAttachment:
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
            ? "scroll"
            : "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
      className="w-full min-h-0 h-full overflow-hidden"
    >
      <div className="w-full h-full min-h-0 flex items-center justify-center overflow-hidden">
        <motion.div
          ref={contentRef}
          initial={{ y: 100, opacity: 0 }}
          animate={contentControls}
          className="w-full h-full min-h-0 max-w-7xl flex flex-col md:flex-row gap-8 overflow-hidden"
        >
          {invertLayout ? (
            <>
              <SliderColumn {...sharedProps} />
              <TextColumn {...sharedProps} />
            </>
          ) : (
            <>
              <TextColumn {...sharedProps} />
              <SliderColumn {...sharedProps} />
            </>
          )}
        </motion.div>
      </div>
    </animated.div>
  );
};

export default AnimatedSection;
