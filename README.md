# Chess ELO Calculator

A simple, clean, and responsive web application for calculating chess ELO rating changes based on a series of games. This tool is perfect for chess players who want to track their performance and estimate their new rating after a tournament or a series of matches.

The app is a fully offline-capable Progressive Web App (PWA), built with Vue.js and Vite.

## Features

~~- **Cumulative ELO Calculation**: Each game's result affects the rating for the next game in the series.
- **Dynamic K-Factor**: Easily switch between different K-factors (10, 15, 20, 25, 30, 40).
- **Performance Statistics**: Automatically calculates your performance rating, total points, and average opponent rating.
- **Drag & Drop Reordering**: Intuitively reorder games to see how the sequence affects the outcome.
- **PWA & Offline Support**: Installable on any device and works without an internet connection.
- **Auto-Save**: Your data is automatically saved to your browser's local storage.~~

## ELO Calculation Formula

The calculator uses the official FIDE rating system formulas.

### 1. Expected Score (E)

The expected score is the probability of a player winning against their opponent. It is calculated as follows:

```
E = 1 / (1 + 10^((Ro - Rp) / 400))
```

- `E`: Expected score
- `Ro`: Opponent's rating
- `Rp`: Player's current rating

### 2. New Rating (R')

The new rating is calculated after each game based on the K-factor, the actual score, and the expected score:

```
R' = Rp + K * (S - E)
```

- `R'`: New rating
- `Rp`: Player's current rating
- `K`: K-factor (development coefficient)
- `S`: Actual score (1 for a win, 0.5 for a draw, 0 for a loss)
- `E`: Expected score

The application calculates these changes cumulatively, meaning the `New Rating` from one game becomes the `Player's current rating` for the next game in the list.
