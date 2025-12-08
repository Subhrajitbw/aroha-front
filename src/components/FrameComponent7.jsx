import { memo } from "react";
import PropTypes from "prop-types";

const FrameComponent7 = memo(({ className = "", image }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-center pt-0 px-5 pb-[808px] box-border max-w-full text-left text-109xl text-background-primary font-heading-large mq800:pb-[222px] mq800:box-border mq1125:pb-[341px] mq1125:box-border mq1325:pb-[525px] mq1325:box-border ${className}`}
    >
      <div className="w-[1400px] flex flex-col items-end justify-start gap-[213px] max-w-full gap-[53px] gap-[27px] gap-[106px]">
        <div className="self-stretch flex flex-row flex-wrap items-start justify-start gap-20 max-w-full gap-10 gap-5">
          <h1 className="m-0 flex-1 relative text-inherit leading-[110%] font-normal font-inherit inline-block min-w-[429px] max-w-full mq800:text-32xl mq800:leading-[84px] mq800:min-w-full mq450:text-13xl mq450:leading-[56px]">
            <p className="m-0">Norwegian</p>
            <p className="m-0">{`Interior `}</p>
            <p className="m-0">Design</p>
          </h1>
          <h3 className="m-0 h-[774px] flex-1 relative text-5xl leading-[180%] font-normal font-nav-item inline-block min-w-[429px] max-w-full mq800:min-w-full mq450:text-lgi mq450:leading-[35px]">
            <p className="m-0">
              Mauris cursus mattis molestie a iaculis at erat pellentesque
              adipiscing. Netus et malesuada fames ac turpis egestas integer
              eget. A diam maecenas sed enim ut sem viverra aliquet eget. Vel
              fringilla est ullamcorper eget nulla facilisi etiam. Velit egestas
              dui id ornare arcu odio ut. Felis donec et odio pellentesque diam
              volutpat commodo sed egestas. Auctor eu augue ut lectus arcu
              bibendum at varius. Rhoncus mattis rhoncus urna neque viverra
              justo nec ultrices.
            </p>
            <p className="m-0">&nbsp;</p>
            <p className="m-0">
              Aenean euismod elementum nisi quis eleifend. Vitae purus faucibus
              ornare suspendisse sed nisi lacus. Mattis enim ut tellus elementum
              sagittis. Lectus quam id leo in vitae turpis. Lobortis scelerisque
              fermentum dui faucibus in ornare quam.
            </p>
            <p className="m-0">&nbsp;</p>
            <p className="m-0">
              Proin fermentum leo vel orci porta non pulvinar. Diam phasellus
              vestibulum lorem sed risus ultricies. Quisque egestas diam in arcu
              cursus. Morbi tincidunt ornare massa eget egestas. Scelerisque eu
              ultrices vitae auctor eu.
            </p>
          </h3>
        </div>
        <div className="self-stretch flex flex-row items-start justify-center py-0 pl-[21px] pr-5 box-border max-w-full text-center text-241xl">
          <div className="w-[639px] flex flex-row items-start justify-start relative max-w-full">
            <img
              className="h-[750px] w-[750px] absolute !m-[0] bottom-[-680px] left-[-56px] rounded-481xl overflow-hidden shrink-0 object-cover"
              loading="lazy"
              alt=""
              src={image}
            />
            <h1 className="m-0 flex-1 relative text-inherit leading-[90%] uppercase font-normal font-inherit inline-block max-w-full z-[1] mq800:text-85xl mq800:leading-[140px] mq450:text-46xl mq450:leading-[94px]">
              Next
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
});

FrameComponent7.propTypes = {
  className: PropTypes.string,
  image: PropTypes.string,
};

export default FrameComponent7;
