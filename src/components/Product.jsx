import { memo, useMemo } from "react";
import PropTypes from "prop-types";

const Product = memo(
  ({ className = "", image, propWidth, elegantLamp, uSD }) => {
    const gridStyle = useMemo(() => {
      return {
        width: propWidth,
      };
    }, [propWidth]);

    return (
      <div
        className={`self-stretch w-[484px] shrink-0 flex flex-col items-center justify-start gap-8 max-w-full text-left text-xl text-background-primary font-nav-item gap-4 ${className}`}
      >
        <img
          className="self-stretch flex-1 relative rounded-481xl max-w-full overflow-hidden max-h-full object-cover"
          loading="lazy"
          alt=""
          src={image}
        />
        <div
          className="w-[149px] flex flex-col items-center justify-start gap-2"
          style={gridStyle}
        >
          <div className="self-stretch h-[25px] relative tracking-[1px] uppercase font-medium inline-block whitespace-nowrap mq450:text-base">
            {elegantLamp}
          </div>
          <div className="relative text-base tracking-[1px] uppercase font-medium inline-block min-w-[105px]">
            {uSD}
          </div>
        </div>
      </div>
    );
  }
);

Product.propTypes = {
  className: PropTypes.string,
  image: PropTypes.string,
  elegantLamp: PropTypes.string,
  uSD: PropTypes.string,

  /** Style props */
  propWidth: PropTypes.any,
};

export default Product;
