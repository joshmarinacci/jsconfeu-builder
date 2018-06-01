import React, { Component } from "react";
import PropTypes from "prop-types";

// images
import logo from "../img/logo.svg";

class Footer extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
        createHref: PropTypes.func.isRequired
      }).isRequired
    }).isRequired
  };
  render() {
    if (this.context && this.context.router) {
      const path = this.context.router.route.location.pathname;
      if (path === "/code") return "";
    }
    return (
      <div className="footer">
        <div className="">
          <div className="footer__grid">
            <img className="footer__logo" src={logo} alt="Moz://a" />
            <ul className="footer__list">
              {/*<span className="footer__title">Links</span>
              <li className="footer__item">
                <a hef="#">Link 1</a>
              </li>
              <li className="footer__item">
                <a href="#">Link 2</a>
              </li>
              <li className="footer__item">
                <a href="#">Link 3</a>
              </li>
              <li className="footer__item">
                <a href="#">Link 4</a>
    </li>*/}
            </ul>
            <ul className="footer__list">
              <span className="footer__title">Mozilla</span>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.mozilla.org/about/"
                >
                  About
                </a>
              </li>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://blog.mozilla.org/"
                >
                  Blog
                </a>
              </li>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://twitter.com/mozilla"
                >
                  Twitter
                </a>
              </li>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.facebook.com/mozilla"
                >
                  Facebook
                </a>
              </li>
            </ul>
            <ul className="footer__list">
              <span className="footer__title">Firefox</span>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.mozilla.org/firefox/new/"
                >
                  Download Firefox
                </a>
              </li>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.mozilla.org/firefox/"
                >
                  Desktop
                </a>
              </li>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.mozilla.org/firefox/mobile/"
                >
                  Mobile
                </a>
              </li>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.mozilla.org/firefox/features/"
                >
                  Features
                </a>
              </li>
              <li className="footer__item">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.mozilla.org/firefox/channel/desktop/"
                >
                  Beta, Nightly, Developer Edition
                </a>
              </li>
            </ul>
          </div>

          <div className="legal">
            <ul className="legal__list">
              <li>
                <a href="https://www.mozilla.org/privacy/websites/">
                  Website Privacy Notice
                </a>
              </li>
              <li>
                <a href="https://www.mozilla.org/privacy/websites/#cookies">
                  Cookies
                </a>
              </li>
              <li>
                <a href="https://www.mozilla.org/about/legal/">Legal</a>
              </li>
            </ul>
            <p className="mt1">
              Portions of this content are ©1998–2018 by individual mozilla.org
              contributors. Content available under a{" "}
              <a href="https://www.mozilla.org/foundation/licensing/website-content/">
                Creative Commons license
              </a>.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;
