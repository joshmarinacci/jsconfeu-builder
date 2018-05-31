import React, { Component } from "react";
import ArchwayPanel from "./ArchwayPanel";
import ModuleStore from "../utils/ModuleStore";


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

class ThumbnailPanel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            width:10,
            height:10,
        }
        const thumb = ModuleStore.getThumbnailForModule(this.props.module);
        if(thumb.complete) {
            this.state.width = thumb.width
            this.state.height = thumb.height
        }
    }
    componentDidMount() {
        ModuleStore.on('thumbnail',this.thumbnailLoaded)
        this.drawThumbnail(this.canvas, this.props.module, this.props.scale);
    }
    componentWillUnmount() {
        ModuleStore.off('thumbnail',this.thumbnailLoaded)
    }
    thumbnailLoaded = () => {
        const thumb = ModuleStore.getThumbnailForModule(this.props.module);
        if(thumb.width !== this.state.width || thumb.height !== this.state.height) {
            this.setState({width: thumb.width, height: thumb.height})
        }
        this.drawThumbnail(this.canvas, this.props.module, this.props.scale);
    }
    drawThumbnail(canvas, module, scale) {
        if (!module || !module.thumbnail) return;
        const img = ModuleStore.getThumbnailForModule(this.props.module);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "blue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            img,
            0,
            0,
            img.width * this.props.scale,
            img.height * this.props.scale
        );
    }
    render() {
        return (
            <canvas
                ref={can => (this.canvas = can)}
                width={this.state.width * this.props.scale}
                height={this.state.height * this.props.scale}
            >
                animation
            </canvas>
        );
    }
}
