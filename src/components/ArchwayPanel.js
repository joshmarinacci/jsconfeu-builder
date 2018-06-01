import React, { Component } from "react";
import * as OBJLoader from "../utils/OBJLoader.js";
import Constants from "../Constants";
const THREE = require("three");

export default class ArchwayPanel extends Component {
  componentDidMount() {
    this.mounted = true;
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, -70, 100).normalize();
    this.scene.add(directionalLight);
    this.materials = new Map(); // name (string like 1x10 for RxC) => THREE.Material
    const w = 600;
    const h = 400;
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setSize(w, h);

    this.currentFrame = 0;

    const plane_geometry = new THREE.PlaneGeometry(100, 100, 8);
    const plane_material = new THREE.MeshLambertMaterial({
      color: 0x666666,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(plane_geometry, plane_material);
    plane.rotation.x = -90 * Math.PI / 180;
    plane.position.y = -2.0;
    plane.position.z = -10;
    this.scene.add(plane);

    this.loaded = false;
    const loader = new THREE.OBJLoader();
    loader.load(
      "models/PreppedInstallation.obj",
      object => {
        object.position.set(0, -1.5, -8.5);
        this.scene.add(object);
        for (let material of object.children[0].material) {
          this.materials.set(material.name, material);
          if (material.name === "edge_material") {
            material.color = new THREE.Color(0xaaaaaa);
            // material.emissive = new THREE.Color(0xFFFFFF)
          }
        }
        window.obj = object;
        this.arch = object;
        this.loaded = true;
      },
      null,
      err => {
        console.error("Could not load the archway", err);
      }
    );
    this.startRepaint();
    console.log("running with the frames", this.props.frames);
  }
  cycleFrames() {
    if (!this.loaded) return;
    this.currentFrame++;
    if (!this.props.frames) return;
    const data = this.props.frames.data;
    const frame = data[this.currentFrame % data.length];
    this.loadFrame(frame);
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  loadFrame(frame) {
    for (let r = 0; r < frame.height; r++) {
      for (let c = 0; c < frame.width; c++) {
        let material = this.materials.get(`${c}x${r}`);
        if (!material) continue;
        const n = (r * frame.width + c) * 4;
        const color =
          (frame.data[n] << 24) |
          (frame.data[n + 1] << 16) |
          (frame.data[n + 2] << 8) |
          frame.data[n + 3];
        material.color.setHex(color >> 8); // The shift drops the alpha bits

      }
    }
    window.mats = this.materials;
  }

  startRepaint() {
    const repaint = time => {
      if (!this.mounted) return;
      this.cycleFrames();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(repaint);
    };
    repaint();
  }
  render() {
    return (
      <canvas
        className="queue-module__preview"
        ref={canvas => (this.canvas = canvas)}
        onMouseMove={this.mouseMove}
        onMouseDown={this.mouseDown}
        onMouseUp={this.mouseUp}
      />
    );
  }

  mouseDown = e => {
    this.startX = e.clientX;
    this.startRY = this.arch.rotation.y;
  };
  mouseMove = e => {
    if (e.buttons === 1) {
      const dx = e.clientX - this.startX;
      const dry = dx * Math.PI / 180;
      this.arch.rotation.y = this.startRY + dry;
    }
  };
  mouseUp = e => {};
}

