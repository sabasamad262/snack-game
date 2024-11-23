"use client"; // Enables client-side rendering for this component

import { useState, useEffect, useCallback, useRef } from "react"; // Import React hooks
import { Button } from "@/components/ui/button"; // Import custom Button component
import { PauseIcon, PlayIcon, RefreshCcwIcon } from "lucide-react"; // Import icons from lucide-react

// Define the possible game states
enum GameState {
  START,
  PAUSE,
  RUNNING,
  GAME_OVER,
}

// Define the directions for the snake movement
enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

// Define the Position interface
interface Position {
  x: number;
  y: number;
}

// Initial state for the snake and food
const initialSnake: Position[] = [{ x: 0, y: 0 }];
const initialFood: Position = { x: 5, y: 5 };

export default function SnakeGame() {
  // State to manage the game
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [food, setFood] = useState<Position>(initialFood);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  // Function to move the snake
  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = newSnake[0];
      let newHead: Position;

      switch (direction) {
        case Direction.UP:
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case Direction.DOWN:
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case Direction.LEFT:
          newHead = { x: head.x - 1, y: head.y };
          break;
        case Direction.RIGHT:
          newHead = { x: head.x + 1, y: head.y };
          break;
        default:
          return newSnake;
      }

      // Check for collision with the boundaries
      if (
        newHead.x < 0 ||
        newHead.x >= 10 ||
        newHead.y < 0 ||
        newHead.y >= 10 ||
        newSnake.some((part) => part.x === newHead.x && part.y === newHead.y)
      ) {
        setGameState(GameState.GAME_OVER);
        return prevSnake; // End the game by returning the previous state
      }

      newSnake.unshift(newHead);

      if (newHead.x === food.x && newHead.y === food.y) {
        // Snake eats the food
        setFood({
          x: Math.floor(Math.random() * 10),
          y: Math.floor(Math.random() * 10),
        });
        setScore((prevScore) => prevScore + 1);
      } else {
        newSnake.pop(); // Remove the last part of the snake's body
      }

      return newSnake;
    });
  }, [direction, food]);

  // Function to handle key press events
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          if (direction !== Direction.DOWN) setDirection(Direction.UP);
          break;
        case "ArrowDown":
          if (direction !== Direction.UP) setDirection(Direction.DOWN);
          break;
        case "ArrowLeft":
          if (direction !== Direction.RIGHT) setDirection(Direction.LEFT);
          break;
        case "ArrowRight":
          if (direction !== Direction.LEFT) setDirection(Direction.RIGHT);
          break;
      }
    },
    [direction]
  );

  // useEffect to handle the game interval and key press events
  useEffect(() => {
    if (gameState === GameState.RUNNING) {
      gameInterval.current = setInterval(moveSnake, 200);
      document.addEventListener("keydown", handleKeyPress);
    } else {
      if (gameInterval.current) clearInterval(gameInterval.current);
      document.removeEventListener("keydown", handleKeyPress);
    }

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState, moveSnake, handleKeyPress]);

  // Function to start the game
  const startGame = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setScore(0);
    setDirection(Direction.RIGHT);
    setGameState(GameState.RUNNING);
    setShowInstructions(false); // Hide instructions when game starts
  };

  // Function to pause or resume the game
  const pauseGame = () => {
    setGameState(
      gameState === GameState.RUNNING ? GameState.PAUSE : GameState.RUNNING
    );
  };

  // Function to reset the game
  const resetGame = () => {
    setGameState(GameState.START);
    setSnake(initialSnake);
    setFood(initialFood);
    setScore(0);
  };

  // Function to start the game again after game over
  const startAgain = () => {
    setGameState(GameState.START);
    startGame();
  };

  // useEffect to update the high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  // JSX return statement rendering the Snake Game UI
  return (
    
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0F0F0F] to-[#1E1E1E]">
      <div className="bg-[#1E1E1E] rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-bold text-[#45beee]">Snake Game</div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#e5e6e9]"
              onClick={startGame}
            >
              <PlayIcon className="w-6 h-6" />
              <span className="sr-only">Start</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#e5e6e9]"
              onClick={pauseGame}
            >
              <PauseIcon className="w-6 h-6" />
              <span className="sr-only">Pause/Resume</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#e5e6e9]"
              onClick={resetGame}
            >
              <RefreshCcwIcon className="w-6 h-6" />
              <span className="sr-only">Reset</span>
            </Button>
          </div>
        </div>
        
        {/* Instructions Section */}
        {showInstructions && (
          <div className="mb-6 p-4 bg-[#8786be] rounded-md text-black">
            <h3 className="font-bold text-lg">How to Play:</h3>
            <p>Use the arrow keys to move the snake:</p>
            <ul className="list-disc ml-6">
              <li>Up Arrow: Move Up</li>
              <li>Down Arrow: Move Down</li>
              <li>Left Arrow: Move Left</li>
              <li>Right Arrow: Move Right</li>
            </ul>
            <p>Eat the food (cyan square) to grow and earn points!</p>
            <p>Avoid colliding with the walls or yourself!</p>
            <Button
              variant="outline"
              className="mt-4 hover:bg-gray-400"
              onClick={() => setShowInstructions(false)}
            >
              Close Instructions
            </Button>
          </div>
        )}

        {/* Game Over Section */}
        {gameState === GameState.GAME_OVER && (
          <div className="mb-6 p-4 bg-red-400 rounded-md text-black text-center hover:bg-slate-500">
            <h3 className="font-bold text-lg">Game Over!</h3>
            <p>Your Score: {score}</p>
            <Button
              variant="outline"
              className="mt-4 hover:bg-gray-400"
              onClick={startAgain}
            >
              Start Again
            </Button>
          </div>
        )}

        <div className="bg-[#0F0F0F] rounded-lg p-4 grid grid-cols-10 gap-1">
          {Array.from({ length: 100 }).map((_, i) => {
            const x = i % 10;
            const y = Math.floor(i / 10);
            const isSnakePart = snake.some(
              (part) => part.x === x && part.y === y
            );
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`w-8 h-8 ${
                  isSnakePart
                    ? "bg-[#81e981]"
                    : isFood
                    ? "bg-[#61e9e9]"
                    : "bg-[#1E1E1E] border border-gray-700"
                }`}
              />
            );
          })}
        </div>

        <div className="mt-4 text-center text-[#51f0f0]">
          <p className="text-lg">Score: {score}</p>
          <p className="text-lg">High Score: {highScore}</p>
        </div>
      </div>
    </div>

  );
}
