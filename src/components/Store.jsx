import { memo, useMemo } from "react";
import ButtonText from "./ButtonText";
import PropTypes from "prop-types";

const Store = memo(
  ({
    className = "",
    image,
    hamburg,
    propDisplay,
    propMinWidth,
    hamburg1,
    seeAll,
  }) => {
    const hamburgStyle = useMemo(() => {
      return {
        display: propDisplay,
        minWidth: propMinWidth,
      };
    }, [propDisplay, propMinWidth]);

    return (
      <div
        className={`w-[752px] flex flex-row items-center justify-start gap-12 max-w-full text-left text-17xl text-background-primary font-heading-large mq825:flex-wrap gap-6 ${className}`}
      >
        <img
          className="h-[300px] w-[300px] relative rounded-481xl overflow-hidden shrink-0 object-cover mq825:flex-1"
          loading="lazy"
          alt=""
          src={image}
        />
        <div className="flex-1 flex flex-col items-start justify-start py-5 pl-0 pr-[215px] box-border gap-6 min-w-[263px] max-w-full mq450:pr-5 mq450:box-border">
          <h1
            className="m-0 relative text-inherit leading-[40px] font-normal font-inherit mq825:text-10xl mq825:leading-[32px] mq450:text-3xl mq450:leading-[24px]"
            style={hamburgStyle}
          >
            {hamburg}
          </h1>
          <div className="relative text-lg leading-[160%] font-nav-item">
            <p className="m-0">{`AROHA Store, `}</p>
            <p className="m-0">{hamburg1}</p>
          </div>
          <ButtonText
            seeAll={seeAll}
            seeAllDisplay="unset"
            seeAllMinWidth="unset"
            seeAllTextDecoration="unset"
          />
        </div>
      </div>
    );
  }
);

Store.propTypes = {
  className: PropTypes.string,
  image: PropTypes.string,
  hamburg: PropTypes.string,
  hamburg1: PropTypes.string,
  seeAll: PropTypes.string,

  /** Style props */
  propDisplay: PropTypes.any,
  propMinWidth: PropTypes.any,
};

export default Store;
