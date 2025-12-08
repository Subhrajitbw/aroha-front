import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const LookbookProductSection = ({ open, close, product }) => {
  useEffect(() => {
    console.log('LookbookProductSection mounted');
    const pageElement = document.documentElement;
    if (pageElement) {
      pageElement.setAttribute("data-wf-page", "62d148705070e97de6445fbf");
    }
    window.Webflow && window.Webflow.ready();
    window.Webflow && window.Webflow.require("ix2").init();
    document.dispatchEvent(new Event("readystatechange"));

    return () => {
      console.log('LookbookProductSection unmounted');
    };
  }, []);

  // Log when product or open state changes
  useEffect(() => {
    if (open) {
      console.log('Product section opened:', { product });
    } else {
      console.log('Product section closed');
    }
  }, [open, product]);

  const handleClose = () => {
    console.log('Closing product section');
    close();
  };

  const handleProductClick = () => {
    console.log('Product clicked:', { 
      name: product?.name,
      url: product?.url_key 
    });
  };

  if (!product || !open) {
    console.log('Component not rendered - missing product or closed');
    return null;
  }

  return (
    <div className={`${open ? "" : "hidden"} w-full h-full bg-[#343339]`}>
      <div className="lookbook-single-content">
        <div className="lookbook-single-content-inner">
          <div className="margin-bottom margin-medium">
            <p onClick={close} className="heading-h6 cursor-pointer">
              Close
            </p>
          </div>
          <div className="margin-bottom margin-medium">
            <h1>{product.name}</h1>
          </div>
          <div className="margin-bottom margin-medium">
            <Link
              to={`/product/${product.id}`}
              className="lookbook-single-image-wrapper w-inline-block"
            >
              <img
                alt={product.name}
                loading="lazy"
                width={500}
                src={product.base_image.large_image_url}
                sizes="(max-width: 479px) 28vw, (max-width: 767px) 24vw, 25vw"
                className="lookbook-single-image"
              />
            </Link>
          </div>
          <div className="margin-bottom margin-medium">
            <div 
              className="text-size-medium"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          </div>
        </div>
        <Link
          to={`/product/${product.id}`}
          className="button primary w-inline-block"
        >
          <div className="button-inner">
            <div className="button-inner-text">Get Product</div>
            <div className="button-inner-text-hover primary">Get Product</div>
          </div>
          <div className="button-background primary" />
        </Link>
      </div>
      <div onClick={close} className="lookbook-single-overlay w-inline-block" />
    </div>
  );
};

LookbookProductSection.propTypes = {
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  product: PropTypes.shape({
    name: PropTypes.string,
    url_key: PropTypes.string,
    short_description: PropTypes.string,
    base_image: PropTypes.shape({
      large_image_url: PropTypes.string
    })
  })
};

export default LookbookProductSection;