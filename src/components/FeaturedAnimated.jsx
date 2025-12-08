import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const FeaturedAnimated = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);

  const imageNodes = [
    { id: "w-node-_29b65593-a4b2-7d14-e0c8-92cf4724cfab-a042b9b3", hasDataId: true },
    { id: "w-node-_29b65593-a4b2-7d14-e0c8-92cf4724cfac-a042b9b3", hasDataId: false },
    { id: "w-node-_29b65593-a4b2-7d14-e0c8-92cf4724cfad-a042b9b3", hasDataId: false },
    { id: "w-node-_29b65593-a4b2-7d14-e0c8-92cf4724cfae-a042b9b3", hasDataId: false },
    { id: "w-node-_29b65593-a4b2-7d14-e0c8-92cf4724cfaf-a042b9b3", hasDataId: false },
    { id: "w-node-_29b65593-a4b2-7d14-e0c8-92cf4724cfb0-a042b9b3", hasDataId: false },
    { id: "w-node-_29b65593-a4b2-7d14-e0c8-92cf4724cfb1-a042b9b3", hasDataId: false }
  ];

  const imageStyle = {
    willChange: "transform",
    transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
    transformStyle: "preserve-3d",
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://arohahouse.com/api/v1/products?sort=id&limit=7");
        const data = await response.json();
        setProducts(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Cinematic entrance for section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 80, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power4.out",
          delay: 0.2,
        }
      );
      // Parallax effect for section on scroll
      gsap.to(sectionRef.current, {
        y: 40,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
        ease: "none",
      });
      // Animate heading
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.5,
          }
        );
      }
      // Animate images staggered
      if (gridRef.current) {
        const images = gridRef.current.querySelectorAll(".home-images-image");
        gsap.fromTo(
          images,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
            delay: 0.7,
          }
        );
      }
    }
  }, [loading]);

  // Show loading or placeholder state while fetching data
  if (loading) return null;

  return (
    <section ref={sectionRef} className="section-home-images">
      <div className="home-images-content">
        <h2
          ref={headingRef}
          data-w-id="91546e5b-36de-19e8-68e4-f6161fad11e4"
          style={{
            transform: "translate3d(0px, 30px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
            transformStyle: "preserve-3d",
            opacity: 0,
          }}
          className="home-images-heading"
        >
          AROHA
        </h2>
      </div>
      <div className="home-images-grid-wrapper">
        <div className="home-images-grid-inner">
          <div ref={gridRef} className="home-images-grid">
            {products.slice(0, 7).map((product, index) => {
              const node = imageNodes[index] || imageNodes[0];
              return (
                <img
                  key={product.id}
                  className="home-images-image"
                  src={product.base_image.large_image_url}
                  alt={product.name}
                  loading="eager"
                  sizes="(max-width: 991px) 25vw, 13vw"
                  {...(node.hasDataId && {
                    "data-w-id": "29b65593-a4b2-7d14-e0c8-92cf4724cfab"
                  })}
                  id={node.id}
                  style={imageStyle}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="home-images-bg" />
      <div className="overlay _20" />
    </section>
  );
};

export default FeaturedAnimated;