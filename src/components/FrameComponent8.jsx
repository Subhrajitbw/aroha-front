import { memo } from "react";
import Header from "./Header";
import PropTypes from "prop-types";

const FrameComponent8 = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-end py-0 px-[60px] box-border max-w-full text-center text-201xl text-background-primary font-heading-large mq1125:pl-[30px] mq1125:pr-[30px] mq1125:box-border ${className}`}
    >
      <div className="flex-1 flex flex-col items-start justify-start gap-24 max-w-full gap-12 gap-6">
        <Header
          menuToggleFlex="unset"
          menuToggleAlignSelf="stretch"
          navbarLeftWidth="400px"
          lookbookColor="#343339"
          slveColor="#343339"
          navbarRightWidth="400px"
          shopColor="#343339"
          cartColor="#343339"
          frameDivBackgroundColor="#343339"
          frameDivHeight="unset"
          aAlignSelf="unset"
          aColor="#fff"
          lineBackgroundColor="#343339"
          lineBackgroundColor1="#343339"
          headerPosition="unset"
          headerTop="unset"
          headerLeft="unset"
          headerWidth="unset"
          headerPadding="unset"
          lookbookTextDecoration="none"
          shopMinWidth="46px"
          shopHeight="unset"
          shopWidth="unset"
          gridWidth="unset"
          cartMinWidth="43px"
          cartHeight="unset"
          cartFlex="unset"
          frameDivWidth="unset"
          aTextDecoration="unset"
          aMinWidth="8px"
          aHeight="unset"
        />
        <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
          <div className="w-[1600px] flex flex-col items-start justify-start gap-4 max-w-full">
            <h1 className="m-0 w-[440px] relative text-inherit leading-[100%] font-normal font-inherit inline-block max-w-full mq800:text-69xl mq800:leading-[132px] mq450:text-36xl mq450:leading-[88px]">
              Oslo
            </h1>
            <div className="self-stretch flex flex-row items-start justify-between max-w-full gap-5 text-left text-5xl font-nav-item mq1125:flex-wrap mq1125:justify-center">
              <h3 className="m-0 w-[660px] relative text-inherit leading-[170%] font-normal font-inherit inline-block shrink-0 max-w-full mq450:text-lgi mq450:leading-[33px]">{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed faucibus turpis in eu mi bibendum neque. `}</h3>
              <div className="flex flex-col items-start justify-start pt-[103px] px-0 pb-0 text-base">
                <div className="flex flex-row items-start justify-start gap-3.5">
                  <div className="relative tracking-[0.1em] uppercase font-medium inline-block min-w-[65px]">
                    Rooms
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
        </div>
      </div>
    </section>
  );
});

FrameComponent8.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent8;
