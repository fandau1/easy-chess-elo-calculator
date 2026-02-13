export interface Game {
  id: number
  opponentRating: number
  result: number
  change: number
}

export interface EloCalculationResult {
  games: Game[]
  totalChange: number
  currentRating: number
}

/**
 * Vypočítá expected score pro jednu hru
 */
function calculateExpectedScore(myRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400))
}

/**
 * Vypočítá změnu ELO pro jednu hru
 */
function calculateSingleGameChange(
  myRating: number,
  opponentRating: number,
  result: number,
  kFactor: number
): number {
  const expected = calculateExpectedScore(myRating, opponentRating)
  return kFactor * (result - expected)
}

/**
 * Přepočítá všechny změny kumulativně
 * Každá hra ovlivňuje rating pro následující hru
 */
export function recalculateAllGames(
  games: Game[],
  myRating: number,
  kFactor: number
): EloCalculationResult {
  let currentRating = myRating

  const updatedGames = games.map(game => {
    // Validace dat
    const validRating = !isNaN(game.opponentRating) && game.opponentRating > 0
      ? game.opponentRating
      : 2000
    const validResult = !isNaN(game.result) && game.result >= 0 && game.result <= 1
      ? game.result
      : 1

    // Vypočítat změnu na základě aktuálního ratingu
    const change = calculateSingleGameChange(currentRating, validRating, validResult, kFactor)

    // Aktualizovat rating pro další hru
    currentRating += change

    return {
      id: game.id,
      opponentRating: validRating,
      result: validResult,
      change
    }
  })

  const totalChange = updatedGames.reduce((sum, game) => sum + game.change, 0)

  return {
    games: updatedGames,
    totalChange,
    currentRating
  }
}

/**
 * Vypočítá změnu pro novou hru na základě všech předchozích her
 */
export function calculateNewGameChange(
  games: Game[],
  myRating: number,
  opponentRating: number,
  result: number,
  kFactor: number
): number {
  // Vypočítat aktuální kumulativní rating
  let currentRating = myRating
  games.forEach(game => {
    currentRating += game.change
  })

  // Vypočítat změnu pro novou hru
  return calculateSingleGameChange(currentRating, opponentRating, result, kFactor)
}

/**
 * Vypočítá performance rating na základě výsledků
 */
export function calculatePerformance(
  averageOpponentRating: number,
  totalPoints: number,
  totalGames: number
): number {
  if (totalGames === 0) return 0

  const percentage = totalPoints / totalGames

  if (percentage === 1) {
    return averageOpponentRating + 400
  } else if (percentage === 0) {
    return averageOpponentRating - 400
  } else {
    return averageOpponentRating + 400 * Math.log10(percentage / (1 - percentage))
  }
}

/**
 * Validuje rating hodnotu
 */
export function validateRating(rating: number, defaultValue = 2000): number {
  if (!rating || isNaN(rating) || rating < 0) {
    return defaultValue
  }
  if (rating < 100) return 100
  if (rating > 4000) return 4000
  return rating
}

/**
 * Validuje K-Factor hodnotu
 */
export function validateKFactor(kFactor: number, defaultValue = 15): number {
  if (!kFactor || isNaN(kFactor) || kFactor <= 0) {
    return defaultValue
  }
  return kFactor
}

/**
 * Validuje result hodnotu
 */
export function validateResult(result: number): number {
  if ([0, 0.5, 1].includes(result)) {
    return result
  }
  return 1
}
