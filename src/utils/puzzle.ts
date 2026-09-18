import { GridSize } from '../types';

/**
 * Creates solved board: 1, 2, ..., N^2 - 1, 0
 */
export function createSolvedBoard(size: GridSize): number[] {
  const total = size * size;
  const board: number[] = [];
  for (let i = 1; i < total; i++) {
    board.push(i);
  }
  board.push(0); // 0 represents the empty space
  return board;
}

/**
 * Checks if the board is in solved state
 */
export function isBoardSolved(board: number[]): boolean {
  if (board.length === 0) return false;
  const total = board.length;
  // last must be 0
  if (board[total - 1] !== 0) return false;
  for (let i = 0; i < total - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return true;
}

/**
 * Gets the valid neighbor indices of the empty tile (0)
 */
export function getValidNeighborIndices(board: number[], size: GridSize): number[] {
  const zeroIndex = board.indexOf(0);
  const row = Math.floor(zeroIndex / size);
  const col = zeroIndex % size;
  const neighbors: number[] = [];

  // Top
  if (row > 0) neighbors.push(zeroIndex - size);
  // Bottom
  if (row < size - 1) neighbors.push(zeroIndex + size);
  // Left
  if (col > 0) neighbors.push(zeroIndex - 1);
  // Right
  if (col < size - 1) neighbors.push(zeroIndex + 1);

  return neighbors;
}

/**
 * Generates a guaranteed 100% solvable board by performing random valid moves from solved state.
 * This guarantees both solvability and avoids trivial permutations.
 */
export function generateSolvableBoard(size: GridSize, moveCount: number = 120): number[] {
  let board = createSolvedBoard(size);
  let lastMove = -1;

  for (let i = 0; i < moveCount; i++) {
    const zeroIndex = board.indexOf(0);
    const neighbors = getValidNeighborIndices(board, size).filter(idx => idx !== lastMove);
    const chosenIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    // Swap chosen tile with 0
    board[zeroIndex] = board[chosenIndex];
    board[chosenIndex] = 0;
    lastMove = zeroIndex;
  }

  // If accidentally solved, do another swap
  if (isBoardSolved(board)) {
    const zeroIndex = board.indexOf(0);
    const neighbors = getValidNeighborIndices(board, size);
    const chosenIndex = neighbors[0];
    board[zeroIndex] = board[chosenIndex];
    board[chosenIndex] = 0;
  }

  return board;
}

/**
 * Handles sliding a tile or row/column of tiles towards the blank tile (0).
 * Returns the new board array, or null if the clicked tile cannot move.
 */
export function tryMoveTile(board: number[], clickedIndex: number, size: GridSize): number[] | null {
  const zeroIndex = board.indexOf(0);
  if (clickedIndex === zeroIndex) return null;

  const clickedRow = Math.floor(clickedIndex / size);
  const clickedCol = clickedIndex % size;
  const zeroRow = Math.floor(zeroIndex / size);
  const zeroCol = zeroIndex % size;

  // Not in same row or same column -> invalid move
  if (clickedRow !== zeroRow && clickedCol !== zeroCol) {
    return null;
  }

  const newBoard = [...board];

  // Moving along the same row
  if (clickedRow === zeroRow) {
    const step = zeroCol > clickedCol ? 1 : -1;
    for (let c = zeroCol; c !== clickedCol; c -= step) {
      const targetIdx = clickedRow * size + c;
      const sourceIdx = clickedRow * size + (c - step);
      newBoard[targetIdx] = newBoard[sourceIdx];
    }
    newBoard[clickedIndex] = 0;
    return newBoard;
  }

  // Moving along the same column
  if (clickedCol === zeroCol) {
    const step = zeroRow > clickedRow ? 1 : -1;
    for (let r = zeroRow; r !== clickedRow; r -= step) {
      const targetIdx = r * size + clickedCol;
      const sourceIdx = (r - step) * size + clickedCol;
      newBoard[targetIdx] = newBoard[sourceIdx];
    }
    newBoard[clickedIndex] = 0;
    return newBoard;
  }

  return null;
}

/**
 * Move by direction: 'up', 'down', 'left', 'right'
 * Note: In Arabic RTL or standard keyboard, arrow directions move the tile into the empty slot.
 */
export function tryMoveDirection(board: number[], direction: 'up' | 'down' | 'left' | 'right', size: GridSize): number[] | null {
  const zeroIndex = board.indexOf(0);
  const zeroRow = Math.floor(zeroIndex / size);
  const zeroCol = zeroIndex % size;

  let targetIndex = -1;

  // Direction tile moves INTO the empty spot
  switch (direction) {
    case 'up':
      // The tile below empty slot moves UP
      if (zeroRow < size - 1) targetIndex = zeroIndex + size;
      break;
    case 'down':
      // The tile above empty slot moves DOWN
      if (zeroRow > 0) targetIndex = zeroIndex - size;
      break;
    case 'left':
      // The tile to the right of empty slot moves LEFT
      if (zeroCol < size - 1) targetIndex = zeroIndex + 1;
      break;
    case 'right':
      // The tile to the left of empty slot moves RIGHT
      if (zeroCol > 0) targetIndex = zeroIndex - 1;
      break;
  }

  if (targetIndex >= 0 && targetIndex < board.length) {
    return tryMoveTile(board, targetIndex, size);
  }
  return null;
}

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Finds the next best tile to move towards solving the puzzle using Manhattan distance heuristic.
 * Checks adjacent neighbors of 0 and picks the one that minimizes Manhattan distance,
 * or moves the lowest incorrectly placed number closer to its goal.
 */
export function findNextHintTileIndex(board: number[], size: GridSize): number | null {
  if (isBoardSolved(board)) return null;

  const neighbors = getValidNeighborIndices(board, size);
  if (neighbors.length === 0) return null;

  // Manhattan distance function
  const calcManhattan = (b: number[]): number => {
    let dist = 0;
    for (let idx = 0; idx < b.length; idx++) {
      const val = b[idx];
      if (val === 0) continue;
      const targetRow = Math.floor((val - 1) / size);
      const targetCol = (val - 1) % size;
      const currentRow = Math.floor(idx / size);
      const currentCol = idx % size;
      dist += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
    }
    return dist;
  };

  const currentDist = calcManhattan(board);
  let bestNeighbor = neighbors[0];
  let bestScore = Infinity;

  // Priority to moves that lower overall Manhattan distance
  for (const nIdx of neighbors) {
    const simulated = tryMoveTile(board, nIdx, size);
    if (!simulated) continue;
    const simDist = calcManhattan(simulated);
    const score = simDist;

    // Favor tiles that are not yet in their goal position
    const tileVal = board[nIdx];
    const isCurrentlyInGoal = tileVal === nIdx + 1;
    const penalty = isCurrentlyInGoal ? 1.5 : 0;

    if (score + penalty < bestScore) {
      bestScore = score + penalty;
      bestNeighbor = nIdx;
    }
  }

  return bestNeighbor;
}

/**
 * Web Audio sound effects synthesizer
 */
class SoundEffects {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy initialized
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playMove() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted
    }
  }

  public playHint() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore
    }
  }

  public playShuffle() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const freq = 200 + i * 80;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);

        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.04);
      }
    } catch {
      // Ignore
    }
  }

  public playWin() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEffects();
