basics to start development


```
git clone <this repo url>
cd <this repo dir>
npm install
npm start
```

wait for a bit, then the browser will open to http://localhost:3000/# and you'll see the home screen.
When you edit any file in `/src` the app will automatically reload.
Edit `App.css` or `index.css` as needed.




-----

## JSON frame format

Animation frames are represented as a 1D array of frames, along with a width and height. 
A frame is represented as a 1d array of pixels.
A pixel is a 32bit integer in the format RGBA, where each component is a number between 0 and 255.
Each frame has the same width and height, as specified by the width and height of the animation.

ex:  a 2x2 animation with 2 frames, one red and one black would look like this:

```
{
    width: 2,
    height: 2,
    frames: [
        [0xFF0000FF,0xFF0000FF,0xFF0000FF,0xFF0000FF],
        [0x000000FF,0x000000FF,0x000000FF,0x000000FF]
    ]
}
``` 






In addition to the animation frames, the module also has the following properties

* `title`, string
* `description`, string
* `author`, string
* `tags`, an array of strings
