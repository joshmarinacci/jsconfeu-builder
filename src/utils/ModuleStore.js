import Constants from "../Constants";
import AuthStore from "./AuthStore";
import {data2pngs, pngs2data} from './RenderUtils'

class ModuleStore {
  constructor() {
    this.queue = {
      expanded: [],
      modules: []
    };
    this.listeners = {};
    this.running = false;
    this.images = {}
    this.refreshQueue();
  }
  on(type, cb) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
    return cb;
  }
  off(type, cb) {
    this.listeners[type] = this.listeners[type].filter(c => c !== cb);
  }
  fire(type, obj) {
      if(this.listeners[type]) this.listeners[type].forEach(cb => cb(obj));
  }
  findAllModules = () =>
    fetch(`${Constants.BASE_URL}/modules`)
          .then(res => res.json())
          .then(res => {
              console.log("got the modules", res);
              this.fire('modules',res)
              return res;
          })
          .catch(e => {
              console.log("error fetching all the modules:", e);
              return [];
          });

  refreshQueue() {
    return fetch(`${Constants.BASE_URL}/queue`)
      .then(res => res.json())
      .then(res => {
          console.log("got back the queue",res)
          if(res.success === true) {
              this.queue = res.queue;
              this.queue.expanded.forEach((m, i) => (m.index = i));
              this.fire("queue", this.queue);
          } else {
              console.log('there was an error fetching the queue',res)
          }
      })
      .catch(e => {
        console.log("error fetching the queue:", e);
      });
  }

  fetchFirstItem() {
      if(this.queue.modules.length <= 0) return Promise.resolve(null)
      const id = this.queue.modules[0]
      return fetch(`${Constants.BASE_URL}/modules/${id}`)
          .then(res => res.json())
          .then(res => {
              if(res.success) {
                  const anim = res.doc.manifest.animation
                  return pngs2data(anim,anim.data).then((decoded) => {
                      anim.data = decoded
                      return res.doc
                  })
              }
              console.log("loading the first item of the queue failed",res)
              return null
          })
  }

  getQueueModules = () => this.queue.expanded;

  setQueueModules = nq => {
    this.queue.expanded = nq;
    this.queue.modules = this.queue.expanded.map(m => m._id);
    return this.updateQueue();
  };

  submitModule(module) {
      const filemap = Object.keys(module.manifest.files).map(fname => {
          return { path: fname, content: module.manifest.files[fname]}
      })
      module.manifest.filemap = filemap
      delete module.manifest.files


      const anim = module.manifest.animation
      return data2pngs(anim,anim.data).then(pngs=>{
          anim.data = pngs
          return module
      }).then((module)=>{
          console.log("POSTing module",module)
          const body = JSON.stringify(module)
          console.log("size is", Math.floor(body.length/1024) + "kb")
          return fetch(`${Constants.BASE_URL}/publish`, {
              method: "POST",
              body: body,
              mode: "cors",
              headers: {
                  "Content-Type": "application/json",
                  "Content-Length": body.length.toString(),
                  "access-key": AuthStore.getAccessToken()
              }
          })
      })
          .then(res => res.json())
          .then(res => {
              console.log('result of submitting',res)
              return res
          })
  }

  archiveModule = m => {
      console.log("archiving the module")
      fetch(`${Constants.BASE_URL}/modules/archive/${m._id}`,{
          method:'POST',
          body: '',
          mode: "cors",
          headers: {
              "Content-Type": "application/json",
              "access-key": AuthStore.getAccessToken()
          }
      })
          .then(res=>res.json())
          .then(res => {
              console.log("marked the module as archived",res)
              return res
          })
          .then(()=>this.findAllModules())
  }
  addModuleToQueue = m => {
    this.queue.expanded.push(m);
    this.queue.modules = this.queue.expanded.map(m => m._id);
    return this.updateQueue();
  };
  addModuleToQueueNext = m => {
      this.queue.expanded.unshift(m)
      this.queue.modules = this.queue.expanded.map(m => m._id);
      return this.updateQueue();
  }
  updateQueue = () => {
    return fetch(`${Constants.BASE_URL}/updatequeue`, {
      method: "POST",
      body: JSON.stringify(this.queue.modules),
      mode: "cors",
      headers: {
        "content-type": "application/json",
        "access-key": AuthStore.getAccessToken()
      }
    })
      .then(res => res.json())
      .then(res => console.log(res))
      .then(res => this.refreshQueue());
  };
  deleteModuleFromQueue = m => {
    const i = m.index;
    this.queue.expanded.splice(i, 1);
    this.queue.modules.splice(i, 1);
    console.log("the new queue is", this.queue.modules.length);
    return this.updateQueue();
  };


    getThumbnailForModule(m) {
        if(this.images[m._id]) return this.images[m._id]
        const img = new Image()
        img.crossOrigin = "anonymous";
        img.onload = () => this.fire('thumbnail')
        img.src = m.thumbnail
        this.images[m._id] = img
        return this.images[m._id]
    }
}

export default new ModuleStore();
