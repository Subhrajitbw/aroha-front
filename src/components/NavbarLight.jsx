import React, { useEffect, useState } from "react";
import Cart from "./Cart";
import NavbarOverlay from "./MenuOverlay";
import { Link } from "react-router-dom";
import MegamenuInverse from "./MegamenuInverse";

const NavBarLight = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  const toggleMegaMenu = () => setIsMegaMenuOpen(!isMegaMenuOpen);

  useEffect(() => {
    console.log(isOpen);
  }, [isCartOpen, isOpen]);

  return (
    <>
      <div className="navbar-wrapper absolute z-[999]">
        <div
          id="w-node-d9aa0505-21b5-506a-5325-2313ff88f250-ff88f24f"
          className="navbar"
        >
          <div className="page-padding">
            <div className="container-xxlarge">
              <header className="navbar-inner">
                <div
                  id="w-node-d9aa0505-21b5-506a-5325-2313ff88f254-ff88f24f"
                  className="navbar-left"
                >
                  <div className="navbar-menu">
                    <Link
                      to="/lookbook"
                      className="navbar-menu-link w-inline-block"
                    >
                      <div className="navbar-menu-text">Lookbook</div>
                      <div className="navbar-menu-text-hover">Lookbook</div>
                    </Link>
                  </div>
                </div>
                <div
                  id="w-node-d9aa0505-21b5-506a-5325-2313ff88f257-ff88f24f"
                  className="navbar-center"
                >
                  <div className="navbar-logo">
                    <Link
                      to="/home"
                      aria-current="page"
                      className="navbar-logo-link w-inline-block w--current"
                    >
                      <img src="/logo.svg" loading="lazy" width={110} alt="" />
                    </Link>
                  </div>
                </div>
                <div
                  id="w-node-d9aa0505-21b5-506a-5325-2313ff88f25b-ff88f24f"
                  className="navbar-right"
                >
                  <div className="navbar-menu">
                    <Link
                      to="/shop"
                      className="navbar-menu-link w-inline-block"
                    >
                      <div className="navbar-menu-text">Shop</div>
                      <div className="navbar-menu-text-hover">Shop</div>
                    </Link>
                    <div
                      data-node-type="commerce-cart-wrapper"
                      data-open-product=""
                      data-wf-cart-type="rightSidebar"
                      data-wf-page-link-href-prefix=""
                      className="w-commerce-commercecartwrapper"
                    >
                      <a
                        href="#"
                        data-node-type="commerce-cart-open-link"
                        aria-haspopup="dialog"
                        aria-label="Open cart containing 1 items"
                        role="button"
                        className="w-commerce-commercecartopenlink cart-button w-inline-block"
                        onClick={openCart}
                      >
                        <div className="w-inline-block">Cart</div>
                        <div
                          data-wf-bindings="%5B%7B%22innerHTML%22%3A%7B%22type%22%3A%22Number%22%2C%22filter%22%3A%7B%22type%22%3A%22numberPrecision%22%2C%22params%22%3A%5B%220%22%2C%22numberPrecision%22%5D%7D%2C%22dataPath%22%3A%22database.commerceOrder.userItemsCount%22%7D%7D%5D"
                          className="w-commerce-commercecartopenlinkcount cart-quantity"
                        >
                          1
                        </div>
                      </a>

                      <Cart isOpen={isCartOpen} closeCart={closeCart} />
                    </div>
                    <div className="menu-toggle" onClick={openMenu}>
                      <div className="menu-toggle-line _01" />
                      <div className="menu-toggle-line _02" />
                    </div>
                  </div>
                </div>
              </header>
            </div>
          </div>
        </div>
      </div>
      <NavbarOverlay isOpen={isOpen} onClose={closeMenu} />
    </>
  );
};

export default NavBarLight;
