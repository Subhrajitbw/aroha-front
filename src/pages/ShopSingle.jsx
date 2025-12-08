import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Footer from "../components/Footer";
import NavBarLight from "../components/NavbarLight";
import LoadingOverlay from "../components/LoadingOverlay";

const ShopSingle = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pageElement = document.documentElement;
    if (pageElement) {
      pageElement.setAttribute("data-wf-page", "62b2b84054543c242f16b078");
    }
    window.Webflow && window.Webflow.ready();
    window.Webflow && window.Webflow.require('ix2').init();
    document.dispatchEvent(new Event('readystatechange'));

    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://arohahouse.com/api/v1/products/${slug}`);
        const data = await response.json();
        setProduct(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) return <LoadingOverlay />;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="page-wrapper">
      <LoadingOverlay />
      <header className="header absolute">
        <NavBarLight />
      </header>
      <main className="main-wrapper">
        <section className="section-product-single-grid">
          <div
            id="w-node-_108bb725-51a2-4072-8cab-1d91274cdd9f-2f16b078"
            className="product-single-grid-left"
          >
            <div
              id="w-node-c0530a68-95fd-5fdf-27a3-11b96ebd4141-2f16b078"
              className="product-single-lightbox w-dyn-list w-dyn-items-repeater-ref"
            >
              <div role="list" className="product-single-lightbox-list w-dyn-items">
                {product.images.map((image, index) => (
                  <div
                    key={image.id}
                    role="listitem"
                    className="product-single-lightbox-item w-dyn-item w-dyn-repeater-item"
                  >
                    <a
                      href="#"
                      data-wf-sku-bindings="%5B%7B%22from%22%3A%22f_more_images_4dr%5B%5D%22%2C%22to%22%3A%22media%22%7D%5D"
                      data-w-id="4d52ed96-30eb-9693-50a5-294a712c0b06"
                      className="product-single-lightbox-link w-inline-block w-lightbox"
                      aria-label="open lightbox"
                      aria-haspopup="dialog"
                    >
                      <img
                        src={image.large_image_url}
                        loading="lazy"
                        data-wf-sku-bindings="%5B%7B%22from%22%3A%22f_more_images_4dr%5B%5D%22%2C%22to%22%3A%22src%22%7D%5D"
                        alt={product.name}
                        sizes="(max-width: 767px) 100vw, 50vw"
                        className="product-single-lightbox-image"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            id="w-node-bd359ed0-4704-a4c5-55ce-6b52cf9390c4-2f16b078"
            className="product-single-grid-right"
          >
            <div className="product-single-content">
              <div className="product-single-content-inner">
                <div className="margin-bottom margin-medium">
                  <h1 className="heading-medium">{product.name}</h1>
                </div>
                <div className="margin-bottom margin-medium">
                  <div className="subnav">
                    <div
                      data-wf-sku-bindings="%5B%7B%22from%22%3A%22f_price_%22%2C%22to%22%3A%22innerHTML%22%7D%5D"
                      className="product-price"
                    >
                      {product.formatted_price}
                    </div>
                  </div>
                </div>
                <div className="margin-bottom margin-large">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
                <div className="margin-bottom margin-large">
                  <div className="product-single-actions">
                    <form
                      data-node-type="commerce-add-to-cart-form"
                      data-commerce-sku-id={product.sku}
                      data-loading-text="Adding to cart..."
                      data-commerce-product-id={product.id}
                      className="w-commerce-commerceaddtocartform"
                    >
                      <div className="product-single-actions-buy">
                        <input
                          type="number"
                          pattern="^[0-9]+$"
                          inputMode="numeric"
                          name="commerce-add-to-cart-quantity-input"
                          min={1}
                          className="w-commerce-commerceaddtocartquantityinput product-single-quantity"
                          defaultValue={1}
                        />
                        <input
                          type="submit"
                          data-node-type="commerce-add-to-cart-button"
                          data-loading-text="Adding to cart..."
                          aria-busy="false"
                          aria-haspopup="dialog"
                          className="w-commerce-commerceaddtocartbutton product-single-button"
                          value="Add to Cart"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-product-single-description">
          <div className="page-padding">
            <div className="container-large">
              <div className="padding-vertical padding-xhuge">
                <div className="product-single-description-grid">
                  <div id="w-node-_15be9448-390c-7229-05b2-e847cb2681e6-2f16b078">
                    <h2>Description</h2>
                  </div>
                  <div id="w-node-_15be9448-390c-7229-05b2-e847cb2681e9-2f16b078">
                    <div className="text-size-medium">
                      <div className="text-rich-text w-richtext" dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ShopSingle;