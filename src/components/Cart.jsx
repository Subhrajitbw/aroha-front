import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const Cart = ({ isOpen, onClose }) => {
  const cartRef = useRef(null);
  
  // Conversion rate from USD to INR (you can update this rate as needed)
  const conversionRate = 82.75; // Example conversion rate

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      image:
        "https://uploads-ssl.webflow.com/62ad735180e2900f1bf78dda/62d3dd7049ba53075edaa0d3_product-elegant-lamp-preview.webp",
      name: "Elegant Lamp",
      price: 129.0, // USD price
      quantity: 1,
    },
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    calculateSubtotal();
    calculateTotalItems();
  }, [cartItems]);

  const calculateSubtotal = () => {
    const total = cartItems.reduce((acc, item) => {
      return acc + item.price * item.quantity * conversionRate; // Convert to INR
    }, 0);
    setSubtotal(total.toFixed(2));
  };

  const calculateTotalItems = () => {
    const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    setTotalItems(total);
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
  };

  const handleQuantityChange = (id, quantity) => {
    const updatedCart = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: parseInt(quantity) } : item
      )
      .filter((item) => item.quantity > 0); // Remove items with quantity 0
    setCartItems(updatedCart);
  };

  useEffect(() => {
    if (isOpen) {
      gsap.to(cartRef.current, {
        x: 0, // Slide in from the right to fully visible
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      gsap.to(cartRef.current, {
        x: "100%", // Slide out to the right
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: onClose,
      });
    }
  }, [isOpen, onClose]);

  return (
    <div
      data-node-type="commerce-cart-container-wrapper"
      ref={cartRef}
      style={{
        opacity: 0,
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: "rgba(52, 51, 57, .8)",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.9)",
        zIndex: 1000,
      }}
      className="w-commerce-commercecartcontainerwrapper w-commerce-commercecartcontainerwrapper--cartType-rightSidebar cart-wrapper"
    >
      <div
        role="dialog"
        data-node-type="commerce-cart-container"
        className="w-commerce-commercecartcontainer cart-container"
      >
        <div className="w-commerce-commercecartheader cart-header">
          <h4 className="w-commerce-commercecartheading heading-h3">
            Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
          </h4>
          <a
            href="#"
            data-node-type="commerce-cart-close-link"
            role="button"
            aria-label="Close cart"
            className="w-commerce-commercecartcloselink close-button w-inline-block"
          >
            <div className="heading-h6">Close</div>
          </a>
        </div>
        <div className="w-commerce-commercecartformwrapper">
          <form
            data-node-type="commerce-cart-form"
            className="w-commerce-commercecartform"
          >
            {cartItems.length > 0 && (
              <div className="w-commerce-commercecartlist cart-list">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="w-commerce-commercecartitem cart-item"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-commerce-commercecartitemimage cart-item-image"
                    />
                    <div className="w-commerce-commercecartiteminfo cart-item-content">
                      <div className="margin-bottom margin-small">
                        <div className="w-commerce-commercecartproductname heading-h5">
                          {item.name}
                        </div>
                        <div className="heading-h6">
                          ₹{(item.price * conversionRate).toFixed(2)} INR
                        </div>
                      </div>
                      <a
                        href="#"
                        role="button"
                        aria-label="Remove item from cart"
                        className="w-inline-block"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <div className="cart-item-remove">Remove</div>
                      </a>
                    </div>
                    <input
                      aria-label="Update quantity"
                      className="w-commerce-commercecartquantity cart-item-quantity"
                      required
                      pattern="^[0-9]+$"
                      inputMode="numeric"
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            <div
              className="w-commerce-commercecartemptystate justify-center flex items-center h-[100vh]"
              style={{
                display: cartItems.length === 0 ? "flex" : "none", // Use "flex" to align the text
              }}
            >
              <div
                className="notfound text-center" // Add "text-center" class for centering text
                aria-live="polite"
                aria-label="This cart is empty"
              >
                No items found.
              </div>
            </div>
            {cartItems?.length > 0 && (
              <div className="w-commerce-commercecartfooter cart-footer">
                <div
                  aria-atomic="true"
                  aria-live="polite"
                  className="w-commerce-commercecartlineitem"
                >
                  <div className="heading-h5">Subtotal</div>
                  <div className="w-commerce-commercecartordervalue heading-h5">
                    ₹{subtotal} INR
                  </div>
                </div>
                <div className="checkout-actions">
                  <a
                    href="/checkout"
                    value="Continue to Checkout"
                    data-node-type="cart-checkout-button"
                    className="w-commerce-commercecartcheckoutbutton button primary"
                    data-loading-text="Hang Tight..."
                  >
                    Continue to Checkout
                  </a>
                </div>
              </div>
            )}
          </form>

          <div
            aria-live="assertive"
            style={{ display: "none" }}
            data-node-type="commerce-cart-error"
            className="w-commerce-commercecarterrorstate"
          >
            <div className="w-cart-error-msg">
              Product is not available in this quantity.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
