import { memo } from "react";
import Help from "./Help";
import Footer from "./Footer";
import PropTypes from "prop-types";

const FrameComponent3 = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-col items-start justify-start max-w-full text-left text-77xl text-background-primary font-heading-large ${className}`}
    >
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
    </section>
  );
});

FrameComponent3.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent3;
