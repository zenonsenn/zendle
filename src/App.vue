<script setup lang="ts">
import ZendleKeyboard from '@/components/ZendleKeyboard.vue'
import { onMounted } from 'vue'

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
let isRoundOne: boolean = true

const upperCase = /[A-Z]/
const currentKeyDown: Set<string> = new Set()
const answers: Array<string> = []

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
        document.getElementById('next-letter')!.textContent =
            'Great! Now type another valid English word starting with ' + lastCorrectLetter + '!'
        document.getElementById('letter-field')!.textContent = ''
        isRoundOne = false
        currentKeyDown.clear()
        hasCatStoppedRestingOnKeyboard = true
    } else {
        // TODO: Handle game over
        // 0. Show end game screen
        document.getElementById('game-over')!.classList.remove('hidden')
        document.getElementById('game-over')!.classList.add('flex')

        // 1. Score tally and save locally using cookies

        // 2. Clean up
        document.getElementById('next-letter')!.textContent = ''
        document.getElementById('letter-field')!.textContent = ''
        isRoundOne = true
        currentKeyDown.clear()
        hasCatStoppedRestingOnKeyboard = true
    }
}

const displayLetter = async () => {
    const keyToDisplay = latestKey!.toUpperCase()

    if (keyToDisplay == 'ENTER') {
        await submitAnswer(document.getElementById('letter-field')!.textContent)
        return
    }
    if (keyToDisplay == 'BACKSPACE') {
        const oldText = document.getElementById('letter-field')!.textContent
        if (!isRoundOne && oldText?.length == 1) {
            // You can't delete the first letter after round one
            // TODO: Send this message to the player
            console.log("can't del first letter after round one")
        }
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
            displayLetter()
            return
        }

        if (hasCatStoppedRestingOnKeyboard) {
            if (previousKey != latestKey) {
                displayLetter()
                // console.log(event.key)
                counter++
            }
            if (previousKey == latestKey && counter == 0) {
                displayLetter()
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
                            <p>Game over.</p>
                            <button v-on:click="restart">Restart</button>
                        </div>
                    </div>
                    <!-- <button v-on:click="submitAnswer('hello')">debug correct</button>
                <button v-on:click="submitAnswer('hellzzo')">debug incorrect</button> -->
                </div>
            </div>

            <!-- Keyboard -->
            <div class="flex items-center justify-center">
                <ZendleKeyboard class="h-fit max-w-[600px] min-w-[300px] grow"></ZendleKeyboard>
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
