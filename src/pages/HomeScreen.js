import React, { Component } from "react";
import { Link } from "react-router-dom";

// components
import QueueModulePanel from "../components/QueueModulePanel";
import ModuleStore from "../utils/ModuleStore";

// images
import wasm from "../img/icon-wasm.svg";
import learn from "../img/icon-learn.svg";
import create from "../img/icon-create.svg";
import queue from "../img/icon-queue.svg";
import rust from "../img/icon-rust.svg";

// Components
import Pattern from "../components/Pattern";

const HomeScreen = props => {
  const modules = ModuleStore.getQueueModules();
  const module = modules[0];
  return (
    <div className="content">
      <Pattern />
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__text">
            <h1 className="p-text">
              Create art & <br className="no-mobile" />see it on the arch
            </h1>

            <p className="p-text">
              Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum
              dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor.
            </p>
          </div>
        </div>
      </section>

      <section className="started">
        <div className="container">
          <h2 className="p-text">Ways to get started</h2>
          <div className="started__row">
            <div className="started__section">
              <img
                className="started__img"
                className="started__icon"
                src={wasm}
                alt="webassembly"
              />
              <span className="p-text started__text">
                Code a module in WebAssembly studio
              </span>
              <Link
                to="/code"
                className="started__button button button--primary"
              >
                Code a Module
              </Link>
            </div>
            <div className="started__section">
              <img className="started__icon" src={learn} alt="webassembly" />
              <span className="started__text">
                Learn more about Mozilla and the Arch
              </span>
              <a
                className="started__button started__button button button--primary"
                href="#"
              >
                Learn More
              </a>
            </div>
            <div className="started__section">
              <img className="started__icon" src={rust} alt="webassembly" />
              <span className="started__text">
                Learn more about Rust + WebAssembly
              </span>
              <a className="started__button button button--primary" href="#">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="next">
        <div className="container">
          <h2>See what's up next</h2>
          <div className="next__grid">
            <div className="next__img">
              <QueueModulePanel
                module={module}
                scale={40}
                threedee={true}
                hideInfo={true}
              />
            </div>
            <div className="next__info">
              <img className="mb3" src={queue} alt="queue icon" />
              <p className="mb3">
                Check out what is in the queue and find out when yours will be
                up.
              </p>
              <Link to="/queue" className="button button--primary">
                View the Queue
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Pattern position="bottom" />
    </div>
  );
};
export default HomeScreen;
