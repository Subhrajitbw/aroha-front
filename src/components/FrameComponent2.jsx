import { memo } from "react";
import PropTypes from "prop-types";

const FrameComponent2 = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-start pt-0 px-0 pb-32 box-border max-w-full text-center text-281xl text-text-inverse font-heading-large mq825:pb-[54px] mq825:box-border mq1250:pb-[83px] mq1250:box-border ${className}`}
    >
      <div className="h-[1200px] flex-1 relative overflow-hidden max-w-full">
        <div className="absolute top-[0px] left-[0px] bg-darkslategray-400 w-full h-full z-[1]" />
        <div className="absolute top-[-607px] left-[0px] w-[1920px] h-[2414.6px]">
          <img
            className="absolute top-[0px] left-[0px] w-full h-full object-cover"
            alt=""
            src="/mksyh38huccesunsplash-2@2x.png"
          />
          <img
            className="absolute top-[500px] left-[645px] rounded-481xl w-[300px] h-[300px] overflow-hidden object-cover z-[2]"
            loading="lazy"
            alt=""
            src="/image-3@2x.png"
          />
          <img
            className="absolute top-[1241px] left-[1600px] rounded-481xl w-80 h-80 overflow-hidden object-cover z-[2]"
            loading="lazy"
            alt=""
            src="/image-4@2x.png"
          />
          <img
            className="absolute top-[781px] left-[1280px] rounded-481xl w-80 h-80 overflow-hidden object-cover z-[2]"
            loading="lazy"
            alt=""
            src="/image-5@2x.png"
          />
          <img
            className="absolute top-[1621px] left-[320px] rounded-481xl w-80 h-80 overflow-hidden object-cover z-[2]"
            loading="lazy"
            alt=""
            src="/image-6@2x.png"
          />
          <img
            className="absolute top-[1371px] left-[0px] rounded-481xl w-80 h-80 overflow-hidden object-cover z-[2]"
            loading="lazy"
            alt=""
            src="/image-7@2x.png"
          />
          <img
            className="absolute top-[724px] left-[345px] rounded-481xl w-[300px] h-[300px] overflow-hidden object-cover z-[2]"
            loading="lazy"
            alt=""
            src="/image-8@2x.png"
          />
        </div>
        <h1 className="m-0 absolute top-[465px] left-[521px] text-inherit leading-[90%] uppercase font-normal font-inherit z-[3] mq825:text-101xl mq825:leading-[162px] mq450:text-56xl mq450:leading-[108px]">
          sølve
        </h1>
      </div>
    </section>
  );
});

FrameComponent2.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent2;
