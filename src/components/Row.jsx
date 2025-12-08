import { memo, useMemo } from "react";
import PropTypes from "prop-types";

const Row = memo(({ className = "", name1, namePlaceholder, propWidth }) => {
  const nameStyle = useMemo(() => {
    return {
      width: propWidth,
    };
  }, [propWidth]);

  return (
    <div
      className={`self-stretch flex flex-col items-start justify-start gap-4 text-left text-base text-background-primary font-nav-item ${className}`}
    >
      <div className="relative tracking-[1px] uppercase font-medium inline-block min-w-[47px]">
        {name1}
      </div>
      <div className="self-stretch bg-text-inverse border-background-primary border-[1px] border-solid flex flex-col items-start justify-start py-3.5 px-6">
        <input
          className="w-[46px] [border:none] [outline:none] font-nav-item text-lg bg-[transparent] h-[29px] relative leading-[160%] text-darkslategray-200 text-left inline-block p-0"
          placeholder={namePlaceholder}
          type="text"
          style={nameStyle}
        />
      </div>
    </div>
  );
});

Row.propTypes = {
  className: PropTypes.string,
  name1: PropTypes.string,
  namePlaceholder: PropTypes.string,

  /** Style props */
  propWidth: PropTypes.any,
};

export default Row;
