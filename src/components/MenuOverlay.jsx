import gsap from "gsap";
import React, { useEffect, useRef } from "react";

const NavbarOverlay = ({isOpen, onClose}) => {
  
  const menuRef = useRef(null)

  // useEffect(() => {
  //   if (isOpen) {
  //     gsap.to(menuRef.current, {
  //       y: "0%", // Slide in from the right to fully visible
  //       opacity: 1,
  //       duration: 0.5,
  //       ease: "power2.out",
  //     });
  //   } else {
  //     gsap.to(menuRef.current, {
  //       y: "-100", // Slide out to the right
  //       opacity: 0,
  //       duration: 0.5,
  //       ease: "power2.in",
  //       onComplete: onClose,
  //     });
  //   }
  // }, [isOpen]);

  return (
    <>
      <div
      className={`menu`}
        ref={menuRef} 
        
      >
        <div className="line" />
        <div className="page-padding">
          <div className="container-xxlarge">
            <div className="menu-inner">
              <div
                id="w-node-cadf954e-d36c-7ae2-f2c7-313c4bb56d5e-4bb56d59"
                className="menu-column"
              >
                <div className="margin-bottom margin-medium">
                  <h3 className="text-uppercase">AROHA</h3>
                </div>
                <div className="menu-nav">
                  <div className="menu-nav-item">
                    <a
                      href="/home"
                      aria-current="page"
                      className="menu-nav-link w-inline-block w--current"
                    >
                      <div className="menu-nav-item-text">Home</div>
                      <div className="menu-nav-item-text-hover">Home</div>
                    </a>
                  </div>
                  <div className="menu-nav-item">
                    <a href="/rooms" className="menu-nav-link w-inline-block">
                      <div className="menu-nav-item-text">Rooms</div>
                      <div className="menu-nav-item-text-hover">Rooms</div>
                    </a>
                  </div>
                  <div className="menu-nav-item">
                    <a href="/journal" className="menu-nav-link w-inline-block">
                      <div className="menu-nav-item-text">Journal</div>
                      <div className="menu-nav-item-text-hover">Journal</div>
                    </a>
                  </div>
                  <div className="menu-nav-item">
                    <a href="/contact" className="menu-nav-link w-inline-block">
                      <div className="menu-nav-item-text">Contact</div>
                      <div className="menu-nav-item-text-hover">Contact</div>
                    </a>
                  </div>
                </div>
              </div>
              <div
                id="w-node-cadf954e-d36c-7ae2-f2c7-313c4bb56d6b-4bb56d59"
                className="menu-column"
              >
                <div className="margin-bottom margin-medium">
                  <h3 className="text-uppercase">Shop</h3>
                </div>
                <div className="menu-nav">
                  <div className="menu-nav-item">
                    <a href="/shop" className="menu-nav-link w-inline-block">
                      <div className="menu-nav-item-text">All Products</div>
                      <div className="menu-nav-item-text-hover">
                        All Products
                      </div>
                    </a>
                  </div>
                  <div className="menu-nav-item">
                    <a
                      href="/lookbook"
                      className="menu-nav-link w-inline-block"
                    >
                      <div className="menu-nav-item-text">Lookbook</div>
                      <div className="menu-nav-item-text-hover">Lookbook</div>
                    </a>
                  </div>
                  <div className="menu-nav-item">
                    <a href="/faq" className="menu-nav-link w-inline-block">
                      <div className="menu-nav-item-text">FAQ</div>
                      <div className="menu-nav-item-text-hover">FAQ</div>
                    </a>
                  </div>
                </div>
              </div>
              <div
                id="w-node-cadf954e-d36c-7ae2-f2c7-313c4bb56d76-4bb56d59"
                className="menu-column-featured"
              >
                <div className="margin-bottom margin-medium">
                  <h3 className="text-uppercase">Featured</h3>
                </div>
                <div
                  id="w-node-af301e6f-6d71-826f-2e41-e56327dca79e-4bb56d59"
                  className="collection-list-wrapper w-dyn-list"
                >
                  <div role="list" className="collection-list w-dyn-items">
                    <div role="listitem" className="menu-product w-dyn-item">
                      <a
                        href="/product/modern-chair"
                        className="menu-product-image-wrapper w-inline-block"
                      >
                        <img
                          alt=""
                          loading="lazy"
                          width={150}
                          src="https://assets-global.website-files.com/62ad735180e2900f1bf78dda/62d927b425124f3ae09549e7_product-modern-chair-preivew-small.webp"
                          className="menu-product-image"
                        />
                      </a>
                      <div className="menu-product-content">
                        <a
                          href="/product/modern-chair"
                          className="menu-product-heading-link w-inline-block"
                        >
                          <h4 className="heading-h5">Modern Chair</h4>
                        </a>
                        <div
                          data-wf-sku-bindings="%5B%7B%22from%22%3A%22f_price_%22%2C%22to%22%3A%22innerHTML%22%7D%5D"
                          className="heading-h6"
                        >
                          $&nbsp;249.00&nbsp;USD
                        </div>
                      </div>
                    </div>
                    <div role="listitem" className="menu-product w-dyn-item">
                      <a
                        href="/product/elegant-lamp"
                        className="menu-product-image-wrapper w-inline-block"
                      >
                        <img
                          alt=""
                          loading="lazy"
                          width={150}
                          src="https://assets-global.website-files.com/62ad735180e2900f1bf78dda/62d927bf7d064ab61512652d_product-elegant-lamp-preivew-small.webp"
                          className="menu-product-image"
                        />
                      </a>
                      <div className="menu-product-content">
                        <a
                          href="/product/elegant-lamp"
                          className="menu-product-heading-link w-inline-block"
                        >
                          <h4 className="heading-h5">Elegant Lamp</h4>
                        </a>
                        <div
                          data-wf-sku-bindings="%5B%7B%22from%22%3A%22f_price_%22%2C%22to%22%3A%22innerHTML%22%7D%5D"
                          className="heading-h6"
                        >
                          $&nbsp;129.00&nbsp;USD
                        </div>
                      </div>
                    </div>
                    <div role="listitem" className="menu-product w-dyn-item">
                      <a
                        href="/product/black-chair"
                        className="menu-product-image-wrapper w-inline-block"
                      >
                        <img
                          alt=""
                          loading="lazy"
                          width={150}
                          src="https://assets-global.website-files.com/62ad735180e2900f1bf78dda/62d927cc426f596af5eb02a8_product-black-chair-preivew-small.webp"
                          className="menu-product-image"
                        />
                      </a>
                      <div className="menu-product-content">
                        <a
                          href="/product/black-chair"
                          className="menu-product-heading-link w-inline-block"
                        >
                          <h4 className="heading-h5">Black Chair</h4>
                        </a>
                        <div
                          data-wf-sku-bindings="%5B%7B%22from%22%3A%22f_price_%22%2C%22to%22%3A%22innerHTML%22%7D%5D"
                          className="heading-h6"
                        >
                          $&nbsp;199.00&nbsp;USD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="menu-overlay" style={{ opacity: 0, display: "none" }} />
    </>
  );
};

export default NavbarOverlay;