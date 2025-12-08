import { memo } from "react";
import PropTypes from "prop-types";

const RoomHeader = memo(({ className = "" }) => {
  return (
    <div
      className={`self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-center text-141xl text-background-primary font-heading-large ${className}`}
    >
      <div className="w-[479px] flex flex-col items-end justify-start gap-8 max-w-full gap-4">
        <h1 className="m-0 self-stretch relative text-inherit leading-[120%] font-normal font-inherit mq825:text-45xl mq825:leading-[115px] mq450:text-21xl mq450:leading-[77px]">
          Rooms
        </h1>
        <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 text-left text-base font-nav-item">
          <div className="flex flex-row items-start justify-start gap-4">
            <div className="relative tracking-[0.1em] uppercase font-medium inline-block min-w-[68px] whitespace-nowrap">
              See All
            </div>
            <div className="flex flex-col items-start justify-start pt-[7.5px] px-0 pb-0">
              <div className="w-[30.5px] h-[5px] relative">
                <div className="absolute top-[2px] left-[0px] bg-background-primary w-[30px] h-px" />
                <img
                  className="absolute top-[0px] left-[28px] w-[2.5px] h-[5px] z-[1]"
                  loading="lazy"
                  alt=""
                  src="/arrow.svg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

RoomHeader.propTypes = {
  className: PropTypes.string,
};

export default RoomHeader;
