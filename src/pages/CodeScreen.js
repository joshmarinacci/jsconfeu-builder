import React, { Component } from "react";
import QueueModulePanel from "../components/QueueModulePanel";
import Constants from "../Constants";
import { Link } from "react-router-dom";
import ModuleStore from "../utils/ModuleStore";
import AuthStore from "../utils/AuthStore";
import { imageData2png, animationBuffer2data } from "../utils/RenderUtils";
import Pattern from "../components/Pattern";

// images
import buildImg from "../img/build.png";

class CodeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      module: null,
      showPreviewSubmit: false,
      showInfo: true,
      showProgress: false,
      progressText: "nothing",
      showDone: false,
      showError: false,
      error: { message: "nothing", actions: [] }
    };
  }
  componentDidMount() {
    window.addEventListener("message", this.codeCallback);
  }
  componentWillUnmount() {
    window.removeEventListener("message", this.codeCallback);
  }
  codeCallback = msg => {
    // To make testing easier, we allow embedding WebAssembly Studio from any domain when
    // running on localhost.
    if (msg.origin !== "https://webassembly.studio" && window.location.hostname !== 'localhost') {
      return;
    }

    if (!msg.data) {
      this.showError(
        "Could not get the message from the editor. Please try again",
        [{ caption: "Dismiss", action: () => this.hideError() }]
      );
      return;
    }

    if (msg.data.type === "wasm-studio/fork") {
      window.history.pushState(null, window.title, "code?module=" + msg.data.fiddle);
      return;
    }

    let module = msg.data;
    if (module.type === "wasm-studio/module-publish") {
      if (!module.tags) module.tags = [];
      if (!module.title) module.title = "";
      if (!module.description) module.description = "";
      if (!module.author) module.author = "";
      if (!module.origin) module.origin = "wasmstudio";
      const anim = module.manifest.animation;
      anim.data = animationBuffer2data(anim.data, anim.rows, anim.cols, anim.frameCount);
      module.thumbnail = imageData2png(anim.data[0]);
      this.setState({ showPreviewSubmit: true, module: module });
    } else {
      this.showError(
        "Could not get the message from the editor. Please try again",
        [{ caption: "Dismiss", action: () => this.hideError() }]
      );
    }
  };
  showError = (msg, actions) => {
    if (!actions) {
      actions = [
        {
          caption: "Dismiss",
          action: () => this.hideError()
        }
      ];
    }
    this.setState({
      showError: true,
      error: {
        message: msg,
        actions: actions
      }
    });
  };
  hideError() {
    this.setState({ showError: false });
  }
  render() {
    let url = Constants.EDITOR_URL;
    if (window.location.search.indexOf("?module=") === 0) {
      url += '&fiddle=' + window.location.search.substr("?module=".length);
    }

    return (
      <div className="content">
        <iframe
          title="wasm editor"
          id="wasm-editor"
          src={url}
        />
        {this.renderOverlay()}
        {this.renderError()}
      </div>
    );
  }
  backClicked = () => this.setState({ showPreviewSubmit: false });
  dismissInfo = () => this.setState({ showInfo: false });
  doSubmit = module => {
    this.setState({
      showPreviewSubmit: false,
      showProgress: true,
      progressText: "submitting for review"
    });
    ModuleStore.submitModule(module)
      .then(res => {
        console.log("got the result", res);
        if (!res.success) return this.showError(res.message);
        this.setState({ showProgress: false, showDone: true });
      })
      .catch(e => {
        console.log("error submitting. should show an error", e);
        this.showError("error submitting to the server. Please try again.");
        this.setState({ showProgress: false });
      });
  };
  renderOverlay() {
    if (this.state.showInfo)
      return (
        <div className="overlay-scrim">
          <InfoScreen dismissInfo={this.dismissInfo} />
        </div>
      );
    if (this.state.showProgress)
      return (
        <div className="overlay-scrim">
          <Progress text={this.state.progressText} />
        </div>
      );
    if (this.state.showDone)
      return (
        <div className="overlay-scrim">
          <SubmitDone />
        </div>
      );
    if (this.state.showPreviewSubmit)
      return (
        <div className="overlay-scrim">
          <PreviewSubmit
            backClicked={this.backClicked}
            doSubmit={this.doSubmit}
            module={this.state.module}
            onError={this.showError}
          />
        </div>
      );
    return "";
  }
  renderError() {
    if (this.state.showError)
      return (
        <div className="overlay-scrim">
          <ErrorScreen error={this.state.error} />
        </div>
      );
    return " ";
  }
}

const ErrorScreen = props => {
  return (
    <div className="overlay-pattern-wrap">
      <div className="overlay">
        <h2>Error</h2>
        <p>{props.error.message}</p>
        <div>
          {props.error.actions.map((act, i) => {
            return (
              <button
                className="mt3 button button--primary"
                key={i}
                onClick={act.action}
              >
                {act.caption}
              </button>
            );
          })}
        </div>
      </div>
      <Pattern position="bottom" />
    </div>
  );
};
const InfoScreen = props => {
  return (
    <div className="overlay-pattern-wrap">
      <div className="overlay">
        <h2>How To Code a Module:</h2>
        <ul>
          <li>
            <strong>1.</strong> Choose an example project and click ‘Create’.
            Make your code changes.
          </li>
          <li>
            <strong>2.</strong> Click ‘Build & Preview’ at the{" "}
            <em>top of the editor</em>.
            <img
              style={{ height: "40px", marginLeft: "10px" }}
              src={buildImg}
              alt="build"
            />
          </li>
          <li>
            <strong>3.</strong> Click ‘Go Back’ to return to your code and make
            changes.
          </li>
          <li>
            <strong>4.</strong> Repeat steps 2 & 3 until you like your
            animation.
          </li>
          <li>
            <strong>5.</strong> Fill out your information and click ‘Submit’.
          </li>
        </ul>
        <div className="row">
          <button
            className="button button--primary"
            onClick={props.dismissInfo}
          >
            Dismiss
          </button>
        </div>
      </div>
      <Pattern position="bottom" />
    </div>
  );
};

