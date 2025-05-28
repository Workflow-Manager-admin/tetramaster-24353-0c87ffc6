import React, { useEffect, useRef, useState } from 'react';

/**
 * Prevent default scroll for ArrowDown/up/left/right regardless of game focus.
 * Global event listener ensures arrow key controls never scroll page.
 */
function preventArrowScroll(e) {
  if (
    e.code === "ArrowDown" ||
    e.code === "ArrowUp" ||
    e.code === "ArrowLeft" ||
    e.code === "ArrowRight" ||
    e.key === "Down" ||
    e.key === "Up" ||
    e.key === "Left" ||
    e.key === "Right"
  ) {
    e.preventDefault();
    return false;
  }
}
// Color and block definitions
const COLORS = {
  I: '#40c9ff',
  J: '#715AFF',
  L: '#fbb13c',
  O: '#ffe156',
  S: '#43e97b',
  T: '#ad3bcf',
  Z: '#fa4659',
  empty: 'rgba(242,233,228,0.10)',
};
const GRID_BG = '#22223b';
const SIDEBAR_BG = '#4a4e69';
const ACCENT = '#f2e9e4';

const BLOCKS = {
  I: [
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  O: [[[1, 1], [1, 1]]],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  ],
};

const BLOCK_TYPES = Object.keys(BLOCKS);
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const INITIAL_FALL_INTERVAL = 700;

// Utility for deep clone
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// --- GAME LOGIC HELPERS ---
function getRandomBlockType() {
  return BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
}

function getBlockShape(type, rotation = 0) {
  const forms = BLOCKS[type];
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
  let newGrid = grid.filter((row) => row.some((cell) => cell === ''));
  cleared = GRID_HEIGHT - newGrid.length;
  while (newGrid.length < GRID_HEIGHT) newGrid.unshift(Array(GRID_WIDTH).fill(''));
  return { newGrid, clearedLines: cleared };
}

