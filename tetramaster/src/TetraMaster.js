import React, { useEffect, useRef, useState } from 'react';

// Color and block definitions
const COLORS = {
  I: '#40c9ff',
  J: '#715AFF',
  L: '#fbb13c',
  O: '#ffe156',
  S: '#43e97b',
  T: '#ad3bcf',
  Z: '#fa4659',
  empty: 'rgba(242,233,228,0.10)'
};
const GRID_BG = '#22223b';
const SIDEBAR_BG = '#4a4e69';
const ACCENT = '#f2e9e4';

const BLOCKS = {
  I: [
    [[0,1,0,0],
     [0,1,0,0],
     [0,1,0,0],
     [0,1,0,0]],
    [[0,0,0,0],
     [1,1,1,1],
     [0,0,0,0],
     [0,0,0,0]]
  ],
  J: [
    [[1,0,0],
     [1,1,1],
     [0,0,0]],
    [[0,1,1],
     [0,1,0],
     [0,1,0]],
    [[0,0,0],
     [1,1,1],
     [0,0,1]],
    [[0,1,0],
     [0,1,0],
     [1,1,0]]
  ],
  L: [
    [[0,0,1],
     [1,1,1],
     [0,0,0]],
    [[0,1,0],
     [0,1,0],
     [0,1,1]],
    [[0,0,0],
     [1,1,1],
     [1,0,0]],
    [[1,1,0],
     [0,1,0],
     [0,1,0]]
  ],
  O: [
    [[1,1],
     [1,1]]
  ],
  S: [
    [[0,1,1],
     [1,1,0],
     [0,0,0]],
    [[0,1,0],
     [0,1,1],
     [0,0,1]]
  ],
  T: [
    [[0,1,0],
     [1,1,1],
     [0,0,0]],
    [[0,1,0],
     [0,1,1],
     [0,1,0]],
    [[0,0,0],
     [1,1,1],
     [0,1,0]],
    [[0,1,0],
     [1,1,0],
     [0,1,0]]
  ],
  Z: [
    [[1,1,0],
     [0,1,1],
     [0,0,0]],
    [[0,0,1],
     [0,1,1],
     [0,1,0]]
  ]
};

const BLOCK_TYPES = Object.keys(BLOCKS);
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const INITIAL_FALL_INTERVAL = 700; // ms for beginning, speeds up as score rises

// Utility for deep clone
const clone = obj => JSON.parse(JSON.stringify(obj));

// --- GAME LOGIC HELPERS ---

function getRandomBlockType() {
  // Shuffle next block to ensure variety.
  return BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
}

function getBlockShape(type, rotation=0) {
  const forms = BLOCKS[type];
  // O block only has one rotation
  return forms[rotation % forms.length];
}

function checkCollision(grid, block, pos, rotation) {
  const shape = getBlockShape(block.type, rotation);
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (!shape[y][x]) continue;
      const px = pos.x + x;
      const py = pos.y + y;
      if (px < 0 || px >= GRID_WIDTH || py >= GRID_HEIGHT) return true;
      if (py >= 0 && grid[py][px] !== '') return true;
    }
  }
  return false;
}

function mergeBlock(grid, block, pos, rotation) {
  const shape = getBlockShape(block.type, rotation);
  const newGrid = clone(grid);
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (shape[y][x]) {
        const px = pos.x + x;
        const py = pos.y + y;
        if (py >= 0) newGrid[py][px] = block.type;
      }
    }
  }
  return newGrid;
}

function clearLines(grid) {
  let cleared = 0;
  let newGrid = grid.filter(row => row.some(cell => cell === ''));
  cleared = GRID_HEIGHT - newGrid.length;
  while (newGrid.length < GRID_HEIGHT) newGrid.unshift(Array(GRID_WIDTH).fill(''));
  return {newGrid, clearedLines: cleared};
}

// --- MAIN COMPONENT ---