const Progress = props => {
  return (
    <div className="overlay">
      <p>
        <b>{props.text}</b> <i className="fa fa-pulse fa-spinner" />
      </p>
    </div>
  );
};

const TagButton = props => {
  return (
    <li>
      <button
        className="preview__tag-button fa fa-close"
        onClick={() => props.deleteTag(props.tag)}
      />
      {props.tag}
    </li>
  );
};
class TagEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ""
    };
  }
  editQuery = e => this.setState({ query: e.target.value });
  deleteTag = tag => {
    let tags = this.props.tags;
    tags = tags.filter(t => t !== tag);
    this.props.onChange(tags);
  };
  addTag = () => {
    if (!this.state.query || this.state.query.trim().length <= 0) return;
    let tags = this.props.tags;
    tags = tags.concat([this.state.query]);
    this.props.onChange(tags);
    this.setState({ query: "" });
  };
  keyPress = e => {
    if (e.keyCode === 13) return this.addTag();
  };
  render() {
    return (
      <div>
        <div className="preview__tag-input-wrap">
          <input
            type="text"
            className="preview__tag-input"
            placeholder="Tag Name"
            value={this.state.query}
            onChange={this.editQuery}
            onKeyDown={this.keyPress}
          />
          <button className="preview__add-tag-button" onClick={this.addTag}>
            Add a Tag
          </button>
        </div>
        <ul className="preview__tag-list">
          {this.props.tags.map(t => (
            <TagButton key={t} tag={t} deleteTag={this.deleteTag} />
          ))}
        </ul>
      </div>
    );
  }
}

// const VBox = props => {
//   const style = props.style || {};
//   style.display = "flex";
//   style.flexDirection = "column";
//   return <div style={style}>{props.children}</div>;
// };
// const HBox = props => {
//   const style = props.style || {};
//   style.display = "flex";
//   style.flexDirection = "row";
//   return <div style={style}>{props.children}</div>;
// };
// const Label = props => {
//   return <label style={{ flex: 1 }}>{props.children}</label>;
// };
const Spacer = props => {
  return <span style={{ flex: 1 }} />;
};

class PreviewSubmit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      module: props.module,
      user: AuthStore.getCurrentUser()
    };
  }
  componentDidMount() {
    AuthStore.listenToLogin(this.loggedIn);
  }
  componentWillUnmount() {
    AuthStore.unlistenToLogin(this.loggedIn);
  }
  loggedIn = () => {
    this.setState({ user: AuthStore.getCurrentUser() });
  };
  onSubmit = () => {
    const module = this.state.module;

    function missing(str) {
      if (!str) return true;
      if (str.trim().length === 0) return true;
      return false;
    }
    if (missing(module.title))
      return this.props.onError("Your module needs a title");
    if (missing(module.description))
      return this.props.onError("Your module needs a description");
    console.log("checking for user", this.state.user);

    if (!this.state.user) {
      console.log("not authenitcated. can't submit");
      AuthStore.start();
    } else {
      this.props.doSubmit(module);
    }
  };

  edit = (field, value) => {
    this.state.module[field] = value;
    this.setState({ module: this.state.module });
  };

  getCurrentTitle = () => {
    if (!this.state.module) return "";
    return this.state.module.title;
  };
  getCurrentDescription = () => {
    if (!this.state.module) return "";
    return this.state.module.description;
  };
  getCurrentAuthor = () => {
    if (!this.state.module) return "";
    return this.state.module.author;
  };
  getCurrentTags = () => {
    if (!this.state.module) return [];
    return this.state.module.tags;
  };

  render() {
    const module = this.state.module;
    return (
      <div className="preview">
        <div className="preview__content">
          <div className="preview__form-wrap">
            <span>Submit your module for review</span>
            <form
              className="preview__form"
              id="submit-form"
              onSubmit={e => e.preventDefault()}
            >
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  value={this.getCurrentTitle()}
                  onChange={e => this.edit("title", e.target.value)}
                />
              </div>
              <div>
                <textarea
                  placeholder="Description"
                  value={this.getCurrentDescription()}
                  rows={2}
                  onChange={e => this.edit("description", e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Author Name"
                  value={this.getCurrentAuthor()}
                  onChange={e => this.edit("author", e.target.value)}
                />
              </div>
              <div>
                <label>Choose Tags</label>
              </div>
              <div>
                <TagEditor
                  tags={this.getCurrentTags()}
                  onChange={tags => this.edit("tags", tags)}
                />
              </div>
            </form>
          </div>
          <QueueModulePanel
            module={module}
            scale={40}
            threedee={true}
            hideInfo={true}
          />
        </div>
        <div className="preview__buttons">
          <button
            className="button button--primary"
            onClick={this.props.backClicked}
          >
            Go Back
          </button>
          <Spacer />
          <button className="button button--primary" onClick={this.onSubmit}>
            Submit
          </button>
        </div>
        <Pattern position="bottom" />
      </div>
    );
  }
}

const SubmitDone = props => {
  return (
    <div className="overlay">
      <h2>Submission Complete</h2>
      <p>
        Thank you for submitting your module. Your module will be reviewed, and,
        if approved, added to the queue to be displayed on the Arch.
      </p>
      <div>
        <Link to="/queue" className="mt4 button button--primary">
          View the Queue
        </Link>
      </div>
    </div>
  );
};

export default CodeScreen;
