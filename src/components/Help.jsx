import { memo } from "react";
import Column from "./Column";
import PropTypes from "prop-types";

const Help = memo(({ className = "" }) => {
  return (
    <div
      className={`self-stretch bg-background-default flex flex-col items-start justify-start max-w-full text-left text-77xl text-background-primary font-heading-large ${className}`}
    >
      <div className="self-stretch h-px relative bg-border-default" />
      <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
        <div className="w-[1600px] flex flex-row items-start justify-start py-32 px-0 box-border gap-20 max-w-full gap-10 gap-5 mq450:pt-[83px] mq450:pb-[83px] mq450:box-border mq1325:flex-wrap">
          <h1 className="m-0 flex-1 relative text-inherit leading-[106px] font-normal font-inherit inline-block min-w-[184px] max-w-full mq800:text-29xl mq800:leading-[63px] mq450:text-10xl mq450:leading-[42px]">
            Help?
          </h1>
          <div className="w-[1006px] flex flex-row items-start justify-between min-w-[1006px] max-w-full gap-5 text-17xl mq1125:flex-wrap mq1125:min-w-full mq1325:flex-1">
            <Column localStores="Local Stores" seeAll="Find a Store" />
            <Column localStores="Questions?" seeAll="Read the FAQ" />
          </div>
        </div>
      </div>
    </div>
  );
});

Help.propTypes = {
  className: PropTypes.string,
};

export default Help;
