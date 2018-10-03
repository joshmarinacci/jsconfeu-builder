import React, {Component} from "react";
import ArchwayPanel from "./ArchwayPanel";
import {ThumbnailPanel} from './ThumbnailPanel'


export default class QueueModulePanel extends Component {
  componentDidMount() {
      //Todo: do we need anything here any more?
  }
  componentWillReceiveProps(newProps) {
    //force refresh if the module changes
    if (this.props.module && this.props.module._id !== newProps.module._id) {
        //TODO: make sure this works for the queue editor
    }
  }

  render() {
    return (
      <div className="queue-module">
        {this.renderInfoPanel()}
        {this.renderCanvas()}
      </div>
    );
  }

  renderInfoPanel() {
    if (this.props.hideInfo) return "";
    if (!this.props.module) return <div>loading...</div>;
    return (
      <div className="queue-module__info">
        {this.props.num ? (
          <h3 className="meh">{this.props.num}.&nbsp;&nbsp;</h3>
        ) : (
          ""
        )}
        <h3>{this.props.module.title}</h3>
        <p>{this.props.module.description}</p>
        <cite>Created by: {this.props.module.author}</cite>
        {/*<i>{this.props.module.tags.join(", ")}</i>*/}
      </div>
    );
  }

    renderCanvas() {
        if (!this.props.module)  return <div>error. can't render module</div>;
        if (this.props.module.thumbnail && !this.props.threedee) return <ThumbnailPanel module={this.props.module} scale={this.props.scale}/>

        if (!this.props.module.manifest) return <div>error. can't render module</div>;

        if (this.props.threedee) {
            if (this.props.module && this.props.module.manifest) {
                return <ArchwayPanel frames={this.props.module.manifest.animation}/>;
            }
            {
                return <div>error!!!</div>;
            }
        }
        console.error('no thumbnail and 3d not set.')
        return <div>no thumbnail and 3d not set</div>
    }
}

