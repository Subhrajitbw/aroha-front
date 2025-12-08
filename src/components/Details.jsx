import { memo } from "react";
import PropTypes from "prop-types";

const Details = memo(({ className = "" }) => {
  return (
    <div
      className={`absolute top-[0px] left-[960px] bg-background-default w-[960px] flex flex-col items-center justify-start pt-16 px-5 pb-[196px] box-border gap-16 max-w-full z-[3] text-left text-17xl text-background-primary font-heading-large ${className}`}
    >
      <div className="w-[640px] flex flex-row items-start justify-center py-0 pl-0 pr-px box-border max-w-full text-base font-nav-item">
        <a className="[text-decoration:none] relative tracking-[1px] uppercase font-medium text-[inherit] inline-block min-w-[55px]">
          Close
        </a>
      </div>
      <div className="w-[640px] flex flex-col items-start justify-start gap-6 max-w-full">
        <h1 className="m-0 w-[476px] relative text-inherit leading-[40px] font-normal font-inherit inline-block max-w-full mq450:text-3xl mq450:leading-[24px] mq767:text-10xl mq767:leading-[32px]">
          Details
        </h1>
        <div className="self-stretch relative text-lg leading-[160%] font-nav-item">
          <p className="m-0">{`Mauris cursus mattis molestie a iaculis at erat pellentesque adipiscing. Netus et malesuada fames ac turpis egestas integer eget. A diam maecenas sed enim ut sem viverra aliquet eget. Vel fringilla est ullamcorper eget nulla facilisi etiam. Velit egestas dui id ornare arcu odio ut. Felis donec et odio pellentesque diam volutpat commodo sed egestas. `}</p>
          <p className="m-0">&nbsp;</p>
          <ul className="m-0 font-inherit text-inherit pl-6">
            <li className="mb-0">
              Proin fermentum leo vel orci porta non pulvinar
            </li>
            <li className="mb-0">{`Diam phasellus vestibulum `}</li>
            <li>Quisque egestas diam in arcu cursus</li>
          </ul>
        </div>
      </div>
      <div className="w-[640px] h-px relative bg-border-default max-w-full" />
      <div className="w-[640px] flex flex-col items-start justify-start gap-6 max-w-full">
        <h1 className="m-0 w-[476px] relative text-inherit leading-[40px] font-normal font-inherit inline-block max-w-full mq450:text-3xl mq450:leading-[24px] mq767:text-10xl mq767:leading-[32px]">
          Delivery
        </h1>
        <div className="self-stretch relative text-lg leading-[160%] font-nav-item">
          Mauris cursus mattis molestie a iaculis at erat pellentesque
          adipiscing. Netus et malesuada fames ac turpis egestas integer eget. A
          diam maecenas sed enim ut sem viverra aliquet eget. Vel fringilla est
          ullamcorper eget nulla facilisi etiam.
        </div>
      </div>
      <div className="w-[640px] h-px relative bg-border-default max-w-full" />
      <div className="w-[640px] flex flex-col items-start justify-start gap-6 max-w-full">
        <h1 className="m-0 self-stretch relative text-inherit leading-[40px] font-normal font-inherit mq450:text-3xl mq450:leading-[24px] mq767:text-10xl mq767:leading-[32px]">
          Returns
        </h1>
        <div className="self-stretch relative text-lg leading-[160%] font-nav-item">{`Mauris cursus mattis molestie a iaculis at erat pellentesque adipiscing. Netus et malesuada fames ac turpis egestas integer eget. `}</div>
      </div>
    </div>
  );
});

Details.propTypes = {
  className: PropTypes.string,
};

export default Details;
