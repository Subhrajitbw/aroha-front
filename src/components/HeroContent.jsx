import { memo } from "react";
import PropTypes from "prop-types";

const HeroContent = memo(({ className = "" }) => {
  return (
    <section
      className={`w-[1200px] flex flex-col items-start justify-start gap-16 max-w-full text-center text-base text-background-primary font-nav-item gap-8 gap-4 ${className}`}
    >
      <div className="self-stretch flex flex-row items-start justify-center pt-0 px-5 pb-16 text-201xl font-heading-large">
        <h1 className="m-0 w-[894px] relative text-inherit leading-[100%] uppercase font-normal font-inherit inline-block mq450:text-36xl mq450:leading-[88px] mq825:text-69xl mq825:leading-[132px]">
          Journal
        </h1>
      </div>
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
          <h1 className="m-0 self-stretch relative text-109xl leading-[110%] font-normal font-heading-large mq450:text-13xl mq450:leading-[56px] mq825:text-32xl mq825:leading-[84px]">
            Interior Design Trends 2022
          </h1>
          <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-xl">
            <div className="w-[800px] relative leading-[180%] inline-block shrink-0 max-w-full mq450:text-base mq450:leading-[29px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Fermentum dui faucibus in ornare quam viverra orci sagittis. Nisi
              est sit amet facilisis magna. Odio tempor orci dapibus ultrices in
              iaculis.
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-row items-start justify-start pt-0 px-0 pb-8 box-border max-w-full">
        <img
          className="h-[600px] flex-1 relative rounded-[793.33px] max-w-full overflow-hidden object-cover"
          loading="lazy"
          alt=""
          src="/image21@2x.png"
        />
      </div>
      <div className="self-stretch h-[228px] flex flex-row items-start justify-center pt-0 px-5 pb-8 box-border">
        <div className="self-stretch w-px relative bg-background-primary" />
      </div>
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
          <h1 className="m-0 self-stretch relative text-109xl leading-[141px] font-normal font-heading-large mq450:text-13xl mq450:leading-[56px] mq825:text-32xl mq825:leading-[84px]">
            Minimal Interior
          </h1>
          <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-xl">
            <div className="w-[800px] relative leading-[180%] inline-block shrink-0 max-w-full mq450:text-base mq450:leading-[29px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Fermentum dui faucibus in ornare quam viverra orci sagittis. Nisi
              est sit amet facilisis magna. Odio tempor orci dapibus ultrices in
              iaculis.
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-row items-start justify-start pt-0 px-0 pb-8 box-border max-w-full">
        <img
          className="h-[600px] flex-1 relative rounded-[793.33px] max-w-full overflow-hidden object-cover"
          loading="lazy"
          alt=""
          src="/image-14@2x.png"
        />
      </div>
      <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
        <div className="w-[1000px] flex flex-col items-start justify-start gap-4 max-w-full">
          <div className="self-stretch h-[312px] flex flex-row items-start justify-center py-0 px-5 box-border text-left">
            <div className="self-stretch w-[252px] flex flex-col items-start justify-start gap-24 gap-12">
              <div className="self-stretch flex-1 flex flex-row items-start justify-center py-0 px-5">
                <div className="self-stretch w-px relative bg-background-primary" />
              </div>
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
          </div>
          <h1 className="m-0 self-stretch relative text-109xl leading-[110%] font-normal font-heading-large z-[3] mq450:text-13xl mq450:leading-[56px] mq825:text-32xl mq825:leading-[84px]">
            Design in the Future
          </h1>
          <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-xl">
            <div className="w-[800px] relative leading-[180%] inline-block shrink-0 max-w-full mq450:text-base mq450:leading-[29px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Fermentum dui faucibus in ornare quam viverra orci sagittis. Nisi
              est sit amet facilisis magna. Odio tempor orci dapibus ultrices in
              iaculis.
            </div>
          </div>
        </div>
      </div>
      <img
        className="self-stretch h-[600px] relative rounded-[793.33px] max-w-full overflow-hidden shrink-0 object-cover"
        loading="lazy"
        alt=""
        src="/image-22@2x.png"
      />
    </section>
  );
});

HeroContent.propTypes = {
  className: PropTypes.string,
};

export default HeroContent;
