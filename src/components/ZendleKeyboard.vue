<script setup lang="ts">
import ZendleLetter from '@/components/ZendleLetter.vue'
</script>

<template>
    <div class="flex w-fit flex-col gap-y-2 p-4 sm:gap-y-3 sm:px-0 sm:py-4">
        <div class="flex flex-row justify-between gap-x-1 sm:gap-x-2">
            <ZendleLetter @letter-tap="$emit('letterTap', 'Q')" letter="Q" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'W')" letter="W" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'E')" letter="E" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'R')" letter="R" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'T')" letter="T" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'Y')" letter="Y" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'U')" letter="U" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'I')" letter="I" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'O')" letter="O" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'P')" letter="P" />
        </div>
        <div class="flex flex-row justify-between gap-x-1 px-4 sm:gap-x-2">
            <ZendleLetter @letter-tap="$emit('letterTap', 'A')" letter="A" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'S')" letter="S" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'D')" letter="D" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'F')" letter="F" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'G')" letter="G" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'H')" letter="H" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'J')" letter="J" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'K')" letter="K" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'L')" letter="L" />
        </div>
        <div class="flex flex-row justify-between gap-x-1 sm:gap-x-2">
            <ZendleLetter
                @letter-tap="$emit('letterTap', 'ENTER')"
                letterClass="material-symbols-outlined"
                letter="subdirectory_arrow_right"
            />
            <ZendleLetter @letter-tap="$emit('letterTap', 'Z')" letter="Z" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'X')" letter="X" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'C')" letter="C" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'V')" letter="V" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'B')" letter="B" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'N')" letter="N" />
            <ZendleLetter @letter-tap="$emit('letterTap', 'M')" letter="M" />
            <ZendleLetter
                @letter-tap="$emit('letterTap', 'BACKSPACE')"
                letterClass="material-symbols-outlined"
                letter="backspace"
            />
        </div>
    </div>
</template>
