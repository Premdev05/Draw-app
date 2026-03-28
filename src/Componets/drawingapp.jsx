import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

const Drawingapp = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6'); // Tailwind Blue 500
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState('brush'); // brush, rect, circle
  
  // History Management
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(-1);

  // Initialize Canvas & Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Initial blank state
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, step + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setStep(newHistory.length - 1);
  };

  const undo = () => {
    if (step <= 0) return;
    const newStep = step - 1;
    setStep(newStep);
    applyState(history[newStep]);
  };

  const redo = () => {
    if (step >= history.length - 1) return;
    const newStep = step + 1;
    setStep(newStep);
    applyState(history[newStep]);
  };

  const applyState = (dataUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');

    if (tool === 'brush') {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
    // Shape previews would require a secondary "temp" canvas. 
    // For this simple version, we'll finalize shapes onMouseUp.
  };

  const stopDrawing = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');

    if (tool === 'rect') {
      ctx.strokeRect(offsetX - 50, offsetY - 25, 100, 50);
    } else if (tool === 'circle') {
      ctx.beginPath();
      ctx.arc(offsetX, offsetY, 40, 0, 2 * Math.PI);
      ctx.stroke();
    }

    ctx.closePath();
    setIsDrawing(false);
    saveState();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  return (
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden font-sans">
      {/* UI Overlay */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex flex-wrap gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white">
        
        {/* Colors */}
        <div className="flex gap-2 items-center border-r pr-4">
          {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#000000'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 bg-transparent cursor-pointer" />
        </div>

        {/* Tools */}
        <div className="flex gap-2 border-r pr-4">
          {['brush', 'rect', 'circle'].map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`px-3 py-1 rounded-lg capitalize text-sm font-medium transition ${tool === t ? 'bg-slate-800 text-white' : 'hover:bg-slate-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* History & Actions */}
        <div className="flex gap-2">
          <button onClick={undo} className="p-2 hover:bg-slate-200 rounded-lg">↩️</button>
          <button onClick={redo} className="p-2 hover:bg-slate-200 rounded-lg">↪️</button>
          <button onClick={clearCanvas} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">Clear</button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="block cursor-crosshair bg-white"
      />
    </div>
  );
};

export default Drawingapp;