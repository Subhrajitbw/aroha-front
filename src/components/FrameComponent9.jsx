import { memo } from "react";
import PropTypes from "prop-types";

const FrameComponent9 = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-start pt-0 px-0 pb-[27px] box-border max-w-full text-left text-xl text-background-primary font-nav-item ${className}`}
    >
      <div className="flex-1 overflow-hidden flex flex-col items-end justify-start pt-[718px] pb-[736px] pl-[745px] pr-[823px] box-border relative gap-[386px] max-w-full gap-24 mq800:pt-[198px] mq800:pb-[202px] mq800:pl-[186px] mq800:pr-[205px] mq800:box-border gap-[193px] mq1125:pt-[304px] mq1125:pb-[311px] mq1125:pl-[372px] mq1125:pr-[411px] mq1125:box-border mq1325:pt-[467px] mq1325:pb-[478px] mq1325:box-border">
        <img
          className="w-[1960px] h-[2939.6px] absolute !m-[0] top-[-940px] left-[calc(50%_-_980px)] object-cover"
          alt=""
          src="/nathanvanegmond0iwypllbhiaunsplash-14@2x.png"
        />
        <div className="w-12 h-12 rounded-181xl bg-darkslategray-100 flex flex-row items-center justify-start p-4 box-border z-[1]">
          <div className="h-4 w-4 relative rounded-181xl bg-background-primary overflow-hidden shrink-0 hidden" />
        </div>
        <div className="self-stretch flex flex-row items-start justify-end py-0 pl-0 pr-[21px] box-border max-w-full">
          <div className="flex-1 rounded-181xl bg-text-inverse flex flex-row flex-wrap items-center justify-start py-4 pl-4 pr-8 box-border gap-4 max-w-full z-[1]">
            <img
              className="h-20 w-20 relative rounded-181xl overflow-hidden shrink-0 object-cover"
              loading="lazy"
              alt=""
              src="/image7@2x.png"
            />
            <div className="flex-1 flex flex-row items-center justify-between min-w-[122px] gap-5">
              <div className="flex flex-col items-start justify-start gap-1">
                <div className="h-[25px] relative tracking-[1px] uppercase font-medium inline-block whitespace-nowrap mq450:text-base">
                  Single Sofa
                </div>
                <div className="relative text-base tracking-[1px] uppercase font-medium inline-block min-w-[101px]">
                  $ 68.00 USD
                </div>
              </div>
              <img
                className="h-6 w-6 relative overflow-hidden shrink-0"
                loading="lazy"
                alt=""
                src="/icon.svg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FrameComponent9.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent9;
