import React, { Component } from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom"

// Styles & Icons
import "./style/style.css";
import "font-awesome/css/font-awesome.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import PipelineEditor from "./pages/PipelineEditor";
import HomeScreen from "./pages/HomeScreen";
import CodeScreen from "./pages/CodeScreen";
import PaintScreen from "./pages/PaintScreen";
import QueueScreen from "./pages/QueueScreen";
import QueueEditor from "./pages/QueueEditor";
import AboutScreen from "./pages/AboutScreen";

// Other
import ModuleStore from "./utils/ModuleStore";
import AuthStore from "./utils/AuthStore";

// Google Analytics
import ReactGA from 'react-ga';
ReactGA.initialize('UA-000000-01');
ReactGA.pageview(window.location.pathname + window.location.search);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: "home",
      user: null
    };
    AuthStore.listenToLogin(() => {
      console.log("the user is logged in");
      AuthStore.checkAuth().then(user => {
        // console.log("the user object is", user);
        this.setState({ user: user });
      });
    });
    AuthStore.checkAuth().then(user => {
      console.log("checking user", user);
      if (user) {
        this.setState({ user: user });
      }
    });
  }
  navTo = (screen, data) => this.setState({ screen: screen, data: data });
  render() {
      return (
      <div id="body">
        <Router>
            <div>
                <Navbar navTo={this.navTo} startAuth={() => AuthStore.start()} />
                {this.renderCurrentScreen()}
                <Footer user={this.state.user} />
            </div>
        </Router>
      </div>
    );
  }

    renderCurrentScreen() {
        return <Switch>
            <Route exact path="/" component={HomeScreen}/>
            <Route exact path="/code" component={CodeScreen}/>
            <Route exact path="/paint" render={() => <PaintScreen />} />
            <Route exact path="/pipeline" render={() => <PipelineEditor />} />
            <Route exact path="/queue" component={QueueScreen}/>
            <Route exact path="/queue-editor" component={QueueEditor}/>
            <Route exact path="/about" render={() => <AboutScreen />} />
        </Switch>

    }
}

export default App;
