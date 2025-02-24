"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import Confetti from "react-confetti"
import { motion, AnimatePresence } from "framer-motion"

type Player = "X" | "O" | null

interface HistoryEntry {
  squares: Player[]
  player: Player
  position: number
}

function Square({
  value,
  onSquareClick,
  highlight,
  isNew,
}: {
  value: Player
  onSquareClick: () => void
  highlight: boolean
  isNew: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-20 h-20 text-4xl font-bold rounded-lg shadow-md ${
        highlight ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
      } border-2 border-primary transition-colors duration-200 relative overflow-hidden`}
      onClick={onSquareClick}
    >
      <AnimatePresence>
        {value && (
          <motion.div
            key={value}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {value}
          </motion.div>
        )}
      </AnimatePresence>
      {isNew && (
        <motion.div
          className="absolute inset-0 bg-primary"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  )
}

function calculateWinner(squares: Player[]): Player {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}

function getComputerMove(squares: Player[]): number {
  // Check for winning move
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const testSquares = [...squares]
      testSquares[i] = "O"
      if (calculateWinner(testSquares) === "O") {
        return i
      }
    }
  }

  // Check for blocking player's winning move
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const testSquares = [...squares]
      testSquares[i] = "X"
      if (calculateWinner(testSquares) === "X") {
        return i
      }
    }
  }

  // Take center if available
  if (!squares[4]) return 4

  // Take a corner
  const corners = [0, 2, 6, 8]
  const availableCorners = corners.filter((i) => !squares[i])
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)]
  }

  // Take any available space
  const availableSpaces = squares.map((square, index) => (square ? null : index)).filter((i) => i !== null) as number[]
  return availableSpaces[Math.floor(Math.random() * availableSpaces.length)]
}

export default function TicTacToe() {
  const [scores, setScores] = useState({
    X: 0,
    O: 0,
    ties: 0,
  })

  const [history, setHistory] = useState<HistoryEntry[]>([{ squares: Array(9).fill(null), player: null, position: -1 }])
  const [currentMove, setCurrentMove] = useState(0)
  const [vsComputer, setVsComputer] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastMove, setLastMove] = useState<number | null>(null)

  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove].squares

  const winner = calculateWinner(currentSquares)
  const isDraw = !winner && currentSquares.every(Boolean)

  useEffect(() => {
    if (vsComputer && !xIsNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const computerMove = getComputerMove(currentSquares)
        handlePlay(computerMove)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentSquares, xIsNext, vsComputer, winner, isDraw])

  useEffect(() => {
    if (winner) {
      setScores((prev) => ({ ...prev, [winner]: prev[winner] + 1 }))
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    } else if (isDraw) {
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }))
    }
  }, [winner, isDraw])

  function handlePlay(position: number) {
    if (winner || currentSquares[position]) return

    const nextSquares = currentSquares.slice()
    const nextPlayer: Player = xIsNext ? "X" : "O"
    nextSquares[position] = nextPlayer

    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, player: nextPlayer, position }]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
    setLastMove(position)
  }

  function jumpTo(move: number) {
    setCurrentMove(move)
    setLastMove(null)
  }

  function resetGame(fullReset = false) {
    setHistory([{ squares: Array(9).fill(null), player: null, position: -1 }])
    setCurrentMove(0)
    setShowConfetti(false)
    setLastMove(null)
    if (fullReset) {
      setScores({ X: 0, O: 0, ties: 0 })
    }
  }

  const handleComputerModeToggle = (checked: boolean) => {
    setVsComputer(checked)
    resetGame(true)
  }

  let status
  if (winner) {
    status = vsComputer ? (winner === "X" ? "You win!" : "Computer wins!") : `Winner: ${winner}`
  } else if (isDraw) {
    status = "It's a draw!"
  } else {
    status = `${xIsNext ? "X" : "O"}'s turn`
  }

  const moves = history.map((step, move) => {
    const desc = move
      ? `Go to move #${move} (${step.player} at ${Math.floor(step.position / 3)},${step.position % 3})`
      : "Go to game start"
    return (
      <motion.li key={move} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Button
          variant={move === currentMove ? "secondary" : "outline"}
          size="sm"
          onClick={() => jumpTo(move)}
          className="w-full mb-2"
        >
          {desc}
        </Button>
      </motion.li>
    )
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl font-bold mb-8 text-primary font-gaming">Tic Tac Toe</h1>

      <div className="mb-6 flex gap-8 text-xl font-semibold">
        <div className={`text-center ${xIsNext ? "animate-glow" : ""}`}>
          <p className="text-primary">Player X</p>
          <p className="text-2xl">{scores.X}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Ties</p>
          <p className="text-2xl">{scores.ties}</p>
        </div>
        <div className={`text-center ${!xIsNext ? "animate-glow" : ""}`}>
          <p className="text-secondary">{vsComputer ? "Computer" : "Player O"}</p>
          <p className="text-2xl">{scores.O}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <Switch id="vsComputer" checked={vsComputer} onCheckedChange={handleComputerModeToggle} />
        <Label htmlFor="vsComputer">Play vs Computer</Label>
      </div>

      <AnimatePresence>
        {(winner || isDraw) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="mb-4 text-3xl font-bold text-primary"
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>

      {!winner && !isDraw && (
        <motion.div
          className="mb-4 text-2xl font-semibold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
        >
          {status}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {currentSquares.map((square, i) => (
            <Square
              key={i}
              value={square}
              onSquareClick={() => handlePlay(i)}
              highlight={!!(winner && calculateWinner(currentSquares) === square)}
              isNew={i === lastMove}
            />
          ))}
        </div>
        <ScrollArea className="h-[300px] w-[250px] rounded-md border p-4">
          <h2 className="text-xl font-semibold mb-2">Move History</h2>
          <ol>{moves}</ol>
        </ScrollArea>
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          onClick={() => resetGame(false)}
          variant="default"
          className="font-bold py-2 px-6 rounded-lg transform hover:scale-105 transition-all"
        >
          New Game
        </Button>
        <Button
          onClick={() => resetGame(true)}
          variant="outline"
          className="font-bold py-2 px-6 rounded-lg transform hover:scale-105 transition-all"
        >
          Reset Scores
        </Button>
      </div>

      {(winner || isDraw) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-background p-8 rounded-xl shadow-2xl text-center"
          >
            <h2 className="text-4xl font-bold mb-4 text-primary">{isDraw ? "It's a Draw!" : status}</h2>
            <Button
              onClick={() => resetGame(false)}
              variant="default"
              size="lg"
              className="font-bold text-xl transform hover:scale-105 transition-all"
            >
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      )}

      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
    </div>
  )
}

