import React, { Component } from "react";
import ModuleStore from "../utils/ModuleStore";
import QueueModulePanel from "../components/QueueModulePanel";
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
  archiveModule = m => ModuleStore.archiveModule(m);
  deleteFromQueue = (m, i) => ModuleStore.deleteModuleFromQueue(m, i);
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
              onArchive={()=>this.archiveModule(m)}
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
            itemKey={"index"}
            template={EditableModulePanel}
            container={() => this.queue_modules_container}
            padding={10}
            onMoveEnd={this.moveEnded}
            commonProps={{
              onDelete: this.deleteFromQueue
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
        <QueueModulePanel module={this.props.item} scale={4} />
        <div>
          <button
            className="fa fa-close"
            onClick={() => this.props.commonProps.onDelete(this.props.item)}
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
    if(!ts) return ""
    const date = new Date(ts)
    date.getHours()
    return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}
     ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}


const ModuleSummaryPanel = props => {
    const style = {
        padding:'1em',
        margin:'0.25em',
        backgroundColor:'#333',
        border:'1px solid gray',
    }
    let tags = []
    if(props.module.tags) tags = props.module.tags
    return <VBox style={style}>
        <HBox>
            <b>{props.module.title}</b>
            <span>&nbsp;by&nbsp;</span>
            <b>{props.module.author}</b>
            <i style={{ flex: 1 }}>&nbsp;</i>
            <button onClick={props.onAdd}>+</button>
        </HBox>
        <HBox>
            <p>{props.module.description}</p>
        </HBox>
        <HBox>
            <span>made </span>
            <b>&nbsp;{formatTimestamp(props.module.timestamp)}</b>
            <span>&nbsp;tags</span>
            <b>&nbsp;{tags.join(",")}</b>
            <span style={{ flex: 1 }}>&nbsp;</span>
            <a onClick={props.onArchive}>x</a>
        </HBox>
        <HBox>
            <span>ID</span>
            <b>&nbsp;{props.module._id}</b>
        </HBox>
    </VBox>
};
