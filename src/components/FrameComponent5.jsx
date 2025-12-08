import { memo } from "react";
import PropTypes from "prop-types";

const FrameComponent5 = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-32 box-border gap-32 max-w-full text-center text-base text-background-primary font-nav-item gap-16 gap-8 mq800:pb-[54px] mq800:box-border mq1325:pb-[83px] mq1325:box-border ${className}`}
    >
      <div className="self-stretch h-px relative bg-border-default" />
      <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
        <div className="w-[1200px] flex flex-col items-start justify-start gap-16 max-w-full gap-4 gap-8">
          <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
            <div className="w-[1000px] flex flex-col items-start justify-start gap-4 max-w-full">
              <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 text-left">
                <div className="flex flex-row items-start justify-start gap-[23px]">
                  <div className="relative tracking-[1px] uppercase font-medium inline-block min-w-[65px]">
                    Trends
                  </div>
                  <div className="flex flex-col items-start justify-start pt-[9.5px] px-0 pb-0">
                    <div className="w-[30px] h-px relative bg-background-primary" />
                  </div>
                  <div className="relative tracking-[1px] uppercase font-medium inline-block min-w-[111px]">
                    July 21, 2022
                  </div>
                </div>
              </div>
              <h1 className="m-0 self-stretch relative text-109xl leading-[141px] font-normal font-heading-large mq450:text-13xl mq450:leading-[56px] mq800:text-32xl mq800:leading-[84px]">
                Minimal Interior
              </h1>
              <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-xl">
                <div className="w-[800px] relative leading-[180%] inline-block shrink-0 max-w-full mq450:text-base mq450:leading-[29px]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Fermentum dui faucibus in ornare quam viverra orci sagittis.
                  Nisi est sit amet facilisis magna. Odio tempor orci dapibus
                  ultrices in iaculis.
                </div>
              </div>
            </div>
          </div>
          <img
            className="self-stretch h-[600px] relative rounded-[793.33px] max-w-full overflow-hidden shrink-0 object-cover"
            loading="lazy"
            alt=""
            src="/image-14@2x.png"
          />
        </div>
      </div>
    </section>
  );
});

FrameComponent5.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent5;
