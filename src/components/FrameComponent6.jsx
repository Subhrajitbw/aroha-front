import { memo, useMemo } from "react";
import Header from "./Header";
import PropTypes from "prop-types";

const FrameComponent6 = memo(
  ({ className = "", image, oslo, heroDescriptionWidth }) => {
    const osloStyle = useMemo(() => {
      return {
        width: heroDescriptionWidth,
      };
    }, [heroDescriptionWidth]);

    return (
      <section
        className={`self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-[155px] box-border gap-24 max-w-full text-center text-201xl text-background-primary font-heading-large gap-6 mq800:pb-[43px] mq800:box-border gap-12 mq1325:pb-[66px] mq1325:box-border ${className}`}
      >
        <header className="self-stretch flex flex-row items-start justify-start py-0 px-[60px] box-border max-w-full mq1125:pl-[30px] mq1125:pr-[30px] mq1125:box-border">
          <Header
            menuToggleFlex="1"
            menuToggleAlignSelf="unset"
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
        </header>
        <div className="self-stretch flex flex-row items-start justify-start max-w-full">
          <div className="w-[1920px] flex flex-col items-start justify-start pt-[487px] px-0 pb-0 box-border max-w-full mq800:pt-[134px] mq800:box-border mq1325:pt-[206px] mq1325:box-border">
            <img
              className="self-stretch relative max-w-full overflow-hidden max-h-full object-cover"
              loading="lazy"
              alt=""
              src={image}
            />
          </div>
          <div className="w-[1600px] flex flex-col items-start justify-start gap-4 max-w-full ml-[-1760px]">
            <h1
              className="m-0 w-[440px] relative text-inherit leading-[100%] font-normal font-inherit inline-block max-w-full mq800:text-69xl mq800:leading-[132px] mq450:text-36xl mq450:leading-[88px]"
              style={osloStyle}
            >
              {oslo}
            </h1>
            <div className="self-stretch flex flex-row items-start justify-between max-w-full gap-5 text-left text-5xl font-nav-item mq800:flex-wrap mq800:justify-center">
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
      </section>
    );
  }
);

FrameComponent6.propTypes = {
  className: PropTypes.string,
  image: PropTypes.string,
  oslo: PropTypes.string,

  /** Style props */
  heroDescriptionWidth: PropTypes.any,
};

export default FrameComponent6;
