import React, { useState, useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { animated } from "@react-spring/web";
import { motion } from "framer-motion";
import { useResponsive } from "../hooks/useResponsive";
import { useBackgroundSpring } from "../hooks/useBackgroundSpring";
import { useContentAnimation } from "../hooks/useContentAnimation";
import { useQuery } from "@tanstack/react-query";
import { medusaApi, medusa, prefetchImage } from "../lib/react-query";

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

  // ---------------------------------------------------------
  // 2. DATA FETCHING (TANSTACK QUERY)
  // ---------------------------------------------------------

  // A. Fetch Region
  const { data: regionId } = useQuery({
    queryKey: ['region'],
    queryFn: async () => {
      const { regions } = await medusa.region.list({ limit: 1 });
      return regions?.[0]?.id || null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // B. Fetch Collection & Products
  const { data: sectionData, isLoading: loading } = useQuery({
    queryKey: ['animated-section', collectionHandle, regionId],
    queryFn: async () => {
      let targetCollection = null;

      // 1. Get Collection
      if (collectionHandle) {
        const { collections } = await medusa.collection.list({ handle: collectionHandle, limit: 1 });
        if (collections?.length > 0) targetCollection = collections[0];
      } else {
        const { collections } = await medusa.collection.list({ limit: 1 });
        if (collections?.length > 0) targetCollection = collections[0];
      }

      if (!targetCollection) return { collection: null, products: [] };

      // 2. Fetch Products
      const params = {
        collection_id: [targetCollection.id],
        limit: 10,
        fields: "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*",
      };
      if (regionId) params.region_id = regionId;

      const { products: rawProducts } = await medusa.product.list(params);

      // 3. Map Products
      const mapped = rawProducts.map(product => {
        const defaultVariant = product.variants?.[0];
        const priceObj = defaultVariant?.calculated_price;

        const amount = priceObj?.calculated_amount || 0;
        const originalAmount = priceObj?.original_amount || 0;
        const currencyCode = (priceObj?.currency_code || "INR").toUpperCase();

        let discount = 0;
        if (originalAmount > amount) {
          discount = Math.round(((originalAmount - amount) / originalAmount) * 100);
        }

        const formatPrice = (val) => new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);

        const isSale = discount > 0;

        const productData = {
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.thumbnail || "https://placehold.co/600x800",
          price: formatPrice(amount),
          originalPrice: isSale ? formatPrice(originalAmount) : null,
          discount,
          status: isSale ? "sale" : "new",
          collection: targetCollection.title
        };

        // Prefetch product image
        prefetchImage(productData.image);
        return productData;
      });

      // Prefetch collection background image
      if (targetCollection.metadata?.image) {
        prefetchImage(targetCollection.metadata.image);
      }

      return { collection: targetCollection, products: mapped };
    },
    enabled: !!regionId || regionId === null,
    staleTime: 1000 * 60 * 10,
  });

  const collection = sectionData?.collection;
  const products = sectionData?.products || [];

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
