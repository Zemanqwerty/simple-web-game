import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const DEFAULT_HOST = 'http://92.63.97.202:5000';
const FALLBACK_HOST = 'http://192.168.0.107:5011';

function App() {
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentHost, setCurrentHost] = useState(DEFAULT_HOST);
  const [isMobile, setIsMobile] = useState(false);

  const initializeSocket = (host) => {
    const newSocket = io(host, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);
    return newSocket;
  };

  useEffect(() => {
    const checkIsMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    let activeSocket = initializeSocket(DEFAULT_HOST);

    activeSocket.on('connect', () => {
      console.log(`Connected to WebSocket server at ${currentHost}`);
      setError('');
    });

    activeSocket.on('connect_error', () => {
      console.log(`Failed to connect to ${currentHost}`);
      if (currentHost === DEFAULT_HOST) {
        console.log(`Switching to fallback host: ${FALLBACK_HOST}`);
        activeSocket.disconnect();
        activeSocket = initializeSocket(FALLBACK_HOST);
        setCurrentHost(FALLBACK_HOST);
        setupSocketListeners(activeSocket);
      } else {
        setError('Не удалось подключиться к серверу. Проверьте сеть или сервер.');
      }
    });

    const setupSocketListeners = (sock) => {
      sock.on('disconnect', () => {
        console.log(`Disconnected from WebSocket server at ${currentHost}`);
        setGameState(null);
      });

      sock.on('roomCreated', (newRoomId) => {
        console.log(`Room created with ID: ${newRoomId}`);
        setRoomId(newRoomId);
        const gameWidth = window.innerWidth - 12;
        const gameHeight = window.innerHeight - 60 - 12;
        sock.emit('setGameSize', { roomId: newRoomId, width: gameWidth, height: gameHeight });
      });

      sock.on('gameState', (state) => {
        console.log('Game state received:', state);
        setGameState(state);
      });

      sock.on('error', (message) => {
        console.error(`Error: ${message}`);
        setError(message);
      });
    };

    setupSocketListeners(activeSocket);

    return () => {
      activeSocket.off('connect');
      activeSocket.off('connect_error');
      activeSocket.off('disconnect');
      activeSocket.off('roomCreated');
      activeSocket.off('gameState');
      activeSocket.off('error');
      activeSocket.disconnect();
    };
  }, [currentHost]);

  const createRoom = () => {
    console.log('Emitting createRoom event');
    setError('');
    socket.emit('createRoom');
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      setError('Введите ID комнаты.');
      return;
    }
    console.log(`Emitting joinRoom event with roomId: ${roomId}`);
    setError('');
    socket.emit('joinRoom', roomId.trim());
    const gameWidth = window.innerWidth - 12;
    const gameHeight = window.innerHeight - 60 - 12;
    socket.emit('setGameSize', { roomId: roomId.trim(), width: gameWidth, height: gameHeight });
  };

  const returnToMainMenu = () => {
    socket.emit('leaveRoom', roomId);
    setGameState(null);
    setRoomId('');
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#3c4033',
        color: '#d9d2b6',
        fontFamily: "'Press Start 2P', cursive",
        overflow: 'hidden',
      }}
    >
      {!socket || !gameState || !gameState.players || gameState.players.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle, #5a5e4d 0%, #3c4033 100%)',
          }}
        >
          <h1
            style={{
              fontSize: '48px', // Большой размер для заголовка
              color: '#d9d2b6', // Основной цвет текста
              textShadow: '4px 4px 0 #2c2f26, -2px -2px 0 #ff4d4d', // Тень с красным акцентом
              marginBottom: '40px', // Отступ снизу до формы
              textAlign: 'center',
              lineHeight: '1.2',
            }}
          >
            Битва за Родину!
          </h1>
          <h2 style={{ color: '#ff4d4d', textShadow: '2px 2px 0 #000', fontSize: '24px' }}>
            {error && <span>{error}</span>}
          </h2>
          <button
            onClick={createRoom}
            disabled={!socket}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: '#6b705c',
              color: '#d9d2b6',
              border: '4px solid #2c2f26',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0 #000',
              transition: 'transform 0.1s',
              fontFamily: "'Press Start 2P', cursive",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Создать комнату
          </button>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Введите ID комнаты"
            style={{
              margin: '10px 0',
              padding: '10px',
              fontSize: '16px',
              backgroundColor: '#4a4e3d',
              color: '#d9d2b6',
              border: '4px solid #2c2f26',
              borderRadius: '8px',
              outline: 'none',
              fontFamily: "'Press Start 2P', cursive",
            }}
          />
          <button
            onClick={joinRoom}
            disabled={!socket}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: '#6b705c',
              color: '#d9d2b6',
              border: '4px solid #2c2f26',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0 #000',
              transition: 'transform 0.1s',
              fontFamily: "'Press Start 2P', cursive",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Присоединиться
          </button>
        </div>
      ) : (
        <GameScreen
          gameState={gameState}
          socket={socket}
          roomId={roomId}
          isMobile={isMobile}
          onReturnToMainMenu={returnToMainMenu}
        />
      )}
    </div>
  );
}

