import { memo } from "react";
import Badge from "./Badge";
import Product1 from "./Product1";
import PropTypes from "prop-types";

const ProductGrid = memo(({ className = "" }) => {
  return (
    <div
      className={`w-[1600px] flex flex-row flex-wrap items-start justify-start gap-x-24 gap-y-[72px] min-h-[1718px] max-w-full text-left text-xl text-background-primary font-nav-item gap-9 gap-[18px] ${className}`}
    >
      <div className="h-[811px] w-[484px] flex flex-col items-center justify-start relative gap-8 min-w-[460px] max-w-full gap-4 mq800:min-w-full">
        <img
          className="self-stretch flex-1 relative rounded-481xl max-w-full overflow-hidden max-h-full object-cover"
          loading="lazy"
          alt=""
          src="/image@2x.png"
        />
        <div className="flex flex-col items-center justify-start gap-2">
          <div className="h-[25px] relative tracking-[1px] uppercase font-medium inline-block whitespace-nowrap mq450:text-base">
            Modern Chair
          </div>
          <div className="relative text-base tracking-[1px] uppercase font-medium inline-block min-w-[111px]">
            $ 249.00 USD
          </div>
        </div>
        <Badge />
      </div>
      <Product1
        image="/image-1@2x.png"
        elegantLamp="Elegant Lamp"
        uSD="$ 129.00 USD"
      />
      <Product1
        image="/image-11@2x.png"
        elegantLamp="Black Chair"
        uSD="$ 199.00 USD"
        propMinWidth="107px"
      />
      <Product1
        image="/image-31@2x.png"
        elegantLamp="Lisbon Sofa"
        uSD="$ 1699.00 USD"
        propMinWidth="118px"
      />
      <Product1
        image="/image-41@2x.png"
        elegantLamp="Retro Chair"
        uSD="$ 399.00 USD"
        propMinWidth="112px"
      />
      <Product1
        image="/image-52@2x.png"
        elegantLamp="Black Chair"
        uSD="$ 199.00 USD"
        propMinWidth="107px"
      />
    </div>
  );
});

ProductGrid.propTypes = {
  className: PropTypes.string,
};

export default ProductGrid;
