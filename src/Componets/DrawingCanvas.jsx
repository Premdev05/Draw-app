import { useRef, useState, useEffect } from "react";

export default function DrawingCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  //Initial Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    ctxRef.current = ctx;
  }, []);

  //Save canvas state
  const saveState = () => {
    const canvas = canvasRef.current;
    setHistory((prev) => [...prev, canvas.toDataURL()]);
    setRedoStack([]);
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
    saveState();
  };

  const undo = () => {
    if (history.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    const newHistory = [...history];
    const lastState = newHistory.pop();

    setRedoStack((prev) => [...prev, canvas.toDataURL()]);
    setHistory(newHistory);

    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    const newRedo = [...redoStack];
    const redoState = newRedo.pop();

    setHistory((prev) => [...prev, canvas.toDataURL()]);
    setRedoStack(newRedo);

    const img = new Image();
    img.src = redoState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  return (
    <div className="">
      <div className=" ">
        <button
          onMouseDown={undo}
          className=""
        >
          Undo
        </button>
        <button
          onClick={redo}
          className=""
        >
          Redo
        </button>
        <button
          onClick={clearCanvas}
          className=""
        >
          Clear
        </button>

        <canvas 
        ref={canvasRef}
        className=""
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}
