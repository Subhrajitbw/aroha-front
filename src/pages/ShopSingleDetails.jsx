import Header from "../components/Header";
import Details from "../components/Details";

const ShopSingleDetails = () => {
  return (
    <div className="w-full h-[1200px] relative bg-background-default overflow-hidden leading-[normal] tracking-[normal] text-left text-base text-background-primary font-nav-item">
      <div className="absolute top-[277px] left-[1120px] text-109xl leading-[110%] font-heading-large hidden w-[640px] mq450:text-13xl mq450:leading-[56px] mq767:text-32xl mq767:leading-[84px]">
        <p className="m-0">Elegant</p>
        <p className="m-0">Lamp</p>
      </div>
      <div className="absolute top-[591px] left-[1120px] tracking-[1px] uppercase font-medium hidden min-w-[111px]">
        $ 329.00 USD
      </div>
      <div className="absolute top-[627px] left-[1120px] text-xl leading-[180%] hidden w-[640px] mq450:text-base mq450:leading-[29px]">
        Mauris cursus mattis molestie a iaculis at erat pellentesque adipiscing.
        Netus et malesuada fames ac turpis egestas integer eget.
      </div>
      <div className="absolute top-[747px] left-[1120px] rounded-481xl bg-text-inverse border-background-primary border-[1px] border-solid overflow-hidden hidden flex-row items-center justify-center py-[22px] px-[46px]">
        <div className="relative tracking-[0.1em] uppercase font-medium inline-block min-w-[7px]">
          1
        </div>
      </div>
      <div className="absolute top-[747px] left-[1237px] rounded-481xl bg-background-primary overflow-hidden hidden flex-row items-center justify-center py-6 px-[39px] whitespace-nowrap text-text-inverse">
        <div className="relative tracking-[0.1em] uppercase font-medium inline-block min-w-[115px]">
          Add to cart
        </div>
      </div>
      <div className="absolute top-[863px] left-[1120px] bg-border-default w-[657px] h-px hidden" />
      <div className="absolute top-[896px] left-[1120px] tracking-[1px] uppercase font-medium hidden min-w-[66px]">
        Details
      </div>
      <div className="absolute top-[896px] left-[1233px] tracking-[1px] uppercase font-medium hidden min-w-[77px]">
        Delivery
      </div>
      <div className="absolute top-[896px] left-[1357px] tracking-[1px] uppercase font-medium hidden min-w-[75px]">
        Returns
      </div>
      <div className="absolute top-[948px] left-[1120px] bg-border-default w-[657px] h-px hidden" />
      <img
        className="absolute h-full top-[0px] bottom-[0px] left-[0px] max-h-full w-[960px] overflow-hidden object-cover"
        loading="lazy"
        alt=""
        src="/image1@2x.png"
      />
      <Header
        menuToggleFlex="unset"
        menuToggleAlignSelf="unset"
        navbarLeftWidth="400px"
        lookbookColor="#343339"
        slveColor="#343339"
        navbarRightWidth="400px"
        shopColor="#343339"
        cartColor="#343339"
        frameDivBackgroundColor="#343339"
        frameDivHeight="unset"
        aAlignSelf="unset"
        aColor="#fff"
        lineBackgroundColor="#343339"
        lineBackgroundColor1="#343339"
        headerPosition="absolute"
        headerTop="64px"
        headerLeft="60px"
        headerWidth="1800px"
        headerPadding="unset"
        lookbookTextDecoration="unset"
        shopMinWidth="46px"
        shopHeight="unset"
        shopWidth="unset"
        gridWidth="unset"
        cartMinWidth="43px"
        cartHeight="unset"
        cartFlex="unset"
        frameDivWidth="unset"
        aTextDecoration="none"
        aMinWidth="8px"
        aHeight="unset"
      />
      <section className="absolute h-full w-full top-[0px] right-[0px] bottom-[0px] left-[0px] bg-darkslategray-300 z-[2]" />
      <Details />
    </div>
  );
};

export default ShopSingleDetails;
