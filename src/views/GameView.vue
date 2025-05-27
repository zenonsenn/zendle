<script setup lang="ts">
import ZendleKeyboard from '@/components/ZendleKeyboard.vue'
import { onMounted, reactive, ref } from 'vue'

let previousKey: string | null = null
let latestKey: string | null = null
let hasCatStoppedRestingOnKeyboard: boolean = true
let lastCorrectLetter: string | null = null
let answers: Array<string> = []

const rawWordlist = ref<string[]>()
const dictWordlist = reactive(new Map<string, number>())
const upperCase = /[A-Z]/
const currentKeyDown: Set<string> = new Set()
const finalScore = ref(0.0)
const multiplier = ref(1.01)
const targetLength = ref(69)
const actualScore = ref(0.0)
const difference = ref(0.0)
const differenceLetter = ref(0.0)
// const saveScore = ref(true)
const sameAnswerMultiplier = ref(0.0)
const currentDifficulty = ref('Easy')
const currentDifficultyMultiplier = ref(1.0)
const maxLetterLength = ref(7.0)
const minLetterLength = ref(3.0)
const userUnderstandsHowTheGameWorks = ref(0)
const userHighestScoreEver = ref(0.0)
const modalTimeoutId = ref()

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

const displayModal = () => {
    if (modalTimeoutId.value != null) {
        clearTimeout(modalTimeoutId.value)
    }

    document.getElementById('cookies-modal')?.classList.remove('hidden')
    document.getElementById('cookies-modal')?.classList.add('flex')
    modalTimeoutId.value = setTimeout(() => {
        document.getElementById('cookies-modal')?.classList.remove('flex')
        document.getElementById('cookies-modal')?.classList.add('hidden')
    }, 5000)
}

const closeModal = () => {
    clearTimeout(modalTimeoutId.value)
    document.getElementById('cookies-modal')?.classList.remove('flex')
    document.getElementById('cookies-modal')?.classList.add('hidden')
}

const validateAnswer = (answer: string) => {
    return dictWordlist.has(answer)
}

