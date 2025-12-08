import { memo } from "react";
import PropTypes from "prop-types";

const Product2 = memo(({ className = "", image, elegantLamp, uSD }) => {
  return (
    <div
      className={`h-[811px] w-[484px] flex flex-col items-center justify-start gap-8 max-w-full text-left text-xl text-background-primary font-nav-item gap-4 ${className}`}
    >
      <img
        className="self-stretch flex-1 relative rounded-481xl max-w-full overflow-hidden max-h-full object-cover"
        loading="lazy"
        alt=""
        src={image}
      />
      <div className="flex flex-col items-center justify-start gap-2">
        <div className="h-[25px] relative tracking-[1px] uppercase font-medium inline-block whitespace-nowrap mq450:text-base">
          {elegantLamp}
        </div>
        <div className="relative text-base tracking-[1px] uppercase font-medium inline-block min-w-[106px]">
          {uSD}
        </div>
      </div>
    </div>
  );
});

Product2.propTypes = {
  className: PropTypes.string,
  image: PropTypes.string,
  elegantLamp: PropTypes.string,
  uSD: PropTypes.string,
};

export default Product2;
