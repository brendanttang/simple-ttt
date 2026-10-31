# simple-ttt

A very simple Tic-Tac-Toe web application for **single player**.

## Features: 
- Light and dark mode toggle!
- Play as 'x' (first) or 'o' (second)
- Three levels of difficulty for the CPU
  - Easy: CPU makes random moves
  - Hard: CPU will prioritize: 
    1. win
    2. block win
    3. take center
    4. take corners
    5. take edges
  - Impossible: CPU will play optimally (please see callout below)
- Tracks session results

> [!IMPORTANT]
> There is currently an error in the logic for the 'impossible' difficulty, so it is currently **not** optimal and easily beatable.

## Screenshots:
<p align="center">
  <img src="screenshots/ss-light.png" width="49%" />
  <img src="screenshots/ss-dark.png" width="49%" />
</p>
