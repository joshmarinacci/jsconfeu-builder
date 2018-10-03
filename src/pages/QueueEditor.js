import React, { Component } from "react";
import ModuleStore from "../utils/ModuleStore";
import QueueModulePanel from "../components/QueueModulePanel";
import {ThumbnailPanel} from "../components/ThumbnailPanel"
import DraggableList from "react-draggable-list";

function makeIdentityFilter() {
  return function() {
    return true;
  };
}
function makeNameFilter(fullString) {
  const str = fullString.toLowerCase();
  return function(item) {
    if (item.title.toLowerCase().indexOf(str) >= 0) return true;
    const match = item.tags.find(tag => tag.toLowerCase().indexOf(str) >= 0);
    if (match) return true;
    return false;
  };
}

export default class QueueEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: [],
      filter: makeIdentityFilter(),
      filterString: ""
    };
    ModuleStore.findAllModules().then(modules =>
      this.setState({ modules: modules })
    );
  }
    addToQueue = m => ModuleStore.addModuleToQueue(m);
    addToQueueNext = m => ModuleStore.addModuleToQueueNext(m);
  archiveModule = m => ModuleStore.archiveModule(m);
  deleteFromQueue = (m, i) => ModuleStore.deleteModuleFromQueue(m, i);
  toQueueTop = m => ModuleStore.moveToQueueTop(m)
  queueUpdated = queue => this.setState({ queue: queue });
  modulesUpdated = modules => this.setState({ modules: modules });
  updateSearch = e =>
    this.setState({
      filter: makeNameFilter(e.target.value),
      filterString: e.target.value
    });
  clearSearch = () => this.setState({ filter: makeIdentityFilter() });
  componentDidMount() {
    ModuleStore.on("queue", this.queueUpdated);
    ModuleStore.on("modules", this.modulesUpdated);
  }
  componentWillUnmount() {
    ModuleStore.off("queue", this.queueUpdated);
    ModuleStore.off("modules", this.modulesUpdated);
  }
  render() {
    const queueModules = ModuleStore.getQueueModules();
    const allModules = this.state.modules.filter(this.state.filter);
    return (
      <article
        className="content"
        style={{
          height: "80vh",
          display: "grid",
          gridTemplateColumns: "[left]1fr [right]1fr [end]",
          gridTemplateRows: "[toolbar] 2em [body] 1fr [bottom]"
        }}
      >
        <div
          style={{
            gridColumn: "left/right",
            gridRow: "toolbar/body",
            display: "flex",
            flexDirection: "row"
          }}
        >
          <input
            style={{ flex: 1 }}
            type="search"
            value={this.state.filterString}
            onChange={this.updateSearch}
          />
          <button onClick={this.clearSearch}>clear</button>
        </div>

        <ul
          style={{
            gridColumn: "left/right",
            overflow: "auto",
            padding: "0.25em",
            gridRow: "body/bottom",
            borderRight: "1px solid white"
          }}
        >
          {allModules.map((m, i) => (
            <ModuleSummaryPanel
              key={m._id}
              module={m}
              onAdd={() => this.addToQueue(m)}
              onAddNext={()=>this.addToQueueNext(m)}
              onArchive={() => this.archiveModule(m)}
            />
          ))}
        </ul>

        <h3
          style={{
            gridColumn: "right/end",
            gridRow: "toolbar/body"
          }}
        >
          the queue
        </h3>

        <div
          style={{
            gridColumn: "right/end",
            gridRow: "body/bottom",
            overflow: "auto",
            padding: 0
          }}
          ref={ref => (this.queue_modules_container = ref)}
        >
          <DraggableList
            list={queueModules}
            itemKey={"_id"}
            template={EditableModulePanel}
            container={() => this.queue_modules_container}
            padding={10}
            onMoveEnd={this.moveEnded}
            commonProps={{
              onDelete: this.deleteFromQueue,
                onMoveUp: this.toQueueTop,
            }}
          />
          {/*{queueModules.map((m,i)=> <EditableModulePanel key={i} module={m} onDelete={()=>this.deleteFromQueue(m,i)}/>)}*/}
        </div>
      </article>
    );
  }

  moveEnded = data => {
    ModuleStore.setQueueModules(data);
  };
}

class EditableModulePanel extends Component {
  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          margin: "1em",
          backgroundColor: "#333"
        }}
      >
        <div>
          {this.props.dragHandle(<i className="fa fa-bars handle action" />)}
        </div>
        <QueueModulePanel module={this.props.item} scale={4} style={{flex:1}}/>
        <div style={{flex:0}}>
            <button className="fa fa-arrow-up"
                    style={buttonStyle}
                    onClick={()=>this.props.commonProps.onMoveUp(this.props.item)}
            ></button>
          <button
            className="fa fa-close"
            onClick={() => this.props.commonProps.onDelete(this.props.item)}
            style={buttonStyle}
          />
        </div>
      </div>
    );
  }
}

const VBox = props => {
  const style = props.style || {};
  style.display = "flex";
  style.flexDirection = "column";
  return <div style={style}>{props.children}</div>;
};
const HBox = props => {
  const style = props.style || {};
  style.display = "flex";
  style.flexDirection = "row";
  return <div style={style}>{props.children}</div>;
};

function formatTimestamp(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  date.getHours();
  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}
     ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
const buttonStyle = {
    margin: '0.25em',
    padding:'0.0em 0.25em',
    borderRadius:'0.25em',
}

const ModuleSummaryPanel = props => {
  const style = {
    padding: "1em",
    margin: "0.25em",
    backgroundColor: "#333",
    border: "1px solid gray"
  };
  let tags = [];
  if (props.module.tags) tags = props.module.tags;
  return (
    <VBox style={style}>
        <HBox>
            <button onClick={props.onAdd} style={buttonStyle}>add end</button>
            <button onClick={props.onAddNext} style={buttonStyle}>add next</button>
            <i style={{flex:1}}></i>
            <button onClick={props.onArchive} style={buttonStyle}>archive</button>
        </HBox>
      <HBox>
        <b>{props.module.title}</b>
        <span>&nbsp;by&nbsp;</span>
        <b>{props.module.author}</b>
        <i style={{ flex: 1 }}>&nbsp;</i>
      </HBox>
      <HBox>
        <p>{props.module.description}</p>
      </HBox>
        <HBox>
        <ThumbnailPanel module={props.module} scale={4}/>
        </HBox>

        <HBox>
        <span>made </span>
        <b>&nbsp;{formatTimestamp(props.module.timestamp)}</b>
        <span>&nbsp;tags</span>
        <b>&nbsp;{tags.join(",")}</b>
        <span style={{ flex: 1 }}>&nbsp;</span>
      </HBox>
      <HBox>
        <span>ID</span>
        <b>
          &nbsp;{props.module._id}{" "}
          <a
            target="_blank"
            href={`https://vr.josh.earth/jsconfeu-builder/api/modules/${
              props.module._id
            }`}
          >
            view json
          </a>
        </b>
          <button disabled={true} style={buttonStyle}>remix</button>
      </HBox>
    </VBox>
  );
};
