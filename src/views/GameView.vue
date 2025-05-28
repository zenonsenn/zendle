<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import ZendleKeyboard from '@/components/ZendleKeyboard.vue'
import { onMounted, reactive, ref } from 'vue'

const counter = ref(0)
const rawWordlist = ref<string[]>()
const dictWordlist = reactive(new Map<string, number>())
const previousKey = ref('')
const latestKey = ref('')
const hasCatStoppedRestingOnKeyboard = ref(true)
const lastCorrectLetter = ref('')
const answers = ref<string[]>([])
const upperCase = /[A-Z]/
const currentKeyDown: Set<string> = new Set()
const finalScore = ref(0.0)
const multiplier = ref(1.01)
const targetLength = ref(69)
const actualScore = ref(0.0)
const difference = ref(0.0)
const differenceLetter = ref(0.0)
const sameAnswerMultiplier = ref(0.0)
const currentDifficulty = ref('Easy')
const difficultyAtStart = ref('Easy')
const currentDifficultyMultiplier = ref(1.0)
const maxLetterLength = ref(7.0)
const minLetterLength = ref(3.0)
const playerUnderstandsHowTheGameWorks = ref(0)
const playerHighestScoreEver = ref(0.0)

// Timeouts
const modalTimeoutId = ref()
const answerExistsTimeoutId = ref()

// Key Handlers
let handleKeyUp: any
let handleKeyDown: any

