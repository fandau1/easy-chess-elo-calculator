<script setup lang="ts">
import { ref, computed } from 'vue'
import ReloadPrompt from './components/ReloadPrompt.vue'

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

// Načíst uložená data
function loadSavedData() {
  const savedData = localStorage.getItem('chessEloData')
  if (savedData) {
    try {
      const data: SavedData = JSON.parse(savedData)
      myRating.value = data.myRating
      kFactor.value = data.kFactor

      games.value = []
      gameCounter = 1

      data.games.forEach(game => {
        addGame(game.opponentRating, game.result)
      })
    } catch (error) {
      console.error('Failed to load saved data:', error)
    }
  } else {
    // Pokud nejsou uložená data, načíst vzorové hry
    addGame(2245, 1)
    addGame(2458, 0.5)
    addGame(2650, 0)
    addGame(2178, 1)
    addGame(2578, 0)
    addGame(2456, 1)
  }
}

// Automaticky uložit data
function autoSave() {
  const data: SavedData = {
    myRating: myRating.value,
    kFactor: kFactor.value,
    games: games.value.map(game => ({
      opponentRating: game.opponentRating,
      result: game.result
    }))
  }
  localStorage.setItem('chessEloData', JSON.stringify(data))
}

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
  // Validace opponent rating
  if (!opponentRating || isNaN(opponentRating) || opponentRating < 0) {
    return 0
  }

  // Validace result
  if (isNaN(result) || result < 0 || result > 1) {
    return 0
  }

  const expected = 1 / (1 + Math.pow(10, (opponentRating - myRating.value) / 400))
  return kFactor.value * (result - expected)
}

function addGame(opponentRating = 2000, result = 1) {
  // Validace vstupů
  const validRating = !isNaN(opponentRating) && opponentRating > 0 ? opponentRating : 2000
  const validResult = !isNaN(result) && result >= 0 && result <= 1 ? result : 1

  const change = calculateGameChange(validRating, validResult)
  games.value.push({
    id: gameCounter++,
    opponentRating: validRating,
    result: validResult,
    change
  })
  autoSave()
}

function removeGame(gameId: number) {
  games.value = games.value.filter(game => game.id !== gameId)
  autoSave()
}

function calculate() {
  // Validace myRating
  if (!myRating.value || isNaN(myRating.value) || myRating.value < 0) {
    myRating.value = 1500
  }

  // Validace kFactor
  if (!kFactor.value || isNaN(kFactor.value) || kFactor.value <= 0) {
    kFactor.value = 15
  }

  games.value = games.value.map(game => {
    // Validace game data
    const validRating = !isNaN(game.opponentRating) && game.opponentRating > 0 ? game.opponentRating : 2000
    const validResult = !isNaN(game.result) && game.result >= 0 && game.result <= 1 ? game.result : 1

    return {
      ...game,
      opponentRating: validRating,
      result: validResult,
      change: calculateGameChange(validRating, validResult)
    }
  })
  autoSave()
}

// Drag and drop functionality
let draggedIndex = -1

function handleDragStart(event: DragEvent, index: number) {
  draggedIndex = index
  const target = event.target as HTMLElement
  target.classList.add('dragging')

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleDragEnd(event: DragEvent) {
  const target = event.target as HTMLElement
  target.classList.remove('dragging')

  // Odstranit všechny drop-zone třídy
  document.querySelectorAll('.drop-zone-active').forEach(el => {
    el.classList.remove('drop-zone-active')
  })

  draggedIndex = -1
}

function handleDropZoneOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDropZoneEnter(event: DragEvent) {
  if (draggedIndex === -1) return
  const target = event.currentTarget as HTMLElement
  target.classList.add('drop-zone-active')
}

function handleDropZoneLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  target.classList.remove('drop-zone-active')
}

