export function calculateExpectedScore(myRating: number, opponentRating: number): number {
  const differenceSign = opponentRating - myRating >= 0 ? 1 : -1; // Determine the sign of the rating difference
  const difference = Math.min(Math.abs(opponentRating - myRating), 400); // Ensure a minimum difference of 400 to prevent extreme expected scores

  return 1 / (1 + Math.pow(10, differenceSign * difference / 400));
}

export function calculateMyRatingNewRating(myRating: number, opponentRating: number, kFactor: number, gameResult: number) {
  return myRating + kFactor * (gameResult - calculateExpectedScore(myRating, opponentRating));
}

