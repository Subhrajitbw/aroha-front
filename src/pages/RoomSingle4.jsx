import FrameComponent6 from "../components/FrameComponent6";
import FrameComponent7 from "../components/FrameComponent7";
import Help from "../components/Help";
import Footer from "../components/Footer";

const RoomSingle4 = () => {
  return (
    <div className="w-full relative bg-background-default overflow-hidden flex flex-col items-start justify-start pt-16 px-0 pb-0 box-border leading-[normal] tracking-[normal]">
      <FrameComponent6
        image="/image5@2x.png"
        oslo="Madrid"
        heroDescriptionWidth="674px"
      />
      <FrameComponent7 image="/image-110@2x.png" />
      <Help />
      <Footer
        gridOverflowX="unset"
        columnMinWidth="204px"
        homeTextDecoration="unset"
        homeWidth="unset"
        homeMinWidth="49px"
        columnMinWidth1="204px"
        homeTextDecoration1="unset"
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
        roomsTextDecoration="unset"
        journalTextDecoration="none"
        roomsTextDecoration1="unset"
        fAQTextDecoration="none"
        changelogTextDecoration="unset"
        instagramTextDecoration="unset"
        facebookTextDecoration="none"
      />
    </div>
  );
};

export default RoomSingle4;
