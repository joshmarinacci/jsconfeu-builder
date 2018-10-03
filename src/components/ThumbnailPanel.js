import React, {Component} from 'react'
import ModuleStore from '../utils/ModuleStore'

export class ThumbnailPanel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            width: 10,
            height: 10,
        }
        const thumb = ModuleStore.getThumbnailForModule(this.props.module);
        if (thumb.complete) {
            this.state.width = thumb.width
            this.state.height = thumb.height
        }
    }

    componentDidMount() {
        ModuleStore.on('thumbnail', this.thumbnailLoaded)
        this.drawThumbnail(this.canvas, this.props.module, this.props.scale);
    }

    componentWillUnmount() {
        ModuleStore.off('thumbnail', this.thumbnailLoaded)
    }

    thumbnailLoaded = () => {
        const thumb = ModuleStore.getThumbnailForModule(this.props.module);
        if (thumb.width !== this.state.width || thumb.height !== this.state.height) {
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