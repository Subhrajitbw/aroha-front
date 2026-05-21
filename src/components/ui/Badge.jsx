import { memo } from "react";
import PropTypes from "prop-types";

const Badge = memo(({ className = "" }) => {
  return (
    <div
      className={`w-[100px] h-[100px] !m-[0] absolute top-[20px] left-[calc(50%_+_110px)] rounded-481xl bg-background-primary flex flex-row items-center justify-center py-10 px-[30px] box-border z-[1] text-center text-base text-text-inverse font-nav-item ${className}`}
    >
      <b className="relative uppercase inline-block min-w-[39px]">New</b>
    </div>
  );
});

Badge.propTypes = {
  className: PropTypes.string,
};

export default Badge;
