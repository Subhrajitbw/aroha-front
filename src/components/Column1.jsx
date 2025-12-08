import { memo } from "react";
import ButtonText from "./ButtonText";
import PropTypes from "prop-types";

const Column1 = memo(({ className = "", localStores, seeAll }) => {
  return (
    <div
      className={`w-[455px] flex flex-col items-start justify-start py-0 pl-0 pr-[55px] box-border gap-12 max-w-full text-left text-17xl text-background-primary font-heading-large gap-6 mq450:pr-[27px] mq450:box-border ${className}`}
    >
      <h1 className="m-0 relative text-inherit leading-[40px] font-normal font-inherit mq450:text-3xl mq450:leading-[24px] mq800:text-10xl mq800:leading-[32px]">
        {localStores}
      </h1>
      <div className="self-stretch flex flex-col items-start justify-start gap-8 text-lg font-nav-item gap-4">
        <div className="self-stretch relative leading-[180%]">
          Proin fermentum leo vel orci porta non pulvinar. Diam phasellus
          vestibulum lorem sed risus ultricies.
        </div>
        <ButtonText
          seeAll={seeAll}
          seeAllDisplay="inline-block"
          seeAllMinWidth="119px"
          seeAllTextDecoration="unset"
        />
      </div>
    </div>
  );
});

Column1.propTypes = {
  className: PropTypes.string,
  localStores: PropTypes.string,
  seeAll: PropTypes.string,
};

export default Column1;
