import Header from "../components/Header";
import FrameComponent4 from "../components/FrameComponent4";
import Stores from "../components/Stores";
import Footer from "../components/Footer";
import NavBarLight from "../components/NavbarLight";
import { useEffect } from "react";

const Contact = () => {
  
  useEffect(() => {
    const pageElement = document.documentElement; 
    if (pageElement) {
      pageElement.setAttribute("data-wf-page", "62c5e49ea6ad5913791d7459");
    }
    window.Webflow && window.Webflow.ready();
    window.Webflow && window.Webflow.require("ix2").init();
    document.dispatchEvent(new Event("readystatechange"));
  }, []);
  return (
    <div className="page-wrapper">
      <header className="header absolute">
        <NavBarLight/> 
      </header>
    <main className="main-wrapper">
  <section className="section-contact">
    <div className="page-padding">
      <div className="container-xlarge">
        <div className="padding-vertical padding-xhuge">
          <div className="margin-bottom margin-xhuge">
            <div className="text-align-center">
              <h1
                id="w-node-_8f9a79e3-2eb4-b69d-9ad5-b8b1ad4db742-791d7459"
                className="heading-xlarge text-uppercase"
              >
                Contact
              </h1>
            </div>
          </div>
          <div className="contact-grid">
            <div id="w-node-_0e5d0bd5-58ba-923d-9e03-67167bb787f9-791d7459">
              <div className="margin-bottom margin-medium">
                <h2 className="heading-h3 text-uppercase">Social</h2>
              </div>
              <div className="nav">
                <div className="nav-item">
                  <a
                    href="#"
                    target="_blank"
                    className="nav-item-link w-inline-block"
                  >
                    <div className="nav-item-text">Instagram</div>
                  </a>
                </div>
                <div className="nav-item">
                  <a
                    href=""
                    target="_blank"
                    className="nav-item-link w-inline-block"
                  >
                    <div className="nav-item-text">Facebook</div>
                  </a>
                </div>
                <div className="nav-item">
                  <a
                    href=""
                    target="_blank"
                    className="nav-item-link w-inline-block"
                  >
                    <div className="nav-item-text">Twitter</div>
                  </a>
                </div>
              </div>
            </div>
            <div id="w-node-f6571e2a-a23e-76f5-22c2-772edab45339-791d7459">
              <div className="margin-bottom margin-medium">
                <h2 className="heading-h3 text-uppercase">contact</h2>
              </div>
              <div className="nav">
                <div className="nav-item">
                  <a
                    href="mailto:info@example.com"
                    className="nav-item-link w-inline-block"
                  >
                    <div className="nav-item-text">info@example.com</div>
                  </a>
                </div>
                <div className="nav-item">
                  <a href="#" className="nav-item-link w-inline-block">
                    <div className="nav-item-text">+49 123 456 78</div>
                  </a>
                </div>
              </div>
            </div>
            <div id="w-node-da53e481-b9a2-db04-548e-1beb7a014737-791d7459">
              <div className="form-wrapper w-form">
                <form
                  id="wf-form-Contact-Form"
                  name="wf-form-Contact-Form"
                  data-name="Contact Form"
                  method="get"
                  className="form"
                  data-wf-page-id="62c5e49ea6ad5913791d7459"
                  data-wf-element-id="08349aea-04f2-68ee-b96c-0f240bc7d6f1"
                  aria-label="Contact Form"
                >
                  <div className="margin-bottom margin-medium">
                    <div className="form-field-wrapper">
                      <label htmlFor="name" className="form-label">
                        Name
                      </label>
                      <input
                        className="form-input w-input"
                        maxLength={256}
                        name="Name"
                        data-name="Name"
                        placeholder="Name"
                        type="text"
                        id="name"
                      />
                    </div>
                  </div>
                  <div className="margin-bottom margin-medium">
                    <div className="form-field-wrapper">
                      <label htmlFor="Email-2" className="form-label">
                        Email
                      </label>
                      <input
                        className="form-input w-input"
                        maxLength={256}
                        name="Email"
                        data-name="Email"
                        placeholder="Email Address"
                        type="text"
                        id="Email-2"
                        required=""
                      />
                    </div>
                  </div>
                  <div className="form-field-wrapper">
                    <label htmlFor="message" className="form-label">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="Message"
                      maxLength={5000}
                      data-name="Message"
                      placeholder="Your Message"
                      className="form-input is-text-area w-input"
                      defaultValue={""}
                    />
                  </div>
                  <div className="margin-bottom margin-medium">
                    <div className="form-field-wrapper">
                      <label id="consent" className="w-checkbox form-checkbox">
                        <div className="w-checkbox-input w-checkbox-input--inputType-custom form-checkbox-icon w--redirected-checked" />
                        <input
                          type="checkbox"
                          name="Consent"
                          id="Consent"
                          data-name="Consent"
                          required=""
                          style={{
                            opacity: 0,
                            position: "absolute",
                            zIndex: -1
                          }}
                          defaultChecked=""
                        />
                        <span
                          htmlFor="Consent"
                          className="form-checkbox-label w-form-label"
                        >
                          I agree to the{" "}
                          <a href="#" className="text-style-link">
                            terms and conditions
                          </a>
                        </span>
                      </label>
                    </div>
                  </div>
                  <input
                    data-wait="Please wait..."
                    type="submit"
                    className="button primary w-button"
                    defaultValue="Submit Message"
                  />
                </form>
                <div
                  className="form-message-success w-form-done"
                  tabIndex={-1}
                  role="region"
                  aria-label="Contact Form success"
                >
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div
                  className="form-message-error w-form-fail"
                  tabIndex={-1}
                  role="region"
                  aria-label="Contact Form failure"
                >
                  <div>
                    Oops! Something went wrong while submitting the form.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="section-stores">
    <div className="line" />
    <div className="page-padding">
      <div className="container-xlarge">
        <div className="padding-vertical padding-xhuge">
          <div className="margin-bottom margin-xlarge">
            <div className="stores-heading">
              <h2 className="heading-small">Our Stores</h2>
            </div>
          </div>
          <div className="store-grid">
            <div className="store">
              <img
                src="https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b28fe4da58557ef43d8e_store-hamburg.jpg"
                loading="lazy"
                width={300}
                height={300}
                alt="Store Hamburg"
                srcSet="https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b28fe4da58557ef43d8e_store-hamburg-p-500.jpeg 500w, https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b28fe4da58557ef43d8e_store-hamburg.jpg 600w"
                sizes="(max-width: 479px) 80vw, (max-width: 767px) 200px, (max-width: 991px) 250px, (max-width: 1919px) 21vw, 300px"
                className="store-image"
              />
              <div className="store-content">
                <div className="margin-bottom margin-small">
                  <h3>Hamburg</h3>
                </div>
                <div className="margin-bottom margin-small">
                  <div>
                    Sølve Store,
                    <br />
                    22765 Hamburg
                  </div>
                </div>
                <a
                  href="#"
                  target="_blank"
                  className="button-text arrow-right w-inline-block"
                >
                  <div className="button-text-wrapper">
                    <div className="button-text-text">Get Directions</div>
                    <div className="button-text-icon-wrapper">
                      <div className="button-text-icon w-embed" style={{}}>
                        <svg
                          width={32}
                          height={6}
                          viewBox="0 0 32 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            y="2.5"
                            width={30}
                            height={1}
                            fill="currentColor"
                          />
                          <path
                            d="M28 0.5L30.5 3L28 5.5"
                            stroke="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div className="store">
              <img
                src="https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b29d856d2659f08b996b_store-lisbon.jpg"
                loading="lazy"
                width={300}
                height={300}
                alt="Store Lisbon"
                srcSet="https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b29d856d2659f08b996b_store-lisbon-p-500.jpeg 500w, https://assets-global.website-files.com/62ad735180e290601ef78dcb/62b2b29d856d2659f08b996b_store-lisbon.jpg 600w"
                sizes="(max-width: 479px) 80vw, (max-width: 767px) 200px, (max-width: 991px) 250px, (max-width: 1919px) 23vw, 300px"
                className="store-image"
              />
              <div className="store-content">
                <div className="margin-bottom margin-small">
                  <h3>Lisbon</h3>
                </div>
                <div className="margin-bottom margin-small">
                  <div>
                    Sølve Store,
                    <br />
                    1049 Lisbon
                  </div>
                </div>
                <a
                  href="#"
                  target="_blank"
                  className="button-text arrow-right w-inline-block"
                >
                  <div className="button-text-wrapper">
                    <div className="button-text-text">Get Directions</div>
                    <div className="button-text-icon-wrapper">
                      <div className="button-text-icon w-embed" style={{}}>
                        <svg
                          width={32}
                          height={6}
                          viewBox="0 0 32 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            y="2.5"
                            width={30}
                            height={1}
                            fill="currentColor"
                          />
                          <path
                            d="M28 0.5L30.5 3L28 5.5"
                            stroke="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
<Footer/>
</div>

  );
};

export default Contact;