function GameScreen({ gameState, socket, roomId, isMobile, onReturnToMainMenu }) {
  const [movingDirection, setMovingDirection] = useState(null); // Храним текущее направление движения

  const handleMoveStart = (direction) => {
    if (movingDirection !== direction) {
      setMovingDirection(direction);
      socket.emit('move', direction); // Первое движение сразу
    }
  };

  const handleMoveStop = () => {
    setMovingDirection(null);
  };

  const handleShoot = () => {
    socket.emit('shoot');
  };

  // Эффект для интервального движения
  useEffect(() => {
    let moveInterval;
    if (movingDirection) {
      moveInterval = setInterval(() => {
        socket.emit('move', movingDirection);
      }, 100); // Отправляем команду движения каждые 100 мс
    }
    return () => clearInterval(moveInterval);
  }, [movingDirection, socket]);

  // Обработка клавиш на ПК
  useEffect(() => {
    if (!isMobile) {
      const handleKeyDown = (event) => {
        switch (event.key) {
          case 'ArrowUp':
            handleMoveStart('up');
            break;
          case 'ArrowDown':
            handleMoveStart('down');
            break;
          case 'ArrowLeft':
            handleMoveStart('left');
            break;
          case 'ArrowRight':
            handleMoveStart('right');
            break;
          case ' ':
            handleShoot();
            break;
          default:
            break;
        }
      };

      const handleKeyUp = (event) => {
        switch (event.key) {
          case 'ArrowUp':
            if (movingDirection === 'up') handleMoveStop();
            break;
          case 'ArrowDown':
            if (movingDirection === 'down') handleMoveStop();
            break;
          case 'ArrowLeft':
            if (movingDirection === 'left') handleMoveStop();
            break;
          case 'ArrowRight':
            if (movingDirection === 'right') handleMoveStop();
            break;
          default:
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [isMobile, movingDirection]);

  const headerHeight = 60;
  const borderWidth = 12;
  const gameWidth = window.innerWidth - borderWidth;
  const gameHeight = window.innerHeight - headerHeight - borderWidth;

  const controlButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    border: '4px solid #2c2f26',
    backgroundColor: '#6b705c',
    color: '#d9d2b6',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #000',
    transition: 'transform 0.1s',
    outline: 'none',
    fontFamily: "'Press Start 2P', cursive",
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const shootButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    border: '4px solid #2c2f26',
    backgroundColor: '#8b3a3a',
    color: '#d9d2b6',
    fontSize: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #000',
    transition: 'transform 0.1s',
    outline: 'none',
    fontFamily: "'Press Start 2P', cursive",
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const menuButtonStyle = {
    padding: '10px 20px',
    fontSize: '12px',
    backgroundColor: '#6b705c',
    color: '#d9d2b6',
    border: '4px solid #2c2f26',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #000',
    transition: 'transform 0.1s',
    fontFamily: "'Press Start 2P', cursive",
  };

  const wallStyle = {
    position: 'absolute',
    backgroundColor: '#4a4e3d',
    border: '3px solid #2c2f26',
    boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.5), 2px 2px 0 #000',
    backgroundImage: 'url(/textures/brick-wall.png)',
    backgroundSize: '16px 16px',
  };

  const upDownArrowStyle = {
    ...controlButtonStyle,
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000',
  };

  const leftRightArrowStyle = {
    ...controlButtonStyle,
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000',
  };

  const player = gameState.players.find((p) => p.id === socket.id);
  const playerHealth = player ? player.health : 0;

  const safeZones = gameState.safeZones || {
    spawn: { x: 0, y: 0, width: 100, height: 100, door: 'right' },
    revive: { x: 0, y: gameHeight - 100, width: 100, height: 100, door: 'top' },
  };

  const obstacles = gameState.obstacles || [
    { x: 200, y: 150, width: 64, height: 32 },
    { x: 300, y: 400, width: 32, height: 64 },
    { x: 500, y: 200, width: 96, height: 32 },
  ];

  const getRotationAngle = (direction) => {
    if (!direction) return 0;
    const { x, y } = direction;
    if (x === 0 && y === -1) return 0; // Вверх
    if (x === 0 && y === 1) return 180; // Вниз
    if (x === -1 && y === 0) return 270; // Влево
    if (x === 1 && y === 0) return 90; // Вправо
    return 0;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: `${headerHeight}px`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          backgroundColor: '#2c2f26',
          borderBottom: '4px solid #4a4e3d',
          boxShadow: '0 4px 0 #000',
        }}
      >
        <div style={{ fontSize: '16px', textShadow: '2px 2px 0 #000' }}>Штаб: {roomId}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              style={{
                width: '40px',
                height: '40px',
                backgroundImage: i < playerHealth ? 'url(/textures/hp.png)' : null,
                backgroundSize: 'cover',
                imageRendering: 'pixelated',
              }}
            />
          ))}
        </div>
        <button
          onClick={onReturnToMainMenu}
          style={menuButtonStyle}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          В главное меню
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          width: `${gameWidth}px`,
          height: `${gameHeight}px`,
          backgroundColor: '#5a5e4d',
          backgroundImage: 'url(/textures/ground2.png)',
          backgroundSize: '32px 32px',
          border: '6px solid #2c2f26',
          borderRadius: '8px',
          boxShadow: '0 8px 0 #000',
          overflow: 'hidden',
          imageRendering: 'pixelated',
        }}
      >
        <div style={{ ...wallStyle, left: `${safeZones.spawn.x}px`, top: `${safeZones.spawn.y}px`, width: `${safeZones.spawn.width}px`, height: '3px' }} />
        <div style={{ ...wallStyle, left: `${safeZones.spawn.x}px`, top: `${safeZones.spawn.y}px`, width: '3px', height: `${safeZones.spawn.height}px` }} />
        <div style={{ ...wallStyle, left: `${safeZones.spawn.x}px`, top: `${safeZones.spawn.y + safeZones.spawn.height - 3}px`, width: `${safeZones.spawn.width}px`, height: '3px' }} />

        <div style={{ ...wallStyle, left: `${safeZones.revive.x}px`, top: `${safeZones.revive.y + safeZones.revive.height - 3}px`, width: `${safeZones.revive.width}px`, height: '3px' }} />
        <div style={{ ...wallStyle, left: `${safeZones.revive.x}px`, top: `${safeZones.revive.y}px`, width: '3px', height: `${safeZones.revive.height}px` }} />
        <div style={{ ...wallStyle, left: `${safeZones.revive.x + safeZones.revive.width - 3}px`, top: `${safeZones.revive.y}px`, width: '3px', height: `${safeZones.revive.height}px` }} />

        {obstacles.map((obstacle, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${obstacle.x}px`,
              top: `${obstacle.y}px`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
              backgroundImage: 'url(/textures/crate.png)',
              backgroundSize: 'cover',
              backgroundColor: '#4a4e3d',
              border: '2px solid #2c2f26',
              boxShadow: '2px 2px 0 #000',
            }}
          />
        ))}

        {gameState.players.map((player) => (
          <div
            key={player.id}
            style={{
              position: 'absolute',
              left: Math.max(0, Math.min(player.x, gameWidth - 50)),
              top: Math.max(0, Math.min(player.y, gameHeight - 50)),
              width: '50px',
              height: '50px',
              backgroundImage: 'url(/sprites/hero1.png)',
              backgroundSize: 'cover',
              imageRendering: 'pixelated',
              transform: `rotate(${getRotationAngle(player.lastDirection)}deg)`,
              transformOrigin: 'center center',
            }}
          />
        ))}

        {gameState.bots.map((bot) => (
          <div
            key={bot.id}
            style={{
              position: 'absolute',
              left: Math.max(0, Math.min(bot.x, gameWidth - 50)),
              top: Math.max(0, Math.min(bot.y, gameHeight - 50)),
              width: '50px',
              height: '50px',
              backgroundImage: 'url(/sprites/enemy1.png)',
              backgroundSize: 'cover',
              imageRendering: 'pixelated',
              transform: `rotate(${getRotationAngle(bot.direction)}deg)`,
              transformOrigin: 'center center',
            }}
          />
        ))}

        {gameState.bullets?.map((bullet) => (
          <div
            key={bullet.id}
            style={{
              position: 'absolute',
              left: bullet.x,
              top: bullet.y,
              width: '4px',
              height: '4px',
              backgroundColor: bullet.owner === 'player' ? '#ffcc00' : '#ff4d4d',
              borderRadius: '50%',
              boxShadow: '1px 1px 0 #000',
            }}
          />
        ))}

        {isMobile && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px', // Опускаем кнопки ниже
              left: '10px',
              width: '110px',
              height: '110px',
              display: 'grid',
              gridTemplateAreas: `
                ". up ."
                "left . right"
                ". down ."
              `,
              gridTemplateRows: '1fr 1fr 1fr',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '5px',
              justifyItems: 'center',
              alignItems: 'center',
            }}
          >
            <button
              style={{ ...upDownArrowStyle, gridArea: 'up' }}
              onTouchStart={() => handleMoveStart('up')}
              onTouchEnd={handleMoveStop}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ↑
            </button>
            <button
              style={{ ...leftRightArrowStyle, gridArea: 'left' }}
              onTouchStart={() => handleMoveStart('left')}
              onTouchEnd={handleMoveStop}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ←
            </button>
            <button
              style={{ ...leftRightArrowStyle, gridArea: 'right' }}
              onTouchStart={() => handleMoveStart('right')}
              onTouchEnd={handleMoveStop}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              →
            </button>
            <button
              style={{ ...upDownArrowStyle, gridArea: 'down' }}
              onTouchStart={() => handleMoveStart('down')}
              onTouchEnd={handleMoveStop}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ↓
            </button>
          </div>
        )}

        {isMobile && (
          <button
            onClick={handleShoot}
            style={{
              ...shootButtonStyle,
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              fontSize: '7px'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Огонь
          </button>
        )}

        {gameState.isVictory && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#d9d2b6',
              textShadow: '2px 2px 0 #000, -2px -2px 0 #000',
              backgroundColor: 'rgba(81, 90, 59, 0.8)',
              padding: '20px',
              border: '4px solid #2c2f26',
              borderRadius: '8px',
              boxShadow: '4px 4px 0 #000',
              fontFamily: "'Press Start 2P', cursive",
              animation: 'pulse 1.5s infinite',
            }}
          >
            Победа!
          </div>
        )}
      </div>
    </div>
  );
}

export default App;