const setupWordlist = async () => {
    const url =
        'https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words_alpha.txt'
    try {
        await fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`)
                }
                return response.text()
            })
            .then((textData) => {
                rawWordlist.value = textData.split('\n')
                for (let i = 0; i < rawWordlist.value.length; i++) {
                    const cleanWord = rawWordlist.value[i].replace('\r', '')
                    dictWordlist.set(cleanWord.toUpperCase(), cleanWord.length)
                }
            })
    } catch (error) {
        console.log(error)
    }
}

await setupWordlist()

const addKeyboardEvent = () => {
    handleKeyDown = (event: any) => {
        currentKeyDown.add(event.key)
        previousKey.value = latestKey.value
        latestKey.value = event.key

        if (latestKey.value.toUpperCase() == 'BACKSPACE') {
            displayLetter()
            return
        }

        if (hasCatStoppedRestingOnKeyboard.value) {
            if (previousKey.value != latestKey.value) {
                displayLetter()
                counter.value++
            }
            if (previousKey.value == latestKey.value && counter.value == 0) {
                displayLetter()
            }
        }
        if (previousKey.value == latestKey.value) {
            counter.value = 0
            hasCatStoppedRestingOnKeyboard.value = false
        }
    }

    handleKeyUp = (event: any) => {
        if (currentKeyDown.size > 0) {
            currentKeyDown.delete(event.key)
        }
        if (currentKeyDown.size == 0) {
            previousKey.value = ''
            latestKey.value = ''
            counter.value = 0
            hasCatStoppedRestingOnKeyboard.value = true
        }
    }

    document.body.addEventListener('keydown', handleKeyDown)
    document.body.addEventListener('keyup', handleKeyUp)
}

const removeKeyboardEvent = () => {
    document.body.removeEventListener('keydown', handleKeyDown)
    document.body.removeEventListener('keyup', handleKeyUp)
}

const displayMenuOverlay = () => {
    removeKeyboardEvent()
    document.getElementById('menu-overlay')?.classList.remove('hidden', '-z-10')
    document.getElementById('menu-overlay')?.classList.add('flex', 'z-10')
}

const closeMenuOverlay = () => {
    addKeyboardEvent()
    document.getElementById('menu-overlay')?.classList.add('hidden', '-z-10')
    document.getElementById('menu-overlay')?.classList.remove('flex', 'z-10')
}

const displayCookiesModal = () => {
    if (modalTimeoutId.value != null) {
        clearTimeout(modalTimeoutId.value)
    }

    document.getElementById('cookies-modal')?.classList.remove('hidden')
    document.getElementById('cookies-modal')?.classList.add('flex')
    modalTimeoutId.value = setTimeout(() => {
        document.getElementById('cookies-modal')?.classList.remove('flex')
        document.getElementById('cookies-modal')?.classList.add('hidden')
    }, 8000)
}

const closeCookiesModal = () => {
    clearTimeout(modalTimeoutId.value)
    document.getElementById('cookies-modal')?.classList.remove('flex')
    document.getElementById('cookies-modal')?.classList.add('hidden')
}

const validateAnswer = (answer: string) => {
    return dictWordlist.has(answer)
}

const progressGame = (answer: string | null) => {
    if (answer == null) {
        // Prevent submission (do nothing)
        return
    }
    if (answer == '') {
        // Prevents player from submitting an empty string (accidentally or deliberately)
        return
    }

    let answerExists = false
    let answerCorrect = false

    // Penalise player if they have put an answer they have answered before
    // Alternate: not allow player to submit the answer (Easy, Medium)
    // Show a list of words that have been played (in a neat graph form)
    // Not show anything at Lexicomaxxer
    if (answers.value!.includes(answer)) {
        if (currentDifficulty.value == 'Easy' || currentDifficulty.value == 'Medium') {
            document.getElementById('letter-field')?.classList.add('animate-penalty-wiggle')

            // Cancels previous timeout if user keeps smashing the enter key
            if (answerExistsTimeoutId.value != null) {
                clearTimeout(answerExistsTimeoutId.value)
            }
            answerExistsTimeoutId.value = setTimeout(() => {
                document.getElementById('letter-field')?.classList.remove('animate-penalty-wiggle')
            }, 500)
            return
        } else {
            sameAnswerMultiplier.value = Math.min(sameAnswerMultiplier.value + 0.1, 0.99)
            answerExists = true
            answerCorrect = true
        }
    }
    if (!answerCorrect) {
        answerCorrect = validateAnswer(answer)
    }

    if (answerCorrect) {
        // CORRECT ANSWER
        // 0. Increase count of the player understanding because there is no need to show the same message over
        // and over again
        playerUnderstandsHowTheGameWorks.value++

        // 1. Validate existence of answer
        if (!answerExists) {
            // console.log('Answer never played')
            answers.value!.push(answer)
        } else {
            // console.log('Duplicate answer')
            answers.value!.push(answer)
            multiplier.value -= multiplier.value * sameAnswerMultiplier.value
            // Display the penalty of multiplier value being affected
            document
                .getElementById('multiplier-penalty-modal')
                ?.classList.add('animate-penalty-wiggle')

            setTimeout(() => {
                document
                    .getElementById('multiplier-penalty-modal')
                    ?.classList.remove('animate-penalty-wiggle')
            }, 1000)
        }

        // 2. Set scores: successful chain creation, if the word played is the same length as game asked, and penalties

        // 2a. Get the last letter of the word before and the word that was just played
        const firstInputLetter = answer.substring(0, 1)
        let lastPlayerLetter = null

        if (answers.value!.length > 0) {
            lastPlayerLetter = answers
                .value![
                    answers.value!.length - 1
                ].substring(answers.value![answers.value!.length - 1].length - 1)
                .toUpperCase()
        }

        if (answers.value!.length > 0 && lastPlayerLetter == firstInputLetter) {
            // 2b.1. Same letter
            finalScore.value += 10.0
            multiplier.value +=
                currentDifficultyMultiplier.value / (10.0 * Math.sqrt(multiplier.value))
        } else if (answers.value!.length > 0 && lastPlayerLetter != firstInputLetter) {
            // 2b.2. Different letter
            // 2b.2.1. Calculate penalty when the player used a different first letter than what is obliged
            actualScore.value = finalScore.value
            const distance =
                Math.abs(lastPlayerLetter!.charCodeAt(0) - answer.substring(0, 1).charCodeAt(0)) /
                lastPlayerLetter!.charCodeAt(0)
            let penalty = 0.0
            if (distance >= 1) {
                penalty = 0.0
            } else {
                penalty = 1.0 - distance
            }
            differenceLetter.value = actualScore.value - actualScore.value * penalty
            finalScore.value *= penalty

            // 2b.2.2. Display the penalty
            setTimeout(() => {
                document.getElementById('penalty-modal-letter')?.classList.remove('hidden')
                document
                    .getElementById('penalty-modal-letter')
                    ?.classList.add('flex', 'animate-penalty')

                setTimeout(() => {
                    document.getElementById('penalty-modal-letter')?.classList.remove('flex')
                    document
                        .getElementById('penalty-modal-letter')
                        ?.classList.add('hidden', 'animate-penalty')
                }, 900)
            }, 100)

            finalScore.value *= multiplier.value

            // 2b.2.3. Reset multiplier
            multiplier.value = 1.01

            // 2b.2.4. Display the penalty of multiplier value being reset
            document
                .getElementById('multiplier-penalty-modal')
                ?.classList.add('animate-penalty-wiggle')

            setTimeout(() => {
                document
                    .getElementById('multiplier-penalty-modal')
                    ?.classList.remove('animate-penalty-wiggle')
            }, 1000)
        } else {
            // 2b.3. Base score for genesis answer
            finalScore.value += 10.0
        }

        if (answer.length == targetLength.value) {
            // 2c.1. Score when the length is the same
            finalScore.value += 2.5
        } else if (targetLength.value == 69) {
            // 2c.2. Base score for genesis answer
            finalScore.value += 5.0
        } else if (answer.length != targetLength.value && targetLength.value != 69) {
            // 2c.3. Length different
            // 2c.3.1. Calculate penalty when the player inputted length is different than the obliged length
            actualScore.value = finalScore.value
            const error = Math.abs(answer.length - targetLength.value) / targetLength.value
            let penalty = 0.0
            if (error >= 1) {
                penalty = error - 1.0
            } else {
                penalty = 1.0 - error
            }
            if (penalty > 1.0) {
                penalty = 1.0
            }
            // This variable is to show to the player
            difference.value = actualScore.value - actualScore.value * penalty

            finalScore.value *= penalty

            // 2c.3.2. Display the difference as something that appears, translates down, and dissapears
            document.getElementById('penalty-modal')?.classList.remove('hidden')
            document.getElementById('penalty-modal')?.classList.add('flex', 'animate-penalty')

            setTimeout(() => {
                document.getElementById('penalty-modal')?.classList.remove('flex')
                document.getElementById('penalty-modal')?.classList.add('hidden', 'animate-penalty')
            }, 700)
        }

        // 3. Set last letter as first letter for the new word
        lastCorrectLetter.value = answer.substring(answer.length - 1).toUpperCase()

        // 4. Show custom messages that tell the player what number of letters the word shoule have
        // The min and max word length could probably be tuned by the difficulty set by the player
        targetLength.value = Math.round(
            Math.max(minLetterLength.value, Math.random() * maxLetterLength.value),
        )

        // 5. Show custom messages based on a numerical threshold
        if (playerUnderstandsHowTheGameWorks.value < 5) {
            document.getElementById('next-letter')!.textContent =
                'Great! Now type another valid English word starting with ' +
                lastCorrectLetter.value +
                '!\nAnswer must be a ' +
                targetLength.value +
                ' letter word or you will get penalized :('
        } else if (playerUnderstandsHowTheGameWorks.value < 10) {
            document.getElementById('next-letter')!.textContent = 'Have fun!'
        } else {
            document.getElementById('next-letter')!.textContent = ''
        }

        document.getElementById('terminal-prefix')!.classList.remove('hidden')
        document.getElementById('terminal-prefix')!.classList.add('flex')
        document.getElementById('letter-field')!.textContent = ''

        // 6. Clean up
        currentKeyDown.clear()
        hasCatStoppedRestingOnKeyboard.value = true
    } else {
        // INCORRECT ANSWER
        // 0. Show end game screen
        document.getElementById('game-over')!.classList.remove('hidden')
        document.getElementById('game-over')!.classList.add('flex')

        finalScore.value *= multiplier.value

        // 1. Score tally and save locally using cookies
        const currentCookie = document.cookie

        const d = new Date()
        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000)
        const expires = 'expires=' + d.toUTCString()

        if (document.cookie == '') {
            document.cookie = 'latestScore=' + finalScore.value + ';'
            document.cookie = 'highestScore=' + finalScore.value + ';'
            document.cookie = 'latestDifficulty=' + currentDifficulty.value + ';'
            document.cookie = expires
        } else {
            try {
                const cookieItems = currentCookie.split('; ')
                const maxHighScore = Math.max(
                    Number.parseInt(
                        cookieItems.find((row) => row.startsWith('highestScore='))!.split('=')[1],
                    ),
                    finalScore.value,
                )
                playerHighestScoreEver.value = maxHighScore

                document.cookie = 'latestScore=' + finalScore.value + ';'
                document.cookie = 'highestScore=' + maxHighScore + ';'
                document.cookie = 'latestDifficulty=' + currentDifficulty.value + ';'
                document.cookie = expires
            } catch {}
        }

        // 2. Clean up
        document.getElementById('next-letter')!.textContent = ''
        document.getElementById('terminal-prefix')!.classList.remove('flex')
        document.getElementById('terminal-prefix')!.classList.add('hidden')
        document.getElementById('letter-field')!.textContent = ''

        currentKeyDown.clear()
        answers.value = []

        multiplier.value = 1.01
        targetLength.value = 69
        playerUnderstandsHowTheGameWorks.value = 7

        hasCatStoppedRestingOnKeyboard.value = true
    }
}

// This is for the normal keyboard
const displayLetter = () => {
    const keyToDisplay = latestKey!.value.toUpperCase()

    if (keyToDisplay == 'ENTER') {
        progressGame(document.getElementById('letter-field')!.textContent)
        return
    }
    if (keyToDisplay == 'BACKSPACE') {
        const oldText = document.getElementById('letter-field')!.textContent
        document.getElementById('letter-field')!.textContent = oldText!.substring(
            0,
            oldText!.length - 1,
        )

        if (document.getElementById('letter-field')!.textContent == '') {
            document.getElementById('terminal-prefix')!.classList.add('flex')
            document.getElementById('terminal-prefix')!.classList.remove('hidden')
        }
        return
    }
    if (keyToDisplay.length > 1) {
        // No need to display anything other than singular letters, backspace, and enter
        return
    }

    // Display the actual letter
    if (upperCase.test(keyToDisplay)) {
        document.getElementById('terminal-prefix')!.classList.remove('flex')
        document.getElementById('terminal-prefix')!.classList.add('hidden')

        document.getElementById('letter-field')!.textContent += keyToDisplay
    }
}

// Separation to make code arguably more interpretable
// This is for the custom keyboard (for mobile users)
const inputLetter = (letter: string) => {
    // Handle these two exclusively even though it is the same code
    if (letter == 'ENTER') {
        progressGame(document.getElementById('letter-field')!.textContent)
        return
    }
    if (letter == 'BACKSPACE') {
        const oldText = document.getElementById('letter-field')!.textContent
        document.getElementById('letter-field')!.textContent = oldText!.substring(
            0,
            oldText!.length - 1,
        )

        if (document.getElementById('letter-field')!.textContent == '') {
            document.getElementById('terminal-prefix')!.classList.add('flex')
            document.getElementById('terminal-prefix')!.classList.remove('hidden')
        }
        return
    }
    if (letter != null) {
        document.getElementById('terminal-prefix')!.classList.remove('flex')
        document.getElementById('terminal-prefix')!.classList.add('hidden')

        document.getElementById('letter-field')!.textContent += letter
        return
    }
}

const changeDifficulty = () => {
    // Player can only change difficulty before inputting their first word
    // difficultyAtStart is to lock the difficulty so that it doesn't change during gameplay or
    // at the end screen
    if (answers.value!.length != 0) {
        currentDifficulty.value = difficultyAtStart.value
        document.getElementById('difficulty-button')?.blur()
        return
    }

    // Cycle difficulty
    currentDifficulty.value = document.getElementById('difficulty-button')!.textContent!
    switch (currentDifficulty.value) {
        case 'Easy':
            // Cycle to medium
            minLetterLength.value = 3.0
            maxLetterLength.value = 10.0
            document.getElementById('difficulty-button')!.textContent = 'Medium'
            currentDifficulty.value = 'Medium'
            currentDifficultyMultiplier.value = 2.0
            break
        case 'Medium':
            // Cycle to hard
            minLetterLength.value = 2.0
            maxLetterLength.value = 15.0
            document.getElementById('difficulty-button')!.textContent = 'Hard'
            currentDifficulty.value = 'Hard'
            currentDifficultyMultiplier.value = 3.0
            break
        case 'Hard':
            // Cycle to lexicomaxxer
            minLetterLength.value = 2.0
            maxLetterLength.value = 20.0
            document.getElementById('difficulty-button')!.textContent = 'Lexicomaxxer'
            currentDifficulty.value = 'Lexicomaxxer'
            currentDifficultyMultiplier.value = 5.0
            break
        case 'Lexicomaxxer':
            // Cycle to easy
            minLetterLength.value = 4.0
            maxLetterLength.value = 7.0
            document.getElementById('difficulty-button')!.textContent = 'Easy'
            currentDifficulty.value = 'Easy'
            currentDifficultyMultiplier.value = 1.0
            break
        default:
            // Cycle to easy
            minLetterLength.value = 4.0
            maxLetterLength.value = 7.0
            document.getElementById('difficulty-button')!.textContent = 'Easy'
            currentDifficulty.value = 'Easy'
            currentDifficultyMultiplier.value = 1.0
    }

    document.getElementById('difficulty-button')?.blur()
}

const restart = () => {
    document.getElementById('terminal-prefix')!.classList.add('flex')
    document.getElementById('terminal-prefix')!.classList.remove('hidden')

    document.getElementById('game-over')!.classList.add('hidden')
    document.getElementById('game-over')!.classList.remove('flex')

    document.getElementById('next-letter')!.textContent =
        "Let's start again with any valid English word."

    difficultyAtStart.value = currentDifficulty.value
    finalScore.value = 0.0
    multiplier.value = 1.01
}

onMounted(() => {
    // At first mount, peg the variable with the cyclable variable
    difficultyAtStart.value = currentDifficulty.value

    document.getElementById('difficulty-button')!.textContent = 'Easy'

    addKeyboardEvent()
})
</script>

<template>
    <div>
        <div class="prevent-select h-screen bg-calm-grey">
            <!-- Menu Overlay -->
            <div
                id="menu-overlay"
                class="absolute top-0 -z-10 hidden h-screen max-h-screen w-full items-center justify-center backdrop-blur-xl backdrop-grayscale-100"
            >
                <div class="absolute top-0 h-full w-full max-w-[600px]">
                    <div class="flex h-full flex-col p-4 sm:p-0 sm:py-4">
                        <!-- Blockchain -->
                        <div class="mb-2 flex h-full min-h-0 flex-col gap-y-2">
                            <div class="flex flex-row justify-between gap-x-4">
                                <div id="answer-search" class="w-full rounded-lg bg-gray-300 p-3">
                                    <div
                                        class="flex flex-row justify-between gap-x-2 rounded-lg bg-calm-grey px-2 py-1"
                                    >
                                        <input
                                            v-if="
                                                currentDifficulty != 'Hard' &&
                                                currentDifficulty != 'Lexicomaxxer'
                                            "
                                            type="text"
                                            name="answer-search-field"
                                            id="answer-search-field"
                                            class="w-full"
                                            placeholder="Search is not available right now."
                                        />
                                        <input
                                            v-else
                                            type="text"
                                            name="answer-search-field-readonly"
                                            id="answer-search-field-readonly"
                                            class="w-full"
                                            placeholder="Nuh-uh!"
                                            readonly
                                        />
                                        <button
                                            class="flex w-fit grow-0 cursor-pointer items-center justify-center"
                                        >
                                            <span class="material-symbols-outlined">
                                                backspace
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    v-on:click="closeMenuOverlay"
                                    class="flex grow-0 cursor-pointer items-center justify-center rounded-lg bg-gray-300 p-3 hover:bg-zendle-orange"
                                >
                                    <span class="material-symbols-outlined"> close </span>
                                </button>
                            </div>

                            <div id="answer-history" class="flex grow flex-col overflow-auto">
                                <div
                                    v-if="
                                        answers.length == 0 &&
                                        currentDifficulty != 'Hard' &&
                                        currentDifficulty != 'Lexicomaxxer'
                                    "
                                >
                                    Your word history will appear here...
                                </div>
                                <div
                                    v-else-if="
                                        answers.length != 0 &&
                                        currentDifficulty != 'Hard' &&
                                        currentDifficulty != 'Lexicomaxxer'
                                    "
                                    class="flex w-full flex-wrap gap-1"
                                >
                                    <div
                                        v-for="(item, index) in answers"
                                        :key="index"
                                        class="w-fit border border-black px-2 py-1"
                                    >
                                        {{ item }}
                                    </div>
                                </div>
                                <div v-else>
                                    Word history is disabled for a game with
                                    {{ currentDifficulty }} difficulty. Good luck!
                                </div>
                            </div>
                        </div>

                        <!-- Menu Footer -->
                        <div class="flex h-fit items-center justify-center">
                            <div
                                class="hidden max-w-[600px] min-w-[300px] grow items-center justify-center rounded-lg bg-gray-300 p-3 sm:flex"
                            >
                                <p>
                                    Read the
                                    <router-link
                                        to="/blog"
                                        class="cursor-pointer rounded-lg bg-calm-grey p-1 hover:bg-zendle-orange"
                                        >blog!</router-link
                                    >
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cookies information -->
            <div class="relative flex w-full items-center justify-center">
                <div
                    id="cookies-modal"
                    class="absolute top-4 hidden w-full max-w-[600px] px-4 sm:p-0"
                >
                    <div class="z-10 flex flex-row items-center rounded-lg bg-gray-300 p-3">
                        Cookies contain your scores; that's it. They are stored locally by your
                        browser. We don't have servers to collect any of your data.
                        <button v-on:click="closeCookiesModal" class="cursor-pointer">
                            <span class="material-symbols-outlined"> close </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="relative flex h-screen w-full flex-col">
                <!-- Header -->
                <div class="relative flex w-full items-center justify-center">
                    <div
                        class="relative mt-4 flex h-fit w-full max-w-[600px] items-center justify-center"
                    >
                        <!-- Hamburger Menu -->
                        <div class="absolute right-0">
                            <button
                                v-on:click="displayMenuOverlay"
                                class="material-symbols-outlined cursor-pointer rounded-lg bg-gray-300 p-4 hover:bg-zendle-orange"
                            >
                                menu
                            </button>
                        </div>

                        <!-- Informational Bar -->
                        <div class="rounded-lg bg-gray-300 p-3">
                            <div class="flex flex-row items-center">
                                Score:
                                <div class="relative">
                                    &nbsp;{{ finalScore.toFixed(2) }}&nbsp;
                                    <!-- Penalty modal for different lengths -->
                                    <div
                                        id="penalty-modal"
                                        class="absolute top-4 left-4 hidden text-red-500"
                                    >
                                        -{{ difference.toFixed(2) }}
                                    </div>
                                    <!-- Penalty modal for different letters -->
                                    <div
                                        id="penalty-modal-letter"
                                        class="absolute top-4 -left-4 hidden text-red-500"
                                    >
                                        -{{ differenceLetter.toFixed(2) }}
                                    </div>
                                </div>
                                | x
                                <p id="multiplier-penalty-modal" class="">
                                    {{ multiplier.toFixed(2) }}&nbsp;
                                </p>
                                <div>
                                    | Difficulty:
                                    <button
                                        v-on:click="changeDifficulty"
                                        id="difficulty-button"
                                        class="cursor-pointer rounded-lg bg-calm-grey p-1 hover:bg-zendle-orange"
                                    ></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Screen -->
                <div class="flex h-full items-center justify-center px-4">
                    <div
                        class="flex h-full max-w-[600px] min-w-[300px] grow flex-col items-center justify-center"
                    >
                        <div class="relative w-full">
                            <div class="mb-2 flex flex-row">
                                <div
                                    v-if="targetLength != 69"
                                    class="flex flex-row font-martian-mono text-3xl"
                                >
                                    {{ lastCorrectLetter }}
                                    <div
                                        v-for="uscore in new Array(targetLength - 1).fill('_')"
                                        :key="uscore"
                                    >
                                        {{ uscore }}
                                    </div>
                                </div>
                            </div>
                            <div class="mb-2 flex flex-row">
                                <div
                                    id="terminal-prefix"
                                    class="animate-terminal font-martian-mono text-3xl"
                                >
                                    _
                                </div>
                                <div id="letter-field" class="font-martian-mono text-3xl"></div>
                            </div>
                            <div id="next-letter" class="absolute left-0 text-xl text-gray-500">
                                Welcome to Zendle! Start by typing any valid English word.
                            </div>
                            <div
                                id="game-over"
                                class="static hidden h-fit w-full min-w-fit items-center justify-center rounded-lg bg-gray-300 p-4 text-xl"
                            >
                                <div v-if="playerHighestScoreEver > 0">
                                    Your {{ difficultyAtStart.toLowerCase() }} difficulty game is
                                    over because the answer isn't a valid English word :(
                                    <br />
                                    Your score is {{ finalScore.toFixed(2) }}. Your highest score is
                                    {{ playerHighestScoreEver.toFixed(2) }}&nbsp;&nbsp;
                                </div>
                                <div v-else>
                                    Your {{ difficultyAtStart.toLowerCase() }} difficulty game is
                                    over because the answer isn't a valid English word :(
                                    <br />
                                    Your score is {{ finalScore.toFixed(2) }}&nbsp;&nbsp;
                                </div>
                                <button
                                    v-on:click="restart"
                                    class="material-symbols-outlined cursor-pointer"
                                >
                                    replay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Keyboard -->
                <div class="flex items-center justify-center">
                    <ZendleKeyboard
                        @letter-tap="inputLetter"
                        class="h-fit max-w-[600px] min-w-[300px] grow"
                    ></ZendleKeyboard>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-center">
                    <div
                        class="m-4 mt-0 hidden max-w-[600px] min-w-[300px] grow items-center justify-center rounded-lg bg-gray-300 p-3 sm:flex"
                    >
                        <p>
                            Made with
                            <span class="material-symbols-outlined pb-1 align-middle">
                                favorite
                            </span>
                            by
                            <a
                                href="https://x.com/zenonsenn"
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                class="hover:underline hover:decoration-2"
                                >@zenonsenn</a
                            >. Your
                            <button
                                :onclick="displayCookiesModal"
                                class="cursor-pointer rounded-lg bg-calm-grey p-1 hover:bg-zendle-orange"
                            >
                                cookies
                            </button>
                            are local.
                        </p>
                    </div>
                    <div
                        class="m-4 mt-0 flex max-w-[600px] min-w-[300px] grow items-center justify-center rounded-lg bg-gray-300 p-3 sm:hidden"
                    >
                        <p>
                            By
                            <a
                                href="https://x.com/zenonsenn"
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                class="hover:underline hover:decoration-2"
                                >@zenonsenn</a
                            >.&nbsp;<button
                                :onclick="displayCookiesModal"
                                class="cursor-pointer rounded-lg bg-calm-grey p-1 hover:bg-zendle-orange"
                            >
                                Cookies.
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.material-symbols-outlined {
    font-variation-settings:
        'FILL' 0,
        'wght' 550,
        'GRAD' 0,
        'opsz' 24;
}

.prevent-select {
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
}
</style>
