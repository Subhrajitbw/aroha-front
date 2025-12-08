import { memo, useMemo } from "react";
import PropTypes from "prop-types";

const Content = memo(
  ({ className = "", doIHaveToOrderOnline, propMinWidth }) => {
    const doIHaveStyle = useMemo(() => {
      return {
        minWidth: propMinWidth,
      };
    }, [propMinWidth]);

    return (
      <section
        className={`self-stretch flex flex-row items-start justify-center pt-0 px-5 pb-[66.5px] box-border max-w-full text-left text-9xl text-background-primary font-nav-item ${className}`}
      >
        <div className="w-[1200px] flex flex-row flex-wrap items-start justify-center gap-12 max-w-full gap-6">
          <h2
            className="m-0 flex-1 relative text-inherit font-medium font-inherit inline-block min-w-[243px] max-w-full mq450:text-3xl"
            style={doIHaveStyle}
          >
            {doIHaveToOrderOnline}
          </h2>
          <div className="flex flex-col items-start justify-start pt-[5.5px] px-0 pb-0">
            <img
              className="w-6 h-6 relative overflow-hidden shrink-0"
              loading="lazy"
              alt=""
              src="/riaddfill.svg"
            />
          </div>
        </div>
      </section>
    );
  }
);

Content.propTypes = {
  className: PropTypes.string,
  doIHaveToOrderOnline: PropTypes.string,

  /** Style props */
  propMinWidth: PropTypes.any,
};

export default Content;
