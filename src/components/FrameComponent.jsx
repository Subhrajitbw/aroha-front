import { memo } from "react";
import Header from "./Header";
import Button from "./Button";
import PropTypes from "prop-types";

const FrameComponent = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-start pt-0 px-0 pb-32 box-border max-w-full text-center text-241xl text-text-inverse font-heading-large mq825:pb-[54px] mq825:box-border mq1250:pb-[83px] mq1250:box-border ${className}`}
    >
      <div className="flex-1 overflow-hidden flex flex-col items-end justify-start pt-16 px-[60px] pb-[365px] box-border relative gap-[266px] max-w-full gap-[66px] mq825:pt-[27px] mq825:pb-[154px] mq825:box-border gap-[133px] mq1250:pt-[42px] mq1250:px-[30px] mq1250:pb-[237px] mq1250:box-border">
        <img
          className="w-full h-[2879.6px] absolute !m-[0] top-[-778px] right-[0px] left-[0px] max-w-full overflow-hidden shrink-0 object-cover"
          alt=""
          src="/jeanphilippedelberghefeijcnqwkmunsplash-2@2x.png"
        />
        <div className="w-full h-full absolute !m-[0] top-[0px] right-[0px] bottom-[0px] left-[0px] bg-darkslategray-400 z-[1]" />
        <Header
          menuToggleFlex="unset"
          menuToggleAlignSelf="stretch"
          navbarLeftWidth="190px"
          lookbookColor="#fff"
          slveColor="#fff"
          navbarRightWidth="190px"
          shopColor="#fff"
          cartColor="#fff"
          frameDivBackgroundColor="#fff"
          frameDivHeight="unset"
          aAlignSelf="stretch"
          aColor="#343339"
          lineBackgroundColor="#fff"
          lineBackgroundColor1="#fff"
          headerPosition="unset"
          headerTop="unset"
          headerLeft="unset"
          headerWidth="unset"
          headerPadding="unset"
          lookbookTextDecoration="unset"
          shopMinWidth="45px"
          shopHeight="unset"
          shopWidth="unset"
          gridWidth="unset"
          cartMinWidth="46px"
          cartHeight="unset"
          cartFlex="unset"
          frameDivWidth="22px"
          aTextDecoration="none"
          aMinWidth="8px"
          aHeight="unset"
        />
        <div className="self-stretch flex flex-row items-start justify-center py-0 pl-px pr-0 box-border max-w-full">
          <div className="w-[1291px] flex flex-col items-start justify-start gap-16 max-w-full gap-8 gap-4">
            <h1 className="m-0 self-stretch relative text-inherit leading-[90%] uppercase font-normal font-inherit z-[2] mq825:text-85xl mq825:leading-[140px] mq450:text-46xl mq450:leading-[94px]">
              <p className="m-0">Design</p>
              <p className="m-0">Furniture</p>
            </h1>
            <div className="self-stretch flex flex-row items-start justify-center py-0 px-5">
              <Button
                propBorder="1px solid #fff"
                bUtton="Shop now"
                propMinWidth="96px"
                propColor="#fff"
                buttonBackgroundColor="transparent"
                bUttonDisplay="inline-block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FrameComponent.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent;
