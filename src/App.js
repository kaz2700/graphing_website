import { useEffect, useState } from 'react';
import './App.css';
import { WebglPlot, WebglLine, ColorRGBA } from "webgl-plot";

function App() {

  const [x_zoom, setValue] = useState(5); // Initial value
  
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    const canvas = document.getElementById("my_canvas");
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    const color = new ColorRGBA(0, 0, 0, 1);
    const line = new WebglLine(color, canvas.width);

    const wglp = new WebglPlot(canvas);
    line.arrangeX();
    wglp.addLine(line);

    function drawAxis() {
      const xLine = new WebglLine(color, 2);
      const yLine = new WebglLine(color, 2);

      wglp.addLine(xLine);
      wglp.addLine(yLine);

      xLine.setX(0, -1)
      xLine.setX(1, 1)

      yLine.setY(0, -1)
      yLine.setY(1, 1)
    }

    function drawGrid() {
      const xLine = new WebglLine(color, 2);
      const yLine = new WebglLine(color, 2);

      wglp.addLine(xLine);
      wglp.addLine(yLine);

      for (let i = 0; i < 3; i++) {
        xLine.setX(0, -1)
        xLine.setX(1, 1)
        xLine.offsetY = i * 0.1

        yLine.setY(0, -1)
        yLine.setY(1, 1)
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
      const amp = 0.5;
      for (let i = canvas.width/2; i < line.numPoints; i++) {
        //const ySin = ((i - line.numPoints/2)*freq)**2;
        //const ySin = Math.sin(Math.PI * (i) * freq * Math.PI * 2 * 1/value);
        const ySin = amp *Math.sin((i-canvas.width/2)*0.01/x_zoom)
        const yNoise = Math.random() - 0.5;
        line.setY(i, ySin * x_zoom * canvas.height/canvas.width);
        line.setY(canvas.width - i, -1 * ySin * x_zoom * canvas.height/canvas.width);
      }
    }
  }, [x_zoom])

  return (
    <>
<div className="w-64 mx-auto mt-8">
      <input
        type="range"
        min="0.01"
        max="10"
        step="0.01"
        value={x_zoom}
        onChange={handleChange}
        className="slider-thumb"
      />
      <p className="text-center mt-4">Value: {x_zoom}</p>
    </div>
    <canvas style={{width: "100vw", height: "100vh"}} id="my_canvas"></canvas>
    </>
  );
}

export default App;
  