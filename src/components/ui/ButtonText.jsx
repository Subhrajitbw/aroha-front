import { memo, useMemo } from "react";
import PropTypes from "prop-types";

const ButtonText = memo(
  ({
    className = "",
    seeAll,
    seeAllDisplay,
    seeAllMinWidth,
    seeAllTextDecoration,
  }) => {
    const seeAllStyle = useMemo(() => {
      return {
        display: seeAllDisplay,
        minWidth: seeAllMinWidth,
        textDecoration: seeAllTextDecoration,
      };
    }, [seeAllDisplay, seeAllMinWidth, seeAllTextDecoration]);

    return (
      <div
        className={`flex flex-row items-center justify-start gap-4 text-left text-base text-background-primary font-nav-item ${className}`}
      >
        <div
          className="relative tracking-[0.1em] uppercase font-medium whitespace-nowrap"
          style={seeAllStyle}
        >
          {seeAll}
        </div>
        <div className="h-[5px] w-[30.5px] relative">
          <div className="absolute top-[2px] left-[0px] bg-background-primary w-[30px] h-px" />
          <img
            className="absolute top-[0px] left-[28px] w-[2.5px] h-[5px] z-[1]"
            loading="lazy"
            alt=""
            src="/arrow.svg"
          />
        </div>
      </div>
    );
  }
);

ButtonText.propTypes = {
  className: PropTypes.string,
  seeAll: PropTypes.string,

  /** Style props */
  seeAllDisplay: PropTypes.any,
  seeAllMinWidth: PropTypes.any,
  seeAllTextDecoration: PropTypes.any,
};

export default ButtonText;