function handleDropZoneDrop(event: DragEvent, targetIndex: number) {
  event.preventDefault()
  const target = event.currentTarget as HTMLElement
  target.classList.remove('drop-zone-active')

  if (draggedIndex === -1) return

  const draggedGame = games.value[draggedIndex]
  if (!draggedGame) return

  // Vypočítat správný cílový index
  let newIndex = targetIndex
  if (draggedIndex < targetIndex) {
    newIndex = targetIndex - 1
  }

  if (draggedIndex === newIndex) return

  games.value.splice(draggedIndex, 1)
  games.value.splice(newIndex, 0, draggedGame)

  draggedIndex = -1
  autoSave()
}

// Validace input hodnot
function validateGameInput(game: Game) {
  // Pokud je opponent rating prázdný nebo neplatný, nastavit výchozí hodnotu
  if (!game.opponentRating || isNaN(game.opponentRating) || game.opponentRating < 0) {
    game.opponentRating = 2000
  }

  // Omezit opponent rating na rozumný rozsah (100-4000)
  if (game.opponentRating < 100) game.opponentRating = 100
  if (game.opponentRating > 4000) game.opponentRating = 4000

  // Zajistit že result je platná hodnota (0, 0.5, nebo 1)
  if (![0, 0.5, 1].includes(game.result)) {
    game.result = 1
  }
}

function validateMyRating() {
  if (!myRating.value || isNaN(myRating.value) || myRating.value < 0) {
    myRating.value = 1500
  }
  if (myRating.value < 100) myRating.value = 100
  if (myRating.value > 4000) myRating.value = 4000
  calculate()
}

// Načíst uložená data při startu aplikace
loadSavedData()

</script>

<template>
  <ReloadPrompt />
  <div class="container">
    <h1>Chess ELO Calculator</h1>

    <div class="rating-input">
      <div class="rating-group">
        <label>My Rating:</label>
        <input
          type="number"
          v-model.number="myRating"
          @change="calculate"
          @blur="validateMyRating"
          min="100"
          max="4000"
          step="1"
        >
      </div>
      <div class="k-factor-group">
        <label>K-Factor:</label>
        <select v-model.number="kFactor" @change="calculate">
          <option :value="10">K-10</option>
          <option :value="15">K-15</option>
          <option :value="20">K-20</option>
          <option :value="25">K-25</option>
          <option :value="30">K-30</option>
          <option :value="40">K-40</option>
        </select>
      </div>
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
      <!-- Záhlaví s popisky -->
      <div class="games-header">
        <span>#</span>
        <span>Opponent ELO</span>
        <span>Result</span>
        <span>Change</span>
        <span></span>
      </div>

      <!-- Drop zone na začátku -->
      <div
        class="drop-zone"
        @dragover="handleDropZoneOver"
        @dragenter="handleDropZoneEnter"
        @dragleave="handleDropZoneLeave"
        @drop="handleDropZoneDrop($event, 0)"
      ></div>

      <template v-for="(game, index) in games" :key="game.id">
        <div
          class="game-row"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragend="handleDragEnd"
        >
          <label class="game-number">{{ index + 1 }}</label>
          <input
            type="number"
            v-model.number="game.opponentRating"
            @change="calculate"
            @blur="validateGameInput(game); calculate()"
            min="100"
            max="4000"
            step="1"
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

        <!-- Drop zone mezi položkami -->
        <div
          class="drop-zone"
          @dragover="handleDropZoneOver"
          @dragenter="handleDropZoneEnter"
          @dragleave="handleDropZoneLeave"
          @drop="handleDropZoneDrop($event, index + 1)"
        ></div>
      </template>
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
  gap: 10px;
  flex-wrap: wrap;
}

.rating-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-group label {
  font-size: 14px;
  white-space: nowrap;
  color: #ccc;
}

.rating-group input {
  flex: 1;
  min-width: 0;
  padding: 12px;
  font-size: 18px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #fff;
  color: #000;
  font-weight: bold;
  box-sizing: border-box;
}

.k-factor-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.k-factor-group label {
  font-size: 14px;
  white-space: nowrap;
  color: #ccc;
}

.k-factor-group select {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #fff;
  color: #000;
  cursor: pointer;
  box-sizing: border-box;
}


button {
  padding: 14px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background: #d4d4d4;
  color: #000;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
  min-height: 44px;
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
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  background: #2a2a2a;
  padding: 12px;
  border-radius: 5px;
}

