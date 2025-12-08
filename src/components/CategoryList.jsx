import React from "react";
import { Link } from "react-router-dom";

const CategoryList = () => {
    return (
        <section className="section-shop-categories">
        <div className="line" />
        <div>
          <div>
            <div className="w-dyn-list">
              <div role="list" className="shop-categories w-dyn-items">
                <div role="listitem" className="shop-categories-item w-dyn-item">
                <Link to="/shop"
                    className="shop-categories-item-link w-inline-block"
                  >
                    <div className="shop-categories-item-text">Sofa</div>
                    <div className="shop-categories-item-text-hover">Sofa</div>
                  </Link>
                </div>
                <div role="listitem" className="shop-categories-item w-dyn-item">
                <Link to="/shop"
                    className="shop-categories-item-link w-inline-block"
                  >
                    <div className="shop-categories-item-text">Lamp</div>
                    <div className="shop-categories-item-text-hover">Lamp</div>
                  </Link>
                </div>
                <div role="listitem" className="shop-categories-item w-dyn-item">
                <Link to="/shop"
                    className="shop-categories-item-link w-inline-block"
                  >
                    <div className="shop-categories-item-text">Chair</div>
                    <div className="shop-categories-item-text-hover">Chair</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="line" />
      </section>
    )
}

export default CategoryList;