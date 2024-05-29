import { useEffect, useState } from 'react';
import './App.css';
import { WebglPlot, WebglLine, ColorRGBA } from "webgl-plot";
const math = require('mathjs');
var keepUpdating = false;


function App() {

  const [funcion, setFuncion] = useState("0");
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
    wglp.addLine(line);
    line.arrangeX();

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
      for (let i = 0; i < line.numPoints; i++) {
        //var x = -1 + 2/line.numPoints * i
        ctx.fillText(Math.floor(i/x_zoom*100)/100, (i+number_of_numbers)*(canvas.width/(number_of_numbers*2)), canvas.height/2+15);
          if(i === 0) continue;
        ctx.fillText(Math.floor(i/x_zoom*100)/100, canvas.width/2+15, (i*proportion+number_of_numbers)*(canvas.height/(number_of_numbers*2)));
      }
    }

    function drawGrid() {
      writeNumbers();
      const number_of_lines = 8;
      const separation = 0.1;
      console.log(canvas.width)
      const gridColor = new ColorRGBA(0, 0, 0, 0.5);
      const gridColor_2 = new ColorRGBA(0, 0, 0, 0.75);
      for (let i = -number_of_lines; i < number_of_lines; i++) {
        let chosenColor = gridColor;
        if((i+1)%3 === 0) {
          chosenColor = gridColor_2;
        }
        const horizontalLine = new WebglLine(chosenColor, 2);
        horizontalLine.setX(0, -1);
        horizontalLine.setX(1, 1);
        horizontalLine.offsetY = (i+1) * separation * proportion;
        wglp.addLine(horizontalLine);
      
        const verticalLine = new WebglLine(chosenColor, 2);
        verticalLine.setY(0, -1);
        verticalLine.setY(1, 1);
        verticalLine.offsetX = (i+1)*  (separation);
        wglp.addLine(verticalLine);
      }
    }

    drawGrid();
    drawAxis();

    function newFrame() {
      update();
      wglp.update();
      //requestAnimationFrame(newFrame);
    }

    requestAnimationFrame(newFrame)

    async function update() {
      for (let i = 0; i < line.numPoints; i++) {
        if(!keepUpdating) {
            break;
        }
        const fixConstant = 0.1
        const multiplier = 1;
        line.setY(i, -1 + 2/line.numPoints * i);

        try {        
          line.setY(i, canvas.width/canvas.height * math_function(i, funcion, "x", fixConstant * multiplier));
        } catch (error) {
          console.log(error, "aaaa", keepUpdating)
          return;
        }
      }
      keepUpdating = true;
    }

    function evaluateExpression(expression, variable, value) {
      try {
          // Create a scope with the variable set to the specified value
          const scope = {};
          scope[variable] = value;
  
          // Parse and evaluate the expression
          const result = math.evaluate(expression, scope);
          return result;
      } catch (error) {
          console.error('Error evaluating expression:', error);
          keepUpdating = false;
          return null;
      }
    }

    function math_function(i, expression, variable, multiplier) {
      var value = 1/multiplier * (-1 + 2/line.numPoints * i) //es la x (o la letra elegida como variable) pero corregida por q i va por pixeles y empieza desde el centro de la pantalla, se va a usar para evaluar la funcion en ese punto
      const result = multiplier * evaluateExpression(expression, variable, value);
      return result;
    }
  }, [x_zoom, funcion])

  function runnit(event) {
    setFuncion(event.target.value)
  }

  return (
    <>
    <div className="w-64 mx-auto mt-8" style={{position: "absolute", zIndex: 2}}>
    <input 
        className="text-box"
            type="text"
            placeholder="Input a function"
            onChange={(event) => {runnit(event)}}
      />
      <input
        type="range"
        min="0.01"
        max="30"
        step="0.05"
        value={x_zoom}
        onChange={handleChange}
        className="slider-thumb"
      />
      Value: {x_zoom}
    </div>
    <canvas onWheel={handleScroll} style={{width: "100vw", height: "100vh", position: "absolute", zIndex: 0}} id="my_canvas"></canvas>
    <canvas id="text" style={{width: "100vw", height: "100vh", position: "absolute", zIndex: 1}}></canvas>
    </>
  );
}

export default App;