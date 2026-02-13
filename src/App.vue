<script setup lang="ts">
import { ref, computed } from 'vue'

interface Game {
  id: number
  opponentRating: number
  result: number
  change: number
}

interface SavedData {
  myRating: number
  kFactor: number
  games: Array<{ opponentRating: number; result: number }>
}

const myRating = ref(2350)
const kFactor = ref(15)
const games = ref<Game[]>([])
let gameCounter = 1

const average = computed(() => {
  if (games.value.length === 0) return 0
  const total = games.value.reduce((sum, game) => sum + game.opponentRating, 0)
  return total / games.value.length
})

const totalPoints = computed(() => {
  return games.value.reduce((sum, game) => sum + game.result, 0)
})

const totalChange = computed(() => {
  return games.value.reduce((sum, game) => sum + game.change, 0)
})

const performance = computed(() => {
  if (games.value.length === 0) return 0

  const percentage = totalPoints.value / games.value.length

  if (percentage === 1) {
    return average.value + 400
  } else if (percentage === 0) {
    return average.value - 400
  } else {
    return average.value + 400 * Math.log10(percentage / (1 - percentage))
  }
})

function calculateGameChange(opponentRating: number, result: number): number {
  const expected = 1 / (1 + Math.pow(10, (opponentRating - myRating.value) / 400))
  return kFactor.value * (result - expected)
}

function addGame(opponentRating = 2000, result = 1) {
  const change = calculateGameChange(opponentRating, result)
  games.value.push({
    id: gameCounter++,
    opponentRating,
    result,
    change
  })
}

function removeGame(gameId: number) {
  games.value = games.value.filter(game => game.id !== gameId)
}

function calculate() {
  games.value = games.value.map(game => ({
    ...game,
    change: calculateGameChange(game.opponentRating, game.result)
  }))
}

function saveData() {
  const data: SavedData = {
    myRating: myRating.value,
    kFactor: kFactor.value,
    games: games.value.map(game => ({
      opponentRating: game.opponentRating,
      result: game.result
    }))
  }

  localStorage.setItem('chessEloData', JSON.stringify(data))
  alert('Data saved!')
}

function loadData() {
  const savedData = localStorage.getItem('chessEloData')
  if (!savedData) {
    alert('No saved data found!')
    return
  }

  const data: SavedData = JSON.parse(savedData)
  myRating.value = data.myRating
  kFactor.value = data.kFactor

  games.value = []
  gameCounter = 1

  data.games.forEach(game => {
    addGame(game.opponentRating, game.result)
  })

  alert('Data loaded!')
}

// Initialize with sample games
addGame(2245, 1)
addGame(2458, 0.5)
addGame(2650, 0)
addGame(2178, 1)
addGame(2578, 0)
addGame(2456, 1)
</script>

<template>
  <div class="container">
    <h1>Chess ELO</h1>

    <div class="rating-input">
      <label>My Rating:</label>
      <input type="number" v-model.number="myRating" @change="calculate">
      <select v-model.number="kFactor" @change="calculate">
        <option :value="10">K-10</option>
        <option :value="15">K-15</option>
        <option :value="20">K-20</option>
        <option :value="25">K-25</option>
        <option :value="30">K-30</option>
        <option :value="40">K-40</option>
      </select>
    </div>

    <div class="buttons">
      <button @click="calculate">Calculate</button>
      <button @click="addGame()">Add Game</button>
      <button @click="saveData">Save</button>
      <button @click="loadData">Load</button>
    </div>

    <div class="stats">
      <div class="stat-item">
        <div class="stat-label">Average:</div>
        <div class="stat-value">{{ average.toFixed(1) }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Change:</div>
        <div class="stat-value">{{ (totalChange >= 0 ? '+' : '') + totalChange.toFixed(1) }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Performance:</div>
        <div class="stat-value">{{ performance.toFixed(1) }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Points:</div>
        <div class="stat-value">{{ totalPoints.toFixed(1) }}/{{ games.length }}</div>
      </div>
    </div>

    <div class="games">
      <div v-for="(game, index) in games" :key="game.id" class="game-row">
        <label>Game #{{ index + 1 }}:</label>
        <input
          type="number"
          v-model.number="game.opponentRating"
          @change="calculate"
          class="opponent-rating"
        >
        <select v-model.number="game.result" @change="calculate" class="game-result">
          <option :value="1">1</option>
          <option :value="0.5">0.5</option>
          <option :value="0">0</option>
        </select>
        <span
          class="rating-change"
          :class="game.change >= 0 ? 'positive' : 'negative'"
        >
          {{ (game.change >= 0 ? '+' : '') + game.change.toFixed(2) }}
        </span>
        <button class="remove-btn" @click="removeGame(game.id)">-</button>
      </div>
    </div>

    <button id="addGameBtn" @click="addGame()">+ Add Game</button>
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  background: #3a3a3a;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
}

h1 {
  background: linear-gradient(90deg, #4a4a4a, #5a5a5a);
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
}

.rating-input {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
  max-width: 100%;
}

.rating-input label {
  flex: 0 0 100px;
  font-size: 16px;
}

.rating-input input {
  flex: 1;
  padding: 10px;
  font-size: 18px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #fff;
  color: #000;
  font-weight: bold;
  max-width: 100%;
  box-sizing: border-box;
}

.rating-input select {
  padding: 10px;
  font-size: 16px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #fff;
  color: #000;
  cursor: pointer;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background: #d4d4d4;
  color: #000;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

button:hover {
  background: #e4e4e4;
}

button:active {
  transform: scale(0.98);
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
}

.stat-label {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

.games {
  margin-top: 20px;
  max-width: 100%;
  overflow-x: hidden;
}

.game-row {
  display: grid;
  grid-template-columns: 65px minmax(0, 1fr) 80px 85px 30px;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.game-row label {
  font-size: 13px;
  white-space: nowrap;
}

.game-row input[type="number"] {
  padding: 8px;
  font-size: 16px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #fff;
  color: #000;
  font-weight: bold;
  max-width: 100%;
  box-sizing: border-box;
}

.game-row select {
  padding: 8px;
  font-size: 14px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #fff;
  color: #000;
}

.rating-change {
  padding: 4px 6px;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
  font-size: 15px;
  white-space: nowrap;
}

.rating-change.positive {
  color: #4ade80;
}

.rating-change.negative {
  color: #f87171;
}

.remove-btn {
  background: #666;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  padding: 5px 8px;
  font-size: 14px;
}

.remove-btn:hover {
  background: #888;
}

#addGameBtn {
  margin-top: 10px;
  width: 100%;
}

@media (max-width: 550px) {
  .container {
    padding: 15px;
    margin: 0 10px;
  }

  .game-row {
    grid-template-columns: 60px minmax(0, 1fr) 75px 80px 30px;
    gap: 6px;
  }

  .game-row label {
    font-size: 12px;
  }

  .rating-change {
    font-size: 14px;
    padding: 4px 4px;
  }
}
</style>