// --- MAIN COMPONENT ---
// PUBLIC_INTERFACE
function TetraMaster() {
  /**
   * Main TetraMaster Tetris game component.
   */
  const [grid, setGrid] = useState(() =>
    Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(''))
  );
  const [block, setBlock] = useState(null);
  const [pos, setPos] = useState({ x: 3, y: -2 });
  const [nextBlock, setNextBlock] = useState(() => ({
    type: getRandomBlockType(),
    rotation: 0,
  }));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [intervalMs, setIntervalMs] = useState(INITIAL_FALL_INTERVAL);
  const [running, setRunning] = useState(false);

  const fallTimer = useRef();

  // PUBLIC_INTERFACE
  function startGame() {
    const initBlock = { type: getRandomBlockType(), rotation: 0 };
    setGrid(Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill('')));
    setBlock(initBlock);
    setNextBlock({ type: getRandomBlockType(), rotation: 0 });
    setScore(0);
    setIntervalMs(INITIAL_FALL_INTERVAL);
    setPos({ x: 3, y: -2 });
    setGameOver(false);
    setRunning(true);
  }

  function dropBlock(byOne = true) {
    if (!running || !block || gameOver) return;
    const newY = pos.y + 1;
    if (!checkCollision(grid, block, { x: pos.x, y: newY }, block.rotation)) {
      setPos((p) => ({ ...p, y: newY }));
    } else {
      const merged = mergeBlock(grid, block, pos, block.rotation);
      const { newGrid, clearedLines } = clearLines(merged);
      let sc = score + (clearedLines ? 100 * Math.pow(2, clearedLines - 1) : 0);
      let intv = INITIAL_FALL_INTERVAL - Math.floor(sc / 400) * 70;
      if (intv < 120) intv = 120;
      setScore(sc);
      setIntervalMs(intv);

      const spawn = { type: nextBlock.type, rotation: 0 };
      const initialPos = { x: 3, y: -2 };
      if (checkCollision(newGrid, spawn, initialPos, 0)) {
        setGrid(newGrid);
        setGameOver(true);
        setRunning(false);
      } else {
        setGrid(newGrid);
        setBlock(spawn);
        setNextBlock({ type: getRandomBlockType(), rotation: 0 });
        setPos(initialPos);
      }
    }
  }

  // PUBLIC_INTERFACE
  function moveBlock(dir) {
    if (!block || !running || gameOver) return;
    let deltaX = 0,
      deltaY = 0,
      nextRotation = block.rotation;
    switch (dir) {
      case 'left':
        deltaX = -1;
        break;
      case 'right':
        deltaX = 1;
        break;
      case 'down':
        deltaY = 1;
        break;
      case 'rotate':
        nextRotation = (block.rotation + 1) % BLOCKS[block.type].length;
        break;
      default:
        return;
    }
    let tryPos = { x: pos.x + deltaX, y: pos.y + deltaY };
    let rot = nextRotation;
    if (!checkCollision(grid, block, tryPos, rot)) {
      if (dir === 'rotate') {
        setBlock((b) => ({ ...b, rotation: rot }));
      }
      setPos(tryPos);
    } else if (dir === 'rotate') {
      for (let dx of [-1, 1, -2, 2]) {
        if (!checkCollision(grid, block, { x: pos.x + dx, y: pos.y }, rot)) {
          setPos((p) => ({ ...p, x: p.x + dx }));
          setBlock((b) => ({ ...b, rotation: rot }));
          break;
        }
      }
    }
  }

  // Always suppress browser scroll for arrow keys
  useEffect(() => {
    window.addEventListener('keydown', preventArrowScroll, { passive: false });
    return () => window.removeEventListener('keydown', preventArrowScroll, { passive: false });
  }, []);

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
        while (!checkCollision(grid, block, { x: pos.x, y: pos.y + 1 }, block.rotation)) {
          setPos((p) => ({ x: p.x, y: p.y + 1 }));
        }
        dropBlock();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [block, pos, running, gameOver, grid]);

  useEffect(() => {
    if (!running || !block || gameOver) return;
    fallTimer.current && clearInterval(fallTimer.current);
    fallTimer.current = setInterval(() => {
      dropBlock();
    }, intervalMs);
    return () => clearInterval(fallTimer.current);
    // eslint-disable-next-line
  }, [running, intervalMs, block, pos, grid, gameOver]);

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

  function renderDisplayGrid() {
    const display = grid.map((row) => [...row]);
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

  function renderNextBlockPreview() {
    const shape = getBlockShape(nextBlock.type, 0);
    return (
      <div
        style={{
          display: 'inline-block',
          background: GRID_BG,
          borderRadius: 2.5,
          padding: '0.8px',
          margin: '0px auto',
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {shape.map((row, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {row.map((cell, x) => (
              <div
                key={x}
                style={{
                  width: 7.2,
                  height: 7.2,
                  margin: 0.27,
                  borderRadius: 1.2,
                  background: cell ? COLORS[nextBlock.type] : COLORS.empty,
                  border: cell ? `0.7px solid ${ACCENT}` : '0.7px solid #3334',
                  minWidth: 0,
                  minHeight: 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  function renderGameOver() {
    if (!gameOver) return null;
    return (
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '6.5%',
          right: '6.5%',
          background: 'rgba(70,60,100,0.93)',
          color: ACCENT,
          textAlign: 'center',
          borderRadius: 4.8,
          padding: '6px 2.2px 5px 2.2px',
          zIndex: 10,
          boxShadow: '0 2px 6px rgba(30,8,44,0.11)',
          minWidth: 0,
          fontSize: 12.1,
        }}
      >
        <div
          style={{
            fontSize: 11.9,
            fontWeight: 800,
            letterSpacing: 0.19,
            lineHeight: 1.05,
            marginBottom: 4,
            marginTop: 0,
            padding: 0,
          }}
        >
          GAME OVER
        </div>
        <div style={{ margin: '2.5px auto 1.1px auto', color: '#ffe156cc', fontSize: 9.2, fontWeight: 500 }}>
          Score: {score}
        </div>
        <button
          className="btn btn-large"
          style={{
            fontSize: 8.5,
            marginTop: 3.5,
            marginBottom: 0,
            lineHeight: 1,
            padding: "3px 0.8px",
            borderRadius: 2.5,
            width: 38,
          }}
          onClick={startGame}
        >
          Restart
        </button>
      </div>
    );
  }

  const displayGrid = renderDisplayGrid();

  // FULL PAREN wrapping for main return!
  // --- MAXIMALLY COMPACT, SCROLLLESS, ZERO-WHITESPACE UI ---
  return (
    <div
      style={{
        background: GRID_BG,
        minHeight: 0,
        height: "100%",
        width: '100vw',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontFamily: 'Inter, Arial, sans-serif',
        overflow: 'hidden',
        padding: 0,
        margin: 0,
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 1.3,
          boxShadow: 'none',
          padding: 0.5,
          borderRadius: 3.5,
          background: 'rgba(34,34,59,1)',
          border: `1px solid ${SIDEBAR_BG}`,
          marginTop: 0,
          marginBottom: 0,
          width: 'fit-content',
          maxWidth: '100vw',
          minHeight: 0,
          height: '100%',
          boxSizing: "border-box"
        }}
      >
        {/* Play grid - Ultra compact */}
        <div style={{ position: 'relative', minHeight: 0, margin: 0, padding: 0 }}>
          <div
            style={{
              background: GRID_BG,
              display: 'grid',
              borderRadius: 1.7,
              border: `1px solid ${ACCENT}`,
              gridTemplateColumns: `repeat(${GRID_WIDTH}, 13.35px)`,
              gridTemplateRows: `repeat(${GRID_HEIGHT}, 13.35px)`,
              gap: 0.08,
              boxShadow: 'none',
              position: 'relative',
              zIndex: 1,
              aspectRatio: `${GRID_WIDTH}/${GRID_HEIGHT}`,
              maxHeight: 'none',
              minHeight: 0,
              margin: 0,
              padding: 0,
              width: `${GRID_WIDTH * 13.35 + (GRID_WIDTH - 1) * 0.08}px`,
              height: `${GRID_HEIGHT * 13.35 + (GRID_HEIGHT - 1) * 0.08}px`,
              overflow: 'hidden',
            }}
          >
            {displayGrid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  style={{
                    width: 13.35,
                    height: 13.35,
                    borderRadius: 1.1,
                    background: cell ? COLORS[cell] : COLORS.empty,
                    border: cell ? `0.7px solid ${ACCENT}` : '0.5px solid #262655',
                    boxSizing: 'border-box',
                    boxShadow: cell ? '0 1px 2px #0002' : 'none',
                    margin: 0,
                    padding: 0,
                    transition: 'background 0.07s',
                  }}
                />
              ))
            )}
          </div>
          {/* GameOver overlay */}
          {renderGameOver()}
        </div>
        {/* Sidebar - Minimal size */}
        <div
          style={{
            width: 44,
            background: SIDEBAR_BG,
            color: ACCENT,
            borderRadius: 2.1,
            padding: '1.3px 0.7px 2.1px 0.7px',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: 'center',
            border: `0.7px solid ${ACCENT}`,
            boxShadow: 'none',
            minHeight: 0,
            margin: 0,
            fontSize: 8.1,
            height: '100%',
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 8.7,
              marginBottom: 0,
              color: '#ffe156d9',
              letterSpacing: 0.32,
              lineHeight: 1,
              marginTop: 0.2,
              padding: 0,
            }}
          >
            Score
          </div>
          <div
            style={{
              minHeight: 7.6,
              fontSize: 9.7,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 0,
              lineHeight: '1',
              letterSpacing: '0.13px',
              marginTop: 0.15,
              padding: 0,
            }}
          >
            {score}
          </div>
          <div
            style={{
              height: 1,
              width: '95%',
              margin: '0.5px 0 0.5px 0',
              background: 'rgba(255,255,255,0.09)',
              padding: 0,
            }}
          />
          <div
            style={{
              fontWeight: 500,
              fontSize: 7.2,
              color: ACCENT,
              marginBottom: 0,
              letterSpacing: 0.02,
              marginTop: 0.12,
              padding: 0,
            }}
          >
            Next
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: 0, margin: 0 }}>
            {renderNextBlockPreview()}
          </div>
          <button
            className="btn btn-large"
            style={{
              marginTop: 1.1,
              width: '31px',
              background: running ? '#fa4659bb' : '#43e97bbb',
              fontWeight: '600',
              letterSpacing: 0.09,
              fontSize: 7.6,
              border: `0.60px solid ${ACCENT}`,
              borderRadius: 1.1,
              outline: 'none',
              minHeight: '10px',
              padding: '1.3px 0',
              marginBottom: 0.3,
              boxSizing: "border-box"
            }}
            onClick={() => (running ? setRunning(false) : startGame())}
            disabled={running}
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <div
            style={{
              fontSize: 4.2,
              color: ACCENT,
              marginTop: 0.37,
              fontWeight: 400,
              opacity: 0.72,
              textAlign: 'center',
              lineHeight: 1.10,
              letterSpacing: 0.03,
              marginBottom: 0,
              maxWidth: '97%',
              padding: 0
            }}
          >
            <div style={{ opacity: 0.74 }}>←→ rotate/drop</div>
            <div>␣=hard</div>
            <div>↓=soft</div>
          </div>
        </div>
      </div>
    </div>
  ); // END return
} // END TetraMaster

// PUBLIC_INTERFACE
export default TetraMaster;
