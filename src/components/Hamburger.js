import React, { Component } from "react";

class Hamburger extends React.Component {
  handleClick = () => {
    const burger = document.querySelector(".burger");
    const mobileNav = document.querySelector(".navbar__list");
    const body = document.querySelector("body");
    burger.classList.toggle("is-active");
    mobileNav.classList.toggle("is-active");
    body.classList.toggle("nav-active");
  };

  render() {
    return (
      <button class="burger" onClick={this.handleClick} type="button">
        <span class="burger__box">
          <span class="burger__inner" />
        </span>
      </button>
    );
  }
}

export default Hamburger;
