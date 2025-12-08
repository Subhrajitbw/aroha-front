import { memo } from "react";
import Row from "./Row";
import Button from "./Button";
import PropTypes from "prop-types";

const FrameComponent4 = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-center pt-0 px-5 pb-32 box-border max-w-full text-left text-17xl text-background-primary font-heading-large mq450:pb-[54px] mq450:box-border mq825:pb-[83px] mq825:box-border ${className}`}
    >
      <div className="w-[1600px] flex flex-row items-start justify-between max-w-full gap-5 mq1575:flex-wrap">
        <div className="w-[314px] flex flex-col items-start justify-start gap-12 gap-6">
          <h1 className="m-0 relative text-inherit leading-[40px] uppercase font-normal font-inherit inline-block min-w-[126px] mq450:text-3xl mq450:leading-[24px] mq825:text-10xl mq825:leading-[32px]">
            Social
          </h1>
          <div className="self-stretch flex flex-col items-start justify-start py-0 pl-0 pr-5 gap-6 text-base font-nav-item">
            <div className="relative tracking-[1px] uppercase inline-block min-w-[91px]">
              Instagram
            </div>
            <div className="relative tracking-[1px] uppercase inline-block min-w-[88px]">
              Facebook
            </div>
            <div className="relative tracking-[1px] uppercase inline-block min-w-[68px]">
              Twitter
            </div>
          </div>
        </div>
        <div className="w-[314px] flex flex-col items-start justify-start gap-12 gap-6">
          <h1 className="m-0 relative text-inherit leading-[40px] uppercase font-normal font-inherit mq450:text-3xl mq450:leading-[24px] mq825:text-10xl mq825:leading-[32px]">
            Contact
          </h1>
          <div className="self-stretch flex flex-col items-start justify-start py-0 pl-0 pr-5 gap-6 text-base font-nav-item">
            <div className="relative tracking-[1px] uppercase whitespace-nowrap">
              info@example.com
            </div>
            <div className="relative tracking-[1px] uppercase inline-block min-w-[118px] whitespace-nowrap">
              +49 123 456 78
            </div>
          </div>
        </div>
        <div className="w-[780px] flex flex-col items-start justify-start gap-12 max-w-full text-base font-nav-item gap-6">
          <Row name1="Name" namePlaceholder="Name" />
          <Row
            name1="Email"
            namePlaceholder="Email Address"
            propWidth="108px"
          />
          <div className="self-stretch flex flex-col items-start justify-start gap-4">
            <div className="relative tracking-[1px] uppercase font-medium inline-block min-w-[79px]">
              Message
            </div>
            <textarea
              className="border-background-primary border-[1px] border-solid bg-text-inverse h-[200px] w-auto [outline:none] self-stretch box-border flex flex-col items-start justify-start py-4 px-6 font-nav-item text-lg text-darkslategray-200"
              placeholder="Your Message"
              rows={10}
              cols={39}
            />
          </div>
          <Button
            propBorder="none"
            bUtton="Submit Message"
            propMinWidth="unset"
            propColor="#fff"
            buttonBackgroundColor="#343339"
            bUttonDisplay="unset"
          />
        </div>
      </div>
    </section>
  );
});

FrameComponent4.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent4;