// PUBLIC_INTERFACE
function TetraMaster() {
  /**
   * Main TetraMaster Tetris game component.
   */

  // Game state
  const [grid, setGrid] = useState(() =>
    Array.from({length: GRID_HEIGHT}, _ => Array(GRID_WIDTH).fill(''))
  );
  const [block, setBlock] = useState(null);        // {type, rotation}
  const [pos, setPos] = useState({x: 3, y: -2});   // start position (above grid for drop-in effect)
  const [nextBlock, setNextBlock] = useState(() => ({type: getRandomBlockType(), rotation: 0}));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [intervalMs, setIntervalMs] = useState(INITIAL_FALL_INTERVAL);
  const [running, setRunning] = useState(false);

  const fallTimer = useRef();

  /* Reset Game State */
  // PUBLIC_INTERFACE
  function startGame() {
    const initBlock = {type: getRandomBlockType(), rotation: 0};
    setGrid(Array.from({length: GRID_HEIGHT}, _ => Array(GRID_WIDTH).fill('')));
    setBlock(initBlock);
    setNextBlock({type: getRandomBlockType(), rotation: 0});
    setScore(0);
    setIntervalMs(INITIAL_FALL_INTERVAL);
    setPos({x: 3, y: -2});
    setGameOver(false);
    setRunning(true);
  }

  /* Drop block by 1, check for landing */
  function dropBlock(byOne=true) {
    if (!running || !block || gameOver) return;
    const newY = pos.y + 1;
    if (!checkCollision(grid, block, {x: pos.x, y: newY}, block.rotation)) {
      setPos(p => ({...p, y: newY}));
    } else {
      // Merge block into grid
      const merged = mergeBlock(grid, block, pos, block.rotation);
      // Clear lines
      const {newGrid, clearedLines} = clearLines(merged);
      // Scoring: 100/line, extra for more at once; Increase speed each 10 lines
      let sc = score + (clearedLines ? 100 * Math.pow(2, clearedLines-1) : 0);
      let intv = INITIAL_FALL_INTERVAL - Math.floor(sc / 400) * 70; // speed up every ~400pts
      if (intv < 120) intv = 120;
      setScore(sc);
      setIntervalMs(intv);

      // Spawn next block
      const spawn = {type: nextBlock.type, rotation: 0};
      const initialPos = {x: 3, y: -2};
      // Check if spawn is blocked (game over)
      if (checkCollision(newGrid, spawn, initialPos, 0)) {
        setGrid(newGrid);
        setGameOver(true);
        setRunning(false);
      } else {
        setGrid(newGrid);
        setBlock(spawn);
        setNextBlock({type: getRandomBlockType(), rotation: 0});
        setPos(initialPos);
      }
    }
  }

  /* Sideways or rotate move (left, right, rotate, soft drop) */
  // PUBLIC_INTERFACE
  function moveBlock(dir) {
    if (!block || !running || gameOver) return;
    let deltaX = 0, deltaY = 0, nextRotation = block.rotation;
    switch (dir) {
      case 'left': deltaX = -1; break;
      case 'right': deltaX = 1; break;
      case 'down': deltaY = 1; break;
      case 'rotate':
        nextRotation = (block.rotation + 1) % BLOCKS[block.type].length;
        break;
      default: return;
    }
    let tryPos = {x: pos.x + deltaX, y: pos.y + deltaY};
    let rot = nextRotation;
    if (!checkCollision(grid, block, tryPos, rot)) {
      if (dir === 'rotate') {
        setBlock(b => ({...b, rotation: rot}));
      }
      setPos(tryPos);
    } else if (dir === 'rotate') {
      // Try kick: wall rotate kicks; nudge block if possible
      for (let dx of [-1,1,-2,2]) {
        if (!checkCollision(grid, block, {x: pos.x + dx, y: pos.y}, rot)) {
          setPos(p => ({...p, x: p.x+dx}));
          setBlock(b => ({...b, rotation: rot}));
          break;
        }
      }
    }
  }

  /* Keyboard Controls */
  useEffect(() => {
    if (!running || gameOver) return;
    function handleKeyDown(e) {
      if (e.code === 'ArrowLeft') {
        moveBlock('left');
      } else if (e.code === 'ArrowRight') {
        moveBlock('right');
      } else if (e.code === 'ArrowDown') {
        moveBlock('down');
      } else if (e.code === 'ArrowUp') {
        moveBlock('rotate');
      } else if (e.code === 'Space') {
        // Hard drop
        while (!checkCollision(grid, block, {x: pos.x, y: pos.y+1}, block.rotation)) {
          setPos(p => ({x: p.x, y: p.y+1}));
        }
        dropBlock();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [block, pos, running, gameOver, grid]);

  /* Falling timer */
  useEffect(() => {
    if (!running || !block || gameOver) return;
    fallTimer.current && clearInterval(fallTimer.current);
    fallTimer.current = setInterval(() => {
      dropBlock();
    }, intervalMs);
    return () => clearInterval(fallTimer.current);
    // eslint-disable-next-line
  }, [running, intervalMs, block, pos, grid, gameOver]);

  // Soft drop (down arrow, not just timer)
  useEffect(() => {
    if (!block || !running || gameOver) return;
    function fastDrop(e) {
      if (e.code === 'ArrowDown') {
        dropBlock();
      }
    }
    window.addEventListener('keydown', fastDrop);
    return () => window.removeEventListener('keydown', fastDrop);
    // eslint-disable-next-line
  }, [block, pos, running, gameOver, grid]);

  // Draws current grid plus falling block as previewed
  function renderDisplayGrid() {
    // Shallow copy; overlay block
    const display = grid.map(row => [...row]);
    if (block) {
      const shape = getBlockShape(block.type, block.rotation);
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[0].length; x++) {
          if (shape[y][x]) {
            const px = pos.x + x;
            const py = pos.y + y;
            if (py >= 0 && px >= 0 && px < GRID_WIDTH && py < GRID_HEIGHT) {
              display[py][px] = block.type;
            }
          }
        }
      }
    }
    return display;
  }

  // Preview for sidebar
  function renderNextBlockPreview() {
    const shape = getBlockShape(nextBlock.type, 0);
    return (
      <div
        style={{
          display: 'inline-block',
          background: GRID_BG,
          borderRadius: 6,
          padding: '8px',
          margin: '8px auto',
        }}>
        {
          shape.map((row, y) =>
            <div key={y} style={{display:'flex'}}>
              {row.map((cell, x) => (
                <div
                  key={x}
                  style={{
                    width: 18, height: 18, margin: 1,
                    borderRadius: 3,
                    background: cell ? COLORS[nextBlock.type] : COLORS.empty,
                    border: cell ? `1.5px solid ${ACCENT}` : '1px solid #3334',
                  }}
                />
              ))}
            </div>
          ))
        }
      </div>
    );
  }

  // Game over text
  function renderGameOver() {
    if (!gameOver) return null;
    return (
      <div style={{
        position: 'absolute',
        top: '38%',
        left: '13%',
        right: '13%',
        background: 'rgba(70,60,100,0.86)',
        color: ACCENT,
        textAlign: 'center',
        borderRadius: 12,
        padding: 32,
        zIndex: 10,
        boxShadow: '0 6px 32px rgba(30,8,44,0.18)'
      }}>
        <div style={{fontSize: 32, fontWeight: 800, letterSpacing: 1, lineHeight: "1.2"}}>GAME OVER</div>
        <div style={{margin: '18px auto', color: '#ffe156dd', fontSize: 17}}>Score: {score}</div>
        <button
          className='btn btn-large'
          style={{
            fontSize: 19,
            marginTop: 10
          }}
          onClick={startGame}
        >Restart</button>
      </div>
    );
  }

  // Render grid
  const displayGrid = renderDisplayGrid();

  return (
    <div style={{
      background: GRID_BG,
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      {/* Play Area and Sidebar */}
      <div style={{
        display: 'flex',
        gap: 32,
        boxShadow: '0 2px 36px 0 #1a1a1a26',
        padding: 24,
        borderRadius: 12,
        background: 'rgba(34,34,59,0.97)',
        border: `2px solid ${SIDEBAR_BG}`,
        marginTop: 60,
        marginBottom: 38,
      }}>
        {/* Play grid */}
        <div style={{
          position: 'relative'
        }}>
          <div style={{
            background: GRID_BG,
            display: 'grid',
            borderRadius: 8,
            border: `3px solid ${ACCENT}`,
            gridTemplateColumns: `repeat(${GRID_WIDTH}, 28px)`,
            gridTemplateRows: `repeat(${GRID_HEIGHT}, 28px)`,
            gap: 1.5,
            boxShadow: "0 1px 16px #17174533",
            position: "relative",
            zIndex: 1
          }}>
            {displayGrid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 5,
                    background: cell ? COLORS[cell] : COLORS.empty,
                    border: cell ? `2px solid ${ACCENT}` : '1.4px solid #262655',
                    boxSizing: 'border-box',
                    boxShadow: cell ? '0 2px 6px #0005' : 'none',
                    transition: 'background 0.08s'
                  }}
                />
              ))
            )}
          </div>
          {/* GameOver overlay */}
          {renderGameOver()}
        </div>
        {/* Sidebar */}
        <div style={{
          width: 140,
          background: SIDEBAR_BG,
          color: ACCENT,
          borderRadius: 10,
          padding: '20px 14px 20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          alignItems: 'center',
          border: `2.5px solid ${ACCENT}`,
          boxShadow: "0 0px 18px #231d29bb"
        }}>
          <div style={{fontWeight: 700, fontSize: 19, marginBottom: 4, color: "#ffe156d9", letterSpacing: 1}}>
            Score
          </div>
          <div style={{
            minHeight: 38,
            fontSize: 27,
            fontWeight: 800,
            color: "#fff"
          }}>
            {score}
          </div>
          <div style={{ height: 1, width: '100%', margin: '8px 0', background: 'rgba(255,255,255,0.13)' }}/>
          <div style={{ fontWeight: 500, fontSize: 17, color: ACCENT, marginBottom: 2 }}>
            Next Block
          </div>
          {renderNextBlockPreview()}
          <button
            className='btn btn-large'
            style={{
              marginTop: '20px',
              width: '92px',
              background: running ? '#fa4659cc' : '#43e97bcc',
              fontWeight: '700',
              letterSpacing: 0.6,
              fontSize: 17,
              border: `2.5px solid ${ACCENT}`,
              borderRadius: 7,
              outline: 'none'
            }}
            onClick={() => (running ? setRunning(false) : startGame())}
            disabled={running}
          >
            {running ? "Pause" : "Start"}
          </button>
          <div style={{
            fontSize: 11, color: ACCENT, marginTop: 20, fontWeight: 400, opacity: 0.93, textAlign: 'center'
          }}>
            <div style={{opacity: 0.8}}>← → rotate/drop</div>
            <div>␣=hard drop</div>
            <div>Down=soft drop</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TetraMaster;
