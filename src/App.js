import { useEffect, useState } from 'react';
import './App.css';
import { WebglPlot, WebglLine, ColorRGBA } from "webgl-plot";

function App() {

  const [x_zoom, setValue] = useState(1); // Initial value
  
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  function handleScroll(event) {
    if(event.deltaY > 0) {
      setValue(x_zoom + 0.1);
    } else {
      setValue(x_zoom - 0.1);
    }
  }

  useEffect(() => {
    const canvas = document.getElementById("my_canvas");
    var textCanvas = document.querySelector("#text");
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    textCanvas.width=textCanvas.clientWidth * 2;//actual width of canvas
    textCanvas.height = textCanvas.clientHeight * 2;
    const proportion = canvas.width/canvas.height;
    const color = new ColorRGBA(0, 0, 1, 1);
    const gridColor = new ColorRGBA(0, 0, 0, 1);
    const line = new WebglLine(color, canvas.width);

    const wglp = new WebglPlot(canvas);
    line.arrangeX();
    wglp.addLine(line);

    function drawAxis() {
      const xLine = new WebglLine(gridColor, 2);
      const yLine = new WebglLine(gridColor, 2);

      wglp.addLine(xLine);
      wglp.addLine(yLine);

      xLine.setX(0, -1)
      xLine.setX(1, 1)

      yLine.setY(0, -1)
      yLine.setY(1, 1)
    }

    function writeNumbers() {
      const number_of_numbers = 5;
      var ctx = textCanvas.getContext("2d");
      ctx.scale(2, 2);
      ctx.font = "15px serif";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for(let i = -number_of_numbers; i < number_of_numbers+1; i++) {
        ctx.fillText(Math.floor(i/x_zoom*100)/100, (i+number_of_numbers)*(canvas.width/(number_of_numbers*2)), canvas.height/2+15);
          //ctx.fillText(i/x_zoom, (i+number_of_numbers)*(canvas.width/(number_of_numbers*2)), canvas.height/2+15);
      }      
    }

    function drawGrid() {
      writeNumbers();
      const separation = 650;
      const number_of_lines_x = 8;
      const number_of_lines_y = Math.round(number_of_lines_x * proportion);
      const gridColor = new ColorRGBA(0, 0, 0, 0.5);
      const gridColor_2 = new ColorRGBA(0, 0, 0, 0.75);
      for (let i = -number_of_lines_x; i < number_of_lines_x; i++) {
        let chosenColor = gridColor;
        if((i+1)%3 === 0) {
          chosenColor = gridColor_2;
        }
        const aNewLine = new WebglLine(chosenColor, 2);
        aNewLine.setX(0, -1);
        aNewLine.setX(1, 1);
        aNewLine.offsetY = (i+1) * canvas.height/(separation * number_of_lines_x);
        wglp.addLine(aNewLine);
      }

      for (let i = -number_of_lines_y; i < number_of_lines_y; i++) {
        let chosenColor = gridColor;
        if((i+1)%3 === 0) {
          chosenColor = gridColor_2;
        }
        const aNewLine = new WebglLine(chosenColor, 2);
        aNewLine.setY(0, -1);
        aNewLine.setY(1, 1);
        aNewLine.offsetX = (i+1) * canvas.height/(separation * number_of_lines_y);
        wglp.addLine(aNewLine);
      }
    }

    drawGrid();
    drawAxis();

    function newFrame() {
      update();
      wglp.update();
      requestAnimationFrame(newFrame);
    }
    requestAnimationFrame(newFrame);

    async function update() {
      const amp = 0.005;
      for (let i = canvas.width/2; i < line.numPoints; i++) {
        //const ySin = ((i - line.numPoints/2)*freq)**2;
        //const ySin = Math.sin(Math.PI * (i) * freq * Math.PI * 2 * 1/value);
        const ySin = amp *Math.sin((i-canvas.width/2)/x_zoom)
        line.setY(i, ySin * x_zoom * proportion);
        line.setY(canvas.width - i, -1 * ySin * x_zoom * proportion);
      }
    }
  }, [x_zoom])

  return (
    <>
    <div className="w-64 mx-auto mt-8" style={{position: "absolute", zIndex: 2}}>
      <input
        type="range"
        min="0.01"
        max="30"
        step="0.05"
        value={x_zoom}
        onChange={handleChange}
        className="slider-thumb"
      />
      <p className="text-center mt-4">Value: {x_zoom}</p>
    </div>
    <canvas onWheel={handleScroll} style={{width: "100vw", height: "100vh", position: "absolute", zIndex: 0}} id="my_canvas"></canvas>
    <canvas id="text" style={{width: "100vw", height: "100vh", position: "absolute", zIndex: 1}}></canvas>
    </>
  );
}

export default App;