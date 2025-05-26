<script setup lang="ts">
import ZendleKeyboard from '@/components/ZendleKeyboard.vue'
import { onMounted, ref } from 'vue'

const displayModal = () => {
    document.getElementById('cookies-modal')?.classList.remove('hidden')
    document.getElementById('cookies-modal')?.classList.add('flex')
    setTimeout(() => {
        document.getElementById('cookies-modal')?.classList.remove('flex')
        document.getElementById('cookies-modal')?.classList.add('hidden')
    }, 3000)
}

let previousKey: string | null = null
let latestKey: string | null = null
let hasCatStoppedRestingOnKeyboard: boolean = true
let lastCorrectLetter: string | null = null

const upperCase = /[A-Z]/
const currentKeyDown: Set<string> = new Set()
const answers: Array<string> = []
const finalScore = ref(0.0)

const validateAnswer = async (answer: string) => {
    try {
        const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + answer)
        if (response.status == 200) {
            // console.log('Answer is valid.')
            return true
        } else {
            // console.log('Answer is invalid. Game over!')
            return false
        }
    } catch (error) {
        // Validation via API unsuccessful
        console.log(error)
    }
}

const submitAnswer = async (answer: string | null) => {
    if (answer == null) {
        // TODO: Handle this
        return
    }
    if (await validateAnswer(answer)) {
        answers.push(answer)
        console.log(answers)
        // TODO: Handle correct word
        // 1. Set scores: successful chain creation, if the word played is the same length as game asked, and penalties

        // 2. Set last letter as first letter for the new word
        // console.log(answer.substring(answer.length - 1))
        lastCorrectLetter = answer.substring(answer.length - 1).toUpperCase()

        // 2a. Show custom messages based on a numerical threshold
        document.getElementById('next-letter')!.textContent =
            'Great! Now type another valid English word starting with ' + lastCorrectLetter + '!'

        document.getElementById('letter-field')!.textContent = ''
        currentKeyDown.clear()
        hasCatStoppedRestingOnKeyboard = true
    } else {
        // TODO: Handle game over
        // 0. Show end game screen
        document.getElementById('game-over')!.classList.remove('hidden')
        document.getElementById('game-over')!.classList.add('flex')

        // 1. Score tally and save locally using cookies
        for (let i = 0; i < answers.length; i++) {
            try {
                // console.log(answers[i].substring(answers[i].length - 1))
                // console.log(answers[i + 1].substring(0, 1))
                // console.log(
                //     answers[i].substring(answers[i].length - 1) == answers[i + 1].substring(0, 1),
                // )
                if (answers[i].substring(answers[i].length - 1) == answers[i + 1].substring(0, 1)) {
                    finalScore.value += 100.0
                } else {
                    finalScore.value *= 0.5
                }
            } catch {
                break
            }
        }

        // 2. Clean up
        document.getElementById('next-letter')!.textContent = ''
        document.getElementById('letter-field')!.textContent = ''
        currentKeyDown.clear()
        hasCatStoppedRestingOnKeyboard = true
    }
}

const displayLetter = async (letter: string | null) => {
    if (letter != null) {
        document.getElementById('letter-field')!.textContent += letter
        return
    }

    const keyToDisplay = latestKey!.toUpperCase()

    if (keyToDisplay == 'ENTER') {
        await submitAnswer(document.getElementById('letter-field')!.textContent)
        return
    }
    if (keyToDisplay == 'BACKSPACE') {
        const oldText = document.getElementById('letter-field')!.textContent
        document.getElementById('letter-field')!.textContent = oldText!.substring(
            0,
            oldText!.length - 1,
        )
        return
    }
    if (keyToDisplay.length > 1) {
        // No need to display anything other than singular letters, backspace, and enter
        return
    }
    if (upperCase.test(keyToDisplay)) {
        document.getElementById('letter-field')!.textContent += keyToDisplay
    }
}

// Separation to make code arguably more interpretable
const inputLetter = async (letter: string) => {
    if (letter == 'ENTER') {
        await submitAnswer(document.getElementById('letter-field')!.textContent)
        return
    }
    if (letter == 'BACKSPACE') {
        const oldText = document.getElementById('letter-field')!.textContent
        document.getElementById('letter-field')!.textContent = oldText!.substring(
            0,
            oldText!.length - 1,
        )
        return
    }

    displayLetter(letter)
}

const restart = () => {
    // TODO: Create a smoother experience
    location.reload()
}

onMounted(() => {
    let counter = 0

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
    <div class="bg-calm-grey font-inter">
        <!-- Cookies information -->
        <div id="cookies-modal" class="absolute top-4 hidden w-full items-center justify-center">
            <div class="rounded-lg bg-gray-300 p-3">
                Cookies contain your best score; that's it.
            </div>
        </div>

        <div class="flex h-screen w-full flex-col">
            <!-- Screen -->
            <div class="flex h-full items-center justify-center">
                <div
                    class="flex h-full max-w-[600px] min-w-[300px] grow flex-col items-center justify-center"
                >
                    <div class="relative w-full">
                        <div id="letter-field" class="mb-2 text-3xl font-bold"></div>
                        <div id="next-letter" class="absolute left-0 text-xl text-gray-500">
                            Start with any valid (pre-2020) English word...
                        </div>
                        <div
                            id="game-over"
                            class="static hidden h-fit w-full min-w-fit items-center justify-center rounded-lg bg-gray-300 p-4 text-xl font-bold"
                        >
                            <p>Game over. Your score is {{ finalScore }}.&nbsp;</p>
                            <button v-on:click="restart">Restart</button>
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
                        <span class="material-symbols-outlined align-bottom"> favorite </span>
                        by @zenonsenn. Cookies contain your best score; that's it.
                    </p>
                </div>
                <div
                    class="m-4 mt-0 flex max-w-[600px] min-w-[300px] grow items-center justify-center overflow-x-scroll rounded-lg bg-gray-300 p-3 sm:hidden"
                >
                    <p>By @zenonsenn.&nbsp;<button :onclick="displayModal">Cookies.</button></p>
                </div>
            </div>
        </div>
    </div>
</template>
