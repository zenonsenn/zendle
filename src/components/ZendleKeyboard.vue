<script setup lang="ts">
import ZendleLetter from '@/components/ZendleLetter.vue'

const simulatePress = (key: string) => {
    document.getElementById(key)!.classList.remove('bg-gray-300')
    document.getElementById(key)!.classList.add('bg-gray-400')

    setTimeout(() => {
        document.getElementById(key)!.classList.remove('bg-gray-400')
        document.getElementById(key)!.classList.add('bg-gray-300')
    }, 250)
}

const firstRowLetters = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']
const secondRowLetters = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
const thirdRowLetters = ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
</script>

<template>
    <div class="flex w-fit flex-col gap-y-2 p-4 sm:gap-y-3 sm:px-0 sm:py-4">
        <div class="flex flex-row justify-between gap-x-1 sm:gap-x-2">
            <div v-for="item in firstRowLetters" :key="item" class="w-full">
                <ZendleLetter
                    :id="'letter-' + item"
                    @letter-tap="
                        () => {
                            $emit('letterTap', item)
                            simulatePress('letter-' + item)
                        }
                    "
                    :letter="item"
                />
            </div>
        </div>

        <div class="flex flex-row justify-between gap-x-1 px-4 sm:gap-x-2">
            <div v-for="item in secondRowLetters" :key="item" class="w-full">
                <ZendleLetter
                    :id="'letter-' + item"
                    @letter-tap="
                        () => {
                            $emit('letterTap', item)
                            simulatePress('letter-' + item)
                        }
                    "
                    :letter="item"
                />
            </div>
        </div>

        <div class="flex flex-row justify-between gap-x-1 sm:gap-x-2">
            <ZendleLetter
                id="letter-enter"
                @letter-tap="
                    () => {
                        $emit('letterTap', 'ENTER')
                        simulatePress('letter-enter')
                    }
                "
                letterClass="material-symbols-outlined"
                letter="subdirectory_arrow_right"
            />
            <div v-for="item in thirdRowLetters" :key="item" class="w-full">
                <ZendleLetter
                    :id="'letter-' + item"
                    @letter-tap="
                        () => {
                            $emit('letterTap', item)
                            simulatePress('letter-' + item)
                        }
                    "
                    :letter="item"
                />
            </div>
            <ZendleLetter
                id="letter-backspace"
                @letter-tap="
                    () => {
                        $emit('letterTap', 'BACKSPACE')
                        simulatePress('letter-backspace')
                    }
                "
                letterClass="material-symbols-outlined"
                letter="backspace"
            />
        </div>
    </div>
</template>
