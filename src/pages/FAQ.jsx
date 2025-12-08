import Header from "../components/Header";
import Content from "../components/Content";
import Column1 from "../components/Column1";
import Footer from "../components/Footer";

const FAQ = () => {
  return (
    <div className="w-full relative bg-background-default overflow-hidden flex flex-col items-end justify-start pt-16 px-0 pb-0 box-border leading-[normal] tracking-[normal] text-left text-base text-background-primary font-nav-item">
      <section className="w-[1880px] flex flex-col items-start justify-start pt-0 pb-32 pl-5 pr-0 box-border gap-[76px] max-w-full text-center text-109xl text-background-primary font-heading-large gap-[19px] mq450:pb-[83px] mq450:box-border gap-[38px]">
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
          headerPosition="unset"
          headerTop="unset"
          headerLeft="unset"
          headerWidth="1820px"
          headerPadding="0px 20px 0px 0px"
          lookbookTextDecoration="none"
          shopMinWidth="46px"
          shopHeight="unset"
          shopWidth="unset"
          gridWidth="unset"
          cartMinWidth="43px"
          cartHeight="unset"
          cartFlex="unset"
          frameDivWidth="unset"
          aTextDecoration="unset"
          aMinWidth="8px"
          aHeight="unset"
        />
        <div className="self-stretch flex flex-row items-start justify-start py-0 pl-[400px] pr-[60px] box-border max-w-full mq450:pl-5 mq450:box-border mq800:pl-[100px] mq800:box-border mq1325:pl-[200px] mq1325:pr-[30px] mq1325:box-border">
          <div className="w-[2076px] flex flex-col items-start justify-start gap-[21px] max-w-[149%] shrink-0">
            <div className="self-stretch flex flex-row items-start justify-end max-w-full">
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
                frameDivHeight="22px"
                aAlignSelf="stretch"
                aColor="#fff"
                lineBackgroundColor="#343339"
                lineBackgroundColor1="#343339"
                headerPosition="unset"
                headerTop="unset"
                headerLeft="unset"
                headerWidth="1800px"
                headerPadding="unset"
                lookbookTextDecoration="none"
                shopMinWidth="unset"
                shopHeight="20px"
                shopWidth="46px"
                gridWidth="72px"
                cartMinWidth="unset"
                cartHeight="20px"
                cartFlex="1"
                frameDivWidth="22px"
                aTextDecoration="unset"
                aMinWidth="unset"
                aHeight="15px"
              />
            </div>
            <h1 className="m-0 w-[1000px] relative text-inherit leading-[141px] font-normal font-inherit inline-block max-w-full mq450:text-13xl mq450:leading-[56px] mq800:text-32xl mq800:leading-[84px]">
              Any Questions?
            </h1>
          </div>
        </div>
      </section>
      <div className="self-stretch h-[67.5px] flex flex-row items-start justify-center pt-0 px-5 pb-[66.5px] box-border max-w-full">
        <div className="self-stretch w-[1200px] relative bg-border-default max-w-full" />
      </div>
      <section className="self-stretch flex flex-row items-start justify-center pt-0 px-5 pb-16 box-border max-w-full text-left text-9xl text-background-primary font-nav-item">
        <div className="w-[1200px] flex flex-col items-start justify-start gap-[34.5px] max-w-full gap-[17px]">
          <div className="self-stretch flex flex-row flex-wrap items-start justify-start gap-12 max-w-full gap-6">
            <h2 className="m-0 flex-1 relative text-inherit font-medium font-inherit inline-block min-w-[365px] max-w-full mq450:text-3xl mq450:min-w-full">
              How can I change or cancel my order?
            </h2>
            <div className="flex flex-col items-start justify-start pt-[5.5px] px-0 pb-0">
              <img
                className="w-6 h-6 relative overflow-hidden shrink-0"
                loading="lazy"
                alt=""
                src="/risubtractline.svg"
              />
            </div>
          </div>
          <div className="self-stretch relative text-xl leading-[180%] mq450:text-base mq450:leading-[29px]">{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Fermentum dui faucibus in ornare quam viverra orci sagittis. Nisi est sit amet facilisis magna. Odio tempor orci dapibus ultrices in iaculis. Sit amet cursus sit amet. Turpis egestas sed tempus urna et. Enim tortor at auctor urna nunc. Feugiat in fermentum posuere urna nec. `}</div>
        </div>
      </section>
      <div className="self-stretch h-[67.5px] flex flex-row items-start justify-center pt-0 px-5 pb-[66.5px] box-border max-w-full">
        <div className="self-stretch w-[1200px] relative bg-border-default max-w-full" />
      </div>
      <Content doIHaveToOrderOnline="Do I have to order online?" />
      <div className="self-stretch h-[67.5px] flex flex-row items-start justify-center pt-0 px-5 pb-[66.5px] box-border max-w-full">
        <div className="self-stretch w-[1200px] relative bg-border-default max-w-full" />
      </div>
      <Content
        doIHaveToOrderOnline="How can I change delivery address?"
        propMinWidth="340px"
      />
      <div className="self-stretch h-[67.5px] flex flex-row items-start justify-center pt-0 px-5 pb-[66.5px] box-border max-w-full">
        <div className="self-stretch w-[1200px] relative bg-border-default max-w-full" />
      </div>
      <Content
        doIHaveToOrderOnline="What is the return policy?"
        propMinWidth="248px"
      />
      <section className="self-stretch h-[129px] flex flex-row items-start justify-center pt-0 px-5 pb-32 box-border max-w-full">
        <div className="self-stretch w-[1200px] relative bg-border-default max-w-full" />
      </section>
      <div className="self-stretch h-px relative bg-border-default" />
      <section className="self-stretch flex flex-row items-start justify-center py-0 px-5 box-border max-w-full text-left text-77xl text-background-primary font-heading-large">
        <div className="w-[1600px] flex flex-row items-start justify-start py-32 px-0 box-border gap-20 max-w-full gap-5 mq450:pt-[83px] mq450:pb-[83px] mq450:box-border gap-10 mq1325:flex-wrap">
          <h1 className="m-0 flex-1 relative text-inherit leading-[106px] font-normal font-inherit inline-block min-w-[184px] max-w-full mq450:text-10xl mq450:leading-[42px] mq800:text-29xl mq800:leading-[63px]">
            Help?
          </h1>
          <div className="w-[1006px] flex flex-row items-start justify-between min-w-[1006px] max-w-full gap-5 mq1125:flex-wrap mq1125:min-w-full mq1325:flex-1">
            <Column1 localStores="Local Stores" seeAll="Find a Store" />
            <Column1 localStores="Contact Us" seeAll="Contact" />
          </div>
        </div>
      </section>
      <a className="[text-decoration:none] absolute !m-[0] top-[195px] left-[940.5px] tracking-[1px] uppercase font-medium text-[inherit] inline-block min-w-[33px]">
        FAQ
      </a>
      <Footer
        gridOverflowX="unset"
        columnMinWidth="204px"
        homeTextDecoration="none"
        homeWidth="unset"
        homeMinWidth="49px"
        columnMinWidth1="204px"
        homeTextDecoration1="none"
        homeWidth1="unset"
        homeMinWidth1="49px"
        styleguideWidth="unset"
        styleguideMinWidth="98px"
        licensingTextDecoration="unset"
        columnMinWidth2="204px"
        tikTok="Twitter"
        tikTokMinWidth="68px"
        tikTokTextDecoration="none"
        madeByPawelWidth="unset"
        madeByPawelDisplay="unset"
        roomsTextDecoration="none"
        journalTextDecoration="none"
        roomsTextDecoration1="none"
        fAQTextDecoration="none"
        changelogTextDecoration="none"
        instagramTextDecoration="none"
        facebookTextDecoration="none"
      />
    </div>
  );
};

export default FAQ;
