import { memo } from "react";
import Store from "./Store";
import PropTypes from "prop-types";

const Stores = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch bg-background-default flex flex-col items-start justify-start max-w-full text-left text-77xl text-background-primary font-heading-large ${className}`}
    >
      <div className="self-stretch h-px relative bg-border-default" />
      <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
        <div className="w-[1600px] flex flex-col items-start justify-start py-32 px-0 box-border gap-20 max-w-full gap-10 mq825:pt-[83px] mq825:pb-[83px] mq825:box-border gap-5">
          <h1 className="m-0 w-[627.5px] relative text-inherit leading-[106px] font-normal font-inherit inline-block max-w-full mq825:text-29xl mq825:leading-[63px] mq450:text-10xl mq450:leading-[42px]">
            Our Stores
          </h1>
          <div className="self-stretch flex flex-row items-start justify-between max-w-full gap-5 text-17xl mq1575:flex-wrap">
            <Store
              image="/image-9@2x.png"
              hamburg="Hamburg"
              hamburg1="22765 Hamburg"
              seeAll="Get Directions"
            />
            <Store
              image="/image-91@2x.png"
              hamburg="Lisbon"
              propDisplay="inline-block"
              propMinWidth="103px"
              hamburg1="1049 Lisbon"
              seeAll="Get Directions"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

Stores.propTypes = {
  className: PropTypes.string,
};

export default Stores;