const submitAnswer = (answer: string | null) => {
    if (answer == null) {
        // TODO: Handle this
        return
    }
    if (answer == '') {
        // Prevents user from submitting an empty string (accidentally or deliberately)
        return
    }

    let answerExists = false
    let answerCorrect = false
    if (answers.includes(answer)) {
        sameAnswerMultiplier.value = Math.min(sameAnswerMultiplier.value + 0.1, 0.99)
        answerExists = true
        answerCorrect = true
    }
    if (!answerCorrect) {
        answerCorrect = validateAnswer(answer)
    }
    if (answerCorrect) {
        // 0. Increase count of the user understanding because there is no need to show the same message over
        // and over again
        userUnderstandsHowTheGameWorks.value++

        // 1. Set scores: successful chain creation, if the word played is the same length as game asked, and penalties
        const firstInputLetter = answer.substring(0, 1)
        let lastUserLetter = null
        if (answers.length > 0) {
            lastUserLetter = answers[answers.length - 1]
                .substring(answers[answers.length - 1].length - 1)
                .toUpperCase()
        }
        if (answers.length > 0 && lastUserLetter == firstInputLetter) {
            finalScore.value += 10.0
            multiplier.value +=
                1 / (10.0 * currentDifficultyMultiplier.value * Math.sqrt(multiplier.value))
        } else if (answers.length > 0 && lastUserLetter != firstInputLetter) {
            // Calculate penalty when the user used a different first letter than what is obliged
            actualScore.value = finalScore.value
            const distance =
                Math.abs(lastUserLetter!.charCodeAt(0) - answer.substring(0, 1).charCodeAt(0)) /
                lastUserLetter!.charCodeAt(0)
            let penalty = 0.0
            if (distance >= 1) {
                penalty = 0.0
            } else {
                penalty = 1.0 - distance
            }
            differenceLetter.value = actualScore.value - actualScore.value * penalty
            finalScore.value *= penalty

            // Display the penalty
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

            // Reset multiplier
            multiplier.value = 1.01

            // Display the penalty of multiplier value being reset
            document
                .getElementById('multiplier-penalty-modal')
                ?.classList.add('animate-penalty-wiggle')

            setTimeout(() => {
                document
                    .getElementById('multiplier-penalty-modal')
                    ?.classList.remove('animate-penalty-wiggle')
            }, 1000)
        } else {
            finalScore.value += 10.0
        }

        if (answer.length == targetLength.value) {
            finalScore.value += 2.5
        } else if (targetLength.value == 69) {
            finalScore.value += 5.0
        } else if (answer.length != targetLength.value && targetLength.value != 69) {
            // Calculate penalty when the user inputted length is different than the obliged length
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
            difference.value = actualScore.value - actualScore.value * penalty
            finalScore.value *= penalty

            // Display the difference as something that appears, translates down, and dissapears
            document.getElementById('penalty-modal')?.classList.remove('hidden')
            document.getElementById('penalty-modal')?.classList.add('flex', 'animate-penalty')

            setTimeout(() => {
                document.getElementById('penalty-modal')?.classList.remove('flex')
                document.getElementById('penalty-modal')?.classList.add('hidden', 'animate-penalty')
            }, 700)
        }

        // 2. Set last letter as first letter for the new word
        // console.log(answer.substring(answer.length - 1))
        lastCorrectLetter = answer.substring(answer.length - 1).toUpperCase()

        if (!answerExists) {
            answers.push(answer)
        } else {
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
        // console.log(answers)

        // 2a. Show custom messages that tell the player what number
        // of letters the word shoule have
        // The min and max word length could probably be tuned by the
        // difficulty set by the user
        targetLength.value = Math.round(
            Math.max(minLetterLength.value, Math.random() * maxLetterLength.value),
        )

        // 2b. Show custom messages based on a numerical threshold
        if (userUnderstandsHowTheGameWorks.value < 5) {
            document.getElementById('next-letter')!.textContent =
                'Great! Now type another valid English word starting with ' +
                lastCorrectLetter +
                '!\nAnswer must be a ' +
                targetLength.value +
                ' letter word or you will get penalized :('
        } else if (userUnderstandsHowTheGameWorks.value < 10) {
            document.getElementById('next-letter')!.textContent = 'Have fun!'
        } else {
            document.getElementById('next-letter')!.textContent = ''
        }

        document.getElementById('terminal-prefix')!.classList.remove('hidden')
        document.getElementById('terminal-prefix')!.classList.add('flex')
        document.getElementById('letter-field')!.textContent = ''

        // 3. Clean up
        currentKeyDown.clear()
        hasCatStoppedRestingOnKeyboard = true
    } else {
        // TODO: Handle game over
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
                userHighestScoreEver.value = maxHighScore

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
        answers = []
        targetLength.value = 69
        userUnderstandsHowTheGameWorks.value = 7
        hasCatStoppedRestingOnKeyboard = true
    }
}

const displayLetter = (letter: string | null) => {
    if (letter != null) {
        document.getElementById('terminal-prefix')!.classList.remove('flex')
        document.getElementById('terminal-prefix')!.classList.add('hidden')

        document.getElementById('letter-field')!.textContent += letter
        return
    }

    const keyToDisplay = latestKey!.toUpperCase()

    if (keyToDisplay == 'ENTER') {
        submitAnswer(document.getElementById('letter-field')!.textContent)
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
const inputLetter = (letter: string) => {
    if (letter == 'ENTER') {
        submitAnswer(document.getElementById('letter-field')!.textContent)
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

    displayLetter(letter)
}

const changeDifficulty = () => {
    currentDifficulty.value = document.getElementById('difficulty-button')!.textContent!
    switch (currentDifficulty.value) {
        case 'Easy':
            // Cycle to medium
            minLetterLength.value = 3.0
            maxLetterLength.value = 10.0
            document.getElementById('difficulty-button')!.textContent = 'Medium'
            currentDifficulty.value = 'Medium'
            currentDifficultyMultiplier.value = 1.25
            break
        case 'Medium':
            // Cycle to hard
            minLetterLength.value = 2.0
            maxLetterLength.value = 15.0
            document.getElementById('difficulty-button')!.textContent = 'Hard'
            currentDifficulty.value = 'Hard'
            currentDifficultyMultiplier.value = 1.69
            break
        case 'Hard':
            // Cycle to lexicomaxxer
            minLetterLength.value = 2.0
            maxLetterLength.value = 20.0
            document.getElementById('difficulty-button')!.textContent = 'Lexicomaxxer'
            currentDifficulty.value = 'Lexicomaxxer'
            currentDifficultyMultiplier.value = 3.14
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
    // TODO: Create a smoother experience
    // location.reload()
    document.getElementById('terminal-prefix')!.classList.add('flex')
    document.getElementById('terminal-prefix')!.classList.remove('hidden')

    document.getElementById('game-over')!.classList.add('hidden')
    document.getElementById('game-over')!.classList.remove('flex')

    document.getElementById('next-letter')!.textContent =
        "Let's start again with any valid English word."

    finalScore.value = 0.0
    multiplier.value = 1.01
}

onMounted(() => {
    let counter = 0

    document.getElementById('difficulty-button')!.textContent = 'Easy'

    document.body.addEventListener('keydown', (event) => {
        // console.log(hasCatStoppedRestingOnKeyboard)
        // console.log(event.key)
        currentKeyDown.add(event.key)
        previousKey = latestKey
        latestKey = event.key

        if (latestKey.toUpperCase() == 'BACKSPACE') {
            displayLetter(null)
            return
        }

        if (hasCatStoppedRestingOnKeyboard) {
            if (previousKey != latestKey) {
                displayLetter(null)
                // console.log(event.key)
                counter++
            }
            if (previousKey == latestKey && counter == 0) {
                displayLetter(null)
                // console.log(event.key)
            }
        }
        if (previousKey == latestKey) {
            counter = 0
            hasCatStoppedRestingOnKeyboard = false
        }
    })

    document.body.addEventListener('keyup', (event) => {
        if (currentKeyDown.size > 0) {
            // console.log('cat got bored: ' + event.key)
            // console.log('there are multiple cats resting on the keyboard')
            currentKeyDown.delete(event.key)
        }
        if (currentKeyDown.size == 0) {
            // console.log('cat has stopped resting on the keyboard')
            previousKey = null
            latestKey = null
            counter = 0
            hasCatStoppedRestingOnKeyboard = true
        }
    })
})
</script>

<template>
    <div class="prevent-select bg-calm-grey font-inter">
        <!-- Cookies information -->
        <div class="relative flex w-full items-center justify-center">
            <div id="cookies-modal" class="absolute top-4 hidden w-full max-w-[600px] px-4">
                <div class="z-10 flex flex-row items-center rounded-lg bg-gray-300 p-3">
                    Cookies contain your scores; that's it. They are stored locally by your browser.
                    We don't have servers to collect any of your data.
                    <button v-on:click="closeModal" class="cursor-pointer">
                        <span class="material-symbols-outlined"> close </span>
                    </button>
                </div>
            </div>
        </div>

        <div class="flex h-screen w-full flex-col">
            <!-- Header -->
            <div class="mt-4 flex h-fit w-full items-center justify-center">
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
            <!-- Screen -->
            <div class="flex h-full items-center justify-center px-4">
                <div
                    class="flex h-full max-w-[600px] min-w-[300px] grow flex-col items-center justify-center"
                >
                    <div class="relative w-full">
                        <div class="mb-2 flex flex-row">
                            <div v-if="targetLength != 69" class="flex flex-row text-3xl font-bold">
                                {{ lastCorrectLetter }}&nbsp;
                                <div
                                    v-for="uscore in new Array(targetLength - 1).fill('_')"
                                    :key="uscore"
                                >
                                    {{ uscore }}&nbsp;
                                </div>
                            </div>
                        </div>
                        <div class="mb-2 flex flex-row">
                            <div id="terminal-prefix" class="animate-terminal text-3xl font-bold">
                                _
                            </div>
                            <div id="letter-field" class="text-3xl font-bold"></div>
                        </div>
                        <div id="next-letter" class="absolute left-0 text-xl text-gray-500">
                            Welcome to Zendle! Start by typing any valid English word.
                        </div>
                        <div
                            id="game-over"
                            class="static hidden h-fit w-full min-w-fit items-center justify-center rounded-lg bg-gray-300 p-4 text-xl"
                        >
                            <div v-if="userHighestScoreEver > 0">
                                Your {{ currentDifficulty.toLowerCase() }} difficulty game is over
                                because the answer isn't a valid English word :( <br />
                                Your score is {{ finalScore.toFixed(2) }}. Your highest score is
                                {{ userHighestScoreEver.toFixed(2) }}&nbsp;&nbsp;
                            </div>
                            <div v-else>
                                Game over. Your score is
                                {{ finalScore.toFixed(2) }}&nbsp;&nbsp;
                            </div>
                            <button
                                v-on:click="restart"
                                class="material-symbols-outlined cursor-pointer"
                            >
                                replay
                            </button>
                        </div>
                    </div>
                    <!-- <button v-on:click="submitAnswer('hello')">debug correct</button>
                        <button v-on:click="submitAnswer('hellzzo')">debug incorrect</button> -->
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
                    class="m-4 mt-0 hidden max-w-[600px] min-w-[300px] grow items-center justify-center overflow-x-scroll rounded-lg bg-gray-300 p-3 sm:flex"
                >
                    <p>
                        Made with
                        <span class="material-symbols-outlined pb-1 align-middle"> favorite </span>
                        by
                        <a
                            href="https://x.com/zenonsenn"
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            class="hover:underline hover:decoration-2"
                            >@zenonsenn</a
                        >. Your
                        <button
                            :onclick="displayModal"
                            class="cursor-pointer rounded-lg bg-calm-grey p-1 hover:bg-zendle-orange"
                        >
                            cookies
                        </button>
                        are local.
                    </p>
                </div>
                <div
                    class="m-4 mt-0 flex max-w-[600px] min-w-[300px] grow items-center justify-center overflow-x-scroll rounded-lg bg-gray-300 p-3 sm:hidden"
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
                            :onclick="displayModal"
                            class="cursor-pointer rounded-lg bg-calm-grey p-1 hover:bg-zendle-orange"
                        >
                            Cookies.
                        </button>
                    </p>
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
