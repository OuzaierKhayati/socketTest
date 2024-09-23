import React, {useState, useEffect, useRef, useContext} from "react";
import { SocketContext } from "../socketContext";


const DrawBoard = () => {
  const socket = useContext(SocketContext);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [drawings, setDrawings] = useState([]); // To store drawing paths
  const [strokeColor, setStrokeColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      canvas.width = canvas.parentElement?.clientWidth || 0;
      canvas.height = canvas.parentElement?.clientHeight || 0;
      if (context) {
        context.strokeStyle = '#000000'; // Black color
        context.lineWidth = 2; // Line thickness
        context.lineJoin = 'round';
        context.lineCap = 'round';
        setCtx(context);
      }
    }
    // Set random stroke color
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setStrokeColor(randomColor);
  }, []);

  useEffect(() => {
    // Redraw the canvas after every render
    if (ctx) {
      ctx.clearRect(
        0,
        0,
        canvasRef.current?.width || 0,
        canvasRef.current?.height || 0
      ); // Clear screen
      // Redraw all the paths
      drawings.forEach((point, index) => {
        if (index === 0 || point.isDrawing === false) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = point.strokeColor || strokeColor;
          ctx.stroke();
        }
      });
    }
  }, [ctx, drawings, strokeColor]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const newPoint = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      strokeColor,
      isDrawing: false,
    };
    setDrawings((prev) => [...prev, newPoint]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const newPoint = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      strokeColor,
      isDrawing: true,
    };
    setDrawings((prev) => [...prev, newPoint]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    socket.emit('draw', drawings);
  };

  useEffect(() => {
    socket.on("draw", (msg) => {
      setDrawings(msg);
    });
  
    return () => {
      socket.off("draw");
    };
  }, [socket]);
 
  return (
    <>
      <div className="drawBoard">
        <canvas
          ref={canvasRef}
          className="cnavasPage"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        ></canvas>
      </div>
      
    </>
  );
};

export default DrawBoard;