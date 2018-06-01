const WHITE = 0xFFFFFFFF;
const BLACK = 0x000000FF;
const RED   = 0xFF0000FF;
const GREEN   = 0x00FF00FF;

function getWidth(fs) { return fs.width }
function getHeight(fs) { return fs.height }
function getColorAt(fs, x,y, t) {
    const n = y * getWidth(fs) + x
    return fs.frames[t][n]
}

function getPixelRGBA(fs, x,y, f) {
    const n = y * getWidth(fs) + x
    return fs.frames[f][n]
}
function setPixelRGBA(fs, x,y, f, c) {
    const n = y * getWidth(fs) + x
    fs.frames[f][n] = c
    return c
}
function getFrameCount(fs) { return fs.frames.length }

module.exports.makeContext = function(frameset) {
    return {
        getHeight: function() { return getHeight(frameset)},
        getWidth: function() { return getWidth(frameset)},
        setPixelRGBA: function(x,y,f,c) { return setPixelRGBA(frameset, x,y,f,c) },
        getPixelRGBA: function(x,y,f  ) { return getPixelRGBA(frameset, x,y,f) },
        getFrameCount: function() { return getFrameCount(frameset)},
    }
}
module.exports.makeFrameset = function (w,h,frameCount) {
    const frames = []
    for(let i=0; i<frameCount; i++) {
        const f1 = []
        for(let x = 0; x<w*h; x++) {
            f1[x] = BLACK
        }
        frames.push(f1)
    }
    return {
        width:w,
        height:h,
        frames:frames
    }
}

const canvas = document.createElement('canvas');

function imageData2png(data) {
    const context = canvas.getContext('2d')
    canvas.width = data.width;
    canvas.height = data.height;
    context.putImageData(data, 0, 0)
    return canvas.toDataURL('image/png')
}
module.exports.imageData2png = imageData2png

module.exports.data2pngs = function(anim, datas) {
    return Promise.resolve(datas.map(imageData2png));
}

module.exports.pngs2data = function(anim, pngs) {
    console.log("expanding data from pngs",pngs.length)

    const canvas = document.createElement('canvas')
    canvas.width = anim.cols
    canvas.height = anim.rows

    function ld(png,i) {
        return new Promise((res,rej) =>{
            const img = new Image()
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const context = canvas.getContext('2d');
                context.fillStyle = (i%2===0)?'red':'blue'
                context.fillRect(0,0,canvas.width,canvas.height)
                context.drawImage(img,0,0)
                return res(context.getImageData(0, 0, canvas.width, canvas.height))
            }
            img.src = png
        })
    }
    return Promise.all(pngs.map((png,i) => ld(png,i))).then((datas)=>{
        console.log("fully done loading them")
        return datas
    }).catch(e => {
        console.log('errors!',e)
    })
}

module.exports.animationBuffer2data = function (buffer, rows, cols, frames) {
    const frameLength = rows * cols * 3;

    const result = [];

    for (let frameIndex = 0; frameIndex < frames; frameIndex++) {
        const imageData = new ImageData(cols, rows);
        const data = imageData.data;
        const frame = new Uint8Array(buffer, frameIndex * frameLength, frameLength);
        for (let srcOffset = 0, destOffset = 0; srcOffset < frameLength; srcOffset += 3, destOffset += 4) {
            data[destOffset] = frame[srcOffset];
            data[destOffset + 1] = frame[srcOffset + 1];
            data[destOffset + 2] = frame[srcOffset + 2];
            data[destOffset + 3] = 0xFF;
        }

        new Uint32Array(data.buffer).reverse();

        result.push(imageData);
    }

    return result;
}
