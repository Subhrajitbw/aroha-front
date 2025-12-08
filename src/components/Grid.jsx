import { memo } from "react";
import PropTypes from "prop-types";

const Grid = memo(({ className = "" }) => {
  return (
    <div
      className={`w-[1600px] overflow-x-auto flex flex-row items-start justify-start gap-16 max-w-full text-center text-45xl text-text-inverse font-heading-large gap-8 gap-4 ${className}`}
    >
      <div className="h-[490px] flex-1 relative rounded-981xl overflow-hidden shrink-0 max-w-full">
        <img
          className="absolute top-[-251px] left-[-4px] w-[504px] h-[756px] object-cover"
          loading="lazy"
          alt=""
          src="/nathanvanegmond0iwypllbhiaunsplash-1@2x.png"
        />
        <div className="absolute h-full w-full top-[0px] right-[-0.3px] bottom-[0px] left-[0px] bg-darkslategray-500 z-[1]" />
        <h1 className="m-0 absolute top-[213px] left-[161px] text-inherit leading-[100%] uppercase font-normal font-inherit z-[2] mq825:text-32xl mq825:leading-[51px] mq450:text-19xl mq450:leading-[38px]">
          Oslo
        </h1>
      </div>
      <div className="h-[490px] flex-1 relative rounded-981xl overflow-hidden shrink-0 max-w-full">
        <img
          className="absolute top-[-219px] left-[-21.7px] w-[532px] h-[709px] object-cover"
          loading="lazy"
          alt=""
          src="/nathanvanegmond0iwypllbhiaunsplash-11@2x.png"
        />
        <div className="absolute h-full w-full top-[0px] right-[-0.3px] bottom-[0px] left-[0px] bg-darkslategray-500 z-[1]" />
        <h1 className="m-0 absolute top-[181px] left-[162.3px] text-inherit leading-[100%] uppercase font-normal font-inherit z-[2] mq825:text-32xl mq825:leading-[51px] mq450:text-19xl mq450:leading-[38px]">
          <p className="m-0">NEw</p>
          <p className="m-0">York</p>
        </h1>
      </div>
      <div className="h-[490px] flex-1 relative rounded-981xl overflow-hidden shrink-0 max-w-full">
        <img
          className="absolute top-[-162px] left-[-29.3px] w-[519px] h-[777px] object-cover"
          loading="lazy"
          alt=""
          src="/nathanvanegmond0iwypllbhiaunsplash-12@2x.png"
        />
        <div className="absolute h-full w-full top-[0px] right-[-0.3px] bottom-[0px] left-[0px] bg-darkslategray-500 z-[1]" />
        <h1 className="m-0 absolute top-[213px] left-[135.7px] text-inherit leading-[100%] uppercase font-normal font-inherit z-[2] mq825:text-32xl mq825:leading-[51px] mq450:text-19xl mq450:leading-[38px]">
          Lisbon
        </h1>
      </div>
    </div>
  );
});

Grid.propTypes = {
  className: PropTypes.string,
};

export default Grid;
