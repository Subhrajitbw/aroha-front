import { memo } from "react";
import Badge from "./Badge";
import Product from "./Product";
import PropTypes from "prop-types";

const FrameComponent1 = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-center pt-0 pb-32 pl-[22px] pr-5 box-border max-w-full text-left text-109xl text-background-primary font-heading-large mq825:pb-[54px] mq825:box-border mq1250:pb-[83px] mq1250:box-border ${className}`}
    >
      <div className="flex flex-col items-center justify-start gap-24 max-w-full gap-12 gap-6">
        <h1 className="m-0 w-[501px] relative text-inherit leading-[141px] font-normal font-inherit inline-block max-w-full mq825:text-32xl mq825:leading-[84px] mq450:text-13xl mq450:leading-[56px]">
          Featured
        </h1>
        <div className="w-[1600px] h-[811px] overflow-x-auto shrink-0 flex flex-row items-start justify-between gap-5 max-w-full text-xl font-nav-item">
          <div className="self-stretch w-[484px] shrink-0 flex flex-col items-center justify-start relative gap-8 max-w-full gap-4">
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
              <div className="relative text-base tracking-[1px] uppercase font-medium inline-block min-w-[110px]">
                $ 249.00 USD
              </div>
            </div>
            <Badge />
          </div>
          <Product
            image="/image-1@2x.png"
            elegantLamp="Elegant Lamp"
            uSD="$ 129.00 USD"
          />
          <Product
            image="/image-11@2x.png"
            propWidth="133px"
            elegantLamp="Black Chair"
            uSD="$ 199.00 USD"
          />
        </div>
      </div>
    </section>
  );
});

FrameComponent1.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent1;
