import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const StoresSection = () => {
    const sectionRef = useRef(null);
    const headingRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
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
        // Animate grid items staggered
        if (gridRef.current) {
            const stores = gridRef.current.querySelectorAll(".store");
            gsap.fromTo(
                stores,
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
    }, []);

    return(
        <section ref={sectionRef} className="section-stores">
        <div className="line" />
        <div className="page-padding">
          <div className="container-xlarge">
            <div className="padding-vertical padding-xhuge">
              <div className="margin-bottom margin-xlarge">
                <div className="stores-heading">
                  <h2 ref={headingRef} className="heading-small">Our Stores</h2>
                </div>
              </div>
              <div ref={gridRef} className="store-grid">
                <div className="store">
                  <img
                    src="https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b28fe4da58557ef43d8e_store-hamburg.jpg"
                    loading="lazy"
                    width={300}
                    height={300}
                    alt="Store Hamburg"
                    srcSet="https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b28fe4da58557ef43d8e_store-hamburg-p-500.jpeg 500w, https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b28fe4da58557ef43d8e_store-hamburg.jpg 600w"
                    sizes="(max-width: 479px) 80vw, (max-width: 767px) 200px, (max-width: 991px) 250px, (max-width: 1919px) 21vw, 300px"
                    className="store-image"
                  />
                  <div className="store-content">
                    <div className="margin-bottom margin-small">
                      <h3>Hamburg</h3>
                    </div>
                    <div className="margin-bottom margin-small">
                      <div>
                        AROHA Store,
                        <br />
                        22765 Hamburg
                      </div>
                    </div>
                    <a
                      href="#"
                      target="_blank"
                      className="button-text arrow-right w-inline-block"
                    >
                      <div className="button-text-wrapper">
                        <div className="button-text-text">Get Directions</div>
                        <div className="button-text-icon-wrapper">
                          <div
                            className="button-text-icon w-embed"
                          >
                            <svg
                              width={32}
                              height={6}
                              viewBox="0 0 32 6"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                y="2.5"
                                width={30}
                                height={1}
                                fill="currentColor"
                              />
                              <path
                                d="M28 0.5L30.5 3L28 5.5"
                                stroke="currentColor"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
                <div className="store">
                  <img
                    src="https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b29d856d2659f08b996b_store-lisbon.jpg"
                    loading="lazy"
                    width={300}
                    height={300}
                    alt="Store Lisbon"
                    srcSet="https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b29d856d2659f08b996b_store-lisbon-p-500.jpeg 500w, https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b29d856d2659f08b996b_store-lisbon.jpg 600w"
                    sizes="(max-width: 479px) 80vw, (max-width: 767px) 200px, (max-width: 991px) 250px, (max-width: 1919px) 23vw, 300px"
                    className="store-image"
                  />
                  <div className="store-content">
                    <div className="margin-bottom margin-small">
                      <h3>Lisbon</h3>
                    </div>
                    <div className="margin-bottom margin-small">
                      <div>
                        AROHA Store,
                        <br />
                        1049 Lisbon
                      </div>
                    </div>
                    <a
                      href="#"
                      target="_blank"
                      className="button-text arrow-right w-inline-block"
                    >
                      <div className="button-text-wrapper">
                        <div className="button-text-text">Get Directions</div>
                        <div className="button-text-icon-wrapper">
                          <div
                            className="button-text-icon w-embed"
                          >
                            <svg
                              width={32}
                              height={6}
                              viewBox="0 0 32 6"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                y="2.5"
                                width={30}
                                height={1}
                                fill="currentColor"
                              />
                              <path
                                d="M28 0.5L30.5 3L28 5.5"
                                stroke="currentColor"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
}

export default StoresSection