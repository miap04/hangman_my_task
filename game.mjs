import * as readlinePromises from 'node:readline/promises';
const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout });

async function askQuestion(question) {
    return await rl.question(question);
}

import { ANSI } from './ansi.mjs';
import { HANGMAN_UI } from './graphics.mjs';

const WORDS_LIST = ["cat", "dog", "sun", "run", "bat"];
let correctWord = "";
let numberOfCharInWord = 0;
let guessedWord = "";
let wordDisplay = "";
let isGameOver = false;
let wasGuessCorrect = false;
let wrongGuesses = [];
let correctGuesses = [];
let shouldClear = true;

function resetGame() {

    correctWord = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)].toLowerCase();
    numberOfCharInWord = correctWord.length;
    guessedWord = "".padStart(correctWord.length, "_");
    wordDisplay = "";
    isGameOver = false;
    wasGuessCorrect = false;
    wrongGuesses = [];
    shouldClear = true;
}

function drawWordDisplay() {
    wordDisplay = "";

    for (let i = 0; i < numberOfCharInWord; i++) {
        if (guessedWord[i] !== "_") {
            wordDisplay += ANSI.COLOR.GREEN;
        }
        wordDisplay += guessedWord[i] + " ";
        wordDisplay += ANSI.RESET;
    }

    return wordDisplay;
}

function drawList(list, color) {
    let output = color;
    for (let i = 0; i < list.length; i++) {
        output += list[i] + " ";
    }
    return output + ANSI.RESET;
}

function ifPlayerGuessedLetter(answer) {
    return answer.length === 1;
}

async function gameLoop() {
    while (!isGameOver) {
        if (shouldClear) {
            console.log(ANSI.CLEAR_SCREEN);
        }

        console.log(drawWordDisplay());
        console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
        console.log(HANGMAN_UI[wrongGuesses.length]);

        const answer = (await askQuestion("Guess a char or the word: ")).toLowerCase();

        if (wrongGuesses.includes(answer) || guessedWord.includes(answer)) {
            console.log(ANSI.CLEAR_SCREEN);
            console.log(drawWordDisplay());
            console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
            console.log(HANGMAN_UI[wrongGuesses.length]);

            console.log(ANSI.COLOR.YELLOW + "You have already guessed that letter!" + ANSI.RESET);
            shouldClear = false;
            continue;
        }

        if (answer === correctWord) {
            isGameOver = true;
            wasGuessCorrect = true;
        } else if (ifPlayerGuessedLetter(answer)) {
            let org = guessedWord;
            guessedWord = "";

            let isCorrect = false;
            for (let i = 0; i < correctWord.length; i++) {
                if (correctWord[i] === answer) {
                    guessedWord += answer;
                    isCorrect = true;
                } else {
                    guessedWord += org[i]; 
                }
            }

            if (!isCorrect) {
                wrongGuesses.push(answer);
            } else if (isCorrect){
                correctGuesses.push(answer);
            } else if (guessedWord === correctWord) {
                isGameOver = true;
                wasGuessCorrect = true;
            }
        }

        
        if (wrongGuesses.length === HANGMAN_UI.length) {
            isGameOver = true;
            
        }
    }

   
    endGame();
}


async function endGame() {
    console.log(ANSI.CLEAR_SCREEN);
    console.log(drawWordDisplay());
    console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
    console.log(HANGMAN_UI[wrongGuesses.length]);

    if (wasGuessCorrect) {
        console.log(ANSI.COLOR.GREEN + "Congratulations! You Won!" + ANSI.RESET);
    } else {
        console.log("Game Over. The word was: " + correctWord);
    }

    showPlayerStats();
    showCorrectPlayerStats();
    const playAgain = await askQuestion(ANSI.COLOR.GREEN + "Do you want to play again? (yes/no): ");

    if (playAgain === "yes") {
        resetGame();
        await gameLoop();
    } else {
        console.log(ANSI.COLOR.GREEN + "Thanks for playing!");
        rl.close();
    }
}

function showPlayerStats () {
    let res = ANSI.COLOR.RED + "Incorrect Guesses";
    for (let i = 0;i < wrongGuesses.length;i++){
        res = res + "\n" + wrongGuesses[i];
    }
    console.log(res)
}
function showCorrectPlayerStats () {
    let res = ANSI.COLOR.GREEN + "Correct Guesses";
    for (let i = 0;i <correctGuesses.length;i++){
        res = res + "\n" + correctGuesses[i];
    }
    console.log(res);
}
resetGame();
await gameLoop();