.stat-label {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

.games {
  margin-top: 20px;
}

.games-header {
  display: grid;
  grid-template-columns: 35px 1fr 70px 75px 40px;
  gap: 6px;
  padding: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: bold;
  color: #aaa;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.games-header span:first-child {
  text-align: center;
}

.games-header span:nth-child(3),
.games-header span:nth-child(4) {
  text-align: center;
}

.drop-zone {
  height: 8px;
  margin: 0;
  transition: all 0.2s ease;
  position: relative;
}

.drop-zone::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  background: transparent;
  transition: all 0.2s ease;
}

.drop-zone.drop-zone-active {
  height: 40px;
  margin: 5px 0;
}

.drop-zone.drop-zone-active::before {
  height: 4px;
  background: #4ade80;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}

.game-row {
  display: grid;
  grid-template-columns: 35px 1fr 70px 75px 40px;
  gap: 6px;
  margin: 0;
  align-items: center;
  cursor: grab;
  padding: 8px;
  border-radius: 5px;
  transition: background 0.2s, transform 0.1s, opacity 0.2s;
  background: rgba(255, 255, 255, 0.02);
}

.game-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.game-row:active {
  cursor: grabbing;
}

.game-row.dragging {
  opacity: 0.4;
  cursor: grabbing;
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.1);
}

.game-row label {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  color: #aaa;
}

.game-number {
  user-select: none;
  pointer-events: none;
}

.game-row input[type="number"] {
  padding: 10px 8px;
  font-size: 16px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #fff;
  color: #000;
  font-weight: bold;
  min-width: 0;
  box-sizing: border-box;
}

.game-row select {
  padding: 10px 6px;
  font-size: 15px;
  border: 2px solid #666;
  border-radius: 5px;
  background: #fff;
  color: #000;
}

.rating-change {
  padding: 6px 4px;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
  font-size: 14px;
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
  padding: 8px;
  font-size: 16px;
  min-height: 40px;
}

.remove-btn:hover {
  background: #888;
}

#addGameBtn {
  margin-top: 10px;
  width: 100%;
}

@media (max-width: 480px) {
  .container {
    padding: 15px;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }

  h1 {
    font-size: 20px;
    padding: 10px;
    margin-bottom: 15px;
  }

  .rating-input {
    margin-bottom: 15px;
  }

  .rating-group {
    flex: 0 0 100%;
    gap: 6px;
  }

  .rating-group label {
    font-size: 12px;
  }

  .rating-group input {
    font-size: 16px;
    padding: 10px;
  }

  .k-factor-group {
    flex: 0 0 100%;
    gap: 6px;
  }

  .k-factor-group label {
    font-size: 12px;
  }

  .k-factor-group select {
    font-size: 14px;
    padding: 10px 12px;
  }


  .stats {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .stat-item {
    padding: 10px;
  }

  .games-header {
    grid-template-columns: 30px 1fr 65px 70px 40px;
    gap: 5px;
    padding: 6px;
    font-size: 11px;
  }

  .game-row {
    grid-template-columns: 30px 1fr 65px 70px 40px;
    gap: 5px;
    padding: 6px;
  }

  .game-row label {
    font-size: 14px;
  }

  .rating-change {
    font-size: 13px;
  }

  button {
    padding: 12px;
  }
}

@media (max-width: 360px) {
  .container {
    padding: 10px;
  }

  h1 {
    font-size: 18px;
    padding: 8px;
  }

  .games-header {
    grid-template-columns: 28px 1fr 60px 65px 36px;
    gap: 4px;
    padding: 5px;
    font-size: 10px;
  }

  .game-row {
    grid-template-columns: 28px 1fr 60px 65px 36px;
    gap: 4px;
    padding: 5px;
  }

  .game-row input[type="number"],
  .game-row select {
    padding: 8px 4px;
    font-size: 14px;
  }

  .rating-change {
    font-size: 12px;
    padding: 4px 2px;
  }

  .remove-btn {
    padding: 6px;
    font-size: 14px;
  }
}
</style>
