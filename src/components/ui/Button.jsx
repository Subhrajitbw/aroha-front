import { memo, useMemo } from "react";
import PropTypes from "prop-types";

const Button = memo(
  ({
    className = "",
    propBorder,
    bUtton,
    propMinWidth,
    propColor,
    buttonBackgroundColor,
    bUttonDisplay,
  }) => {
    const buttonStyle = useMemo(() => {
      return {
        border: propBorder,
        backgroundColor: buttonBackgroundColor,
      };
    }, [propBorder, buttonBackgroundColor]);

    const bUttonStyle = useMemo(() => {
      return {
        minWidth: propMinWidth,
        color: propColor,
        display: bUttonDisplay,
      };
    }, [propMinWidth, propColor, bUttonDisplay]);

    return (
      <button
        className={`cursor-pointer border-text-inverse border-[1px] border-solid py-[22px] px-[39px] bg-[transparent] rounded-481xl overflow-hidden flex flex-row items-start justify-start z-[2] hover:bg-gainsboro-200 hover:border-gainsboro-100 hover:border-[1px] hover:border-solid hover:box-border ${className}`}
        style={buttonStyle}
      >
        <div
          className="relative text-base tracking-[0.1em] uppercase font-medium font-nav-item text-text-inverse text-left inline-block min-w-[77px]"
          style={bUttonStyle}
        >
          {bUtton}
        </div>
      </button>
    );
  }
);

Button.propTypes = {
  className: PropTypes.string,
  bUtton: PropTypes.string,

  /** Style props */
  propBorder: PropTypes.any,
  propMinWidth: PropTypes.any,
  propColor: PropTypes.any,
  buttonBackgroundColor: PropTypes.any,
  bUttonDisplay: PropTypes.any,
};

export default Button;
