<script setup lang="ts">
import ZendleLetter from '@/components/ZendleLetter.vue'
</script>

<template>
    <div class="flex w-fit flex-col gap-y-2 p-4 sm:gap-y-3 sm:px-0 sm:py-4">
        <div class="flex flex-row justify-between gap-x-1 sm:gap-x-2">
            <ZendleLetter letter="Q" />
            <ZendleLetter letter="W" />
            <ZendleLetter letter="E" />
            <ZendleLetter letter="R" />
            <ZendleLetter letter="T" />
            <ZendleLetter letter="Y" />
            <ZendleLetter letter="U" />
            <ZendleLetter letter="I" />
            <ZendleLetter letter="O" />
            <ZendleLetter letter="P" />
        </div>
        <div class="flex flex-row justify-between gap-x-1 px-4 sm:gap-x-2">
            <ZendleLetter letter="A" />
            <ZendleLetter letter="S" />
            <ZendleLetter letter="D" />
            <ZendleLetter letter="F" />
            <ZendleLetter letter="G" />
            <ZendleLetter letter="H" />
            <ZendleLetter letter="J" />
            <ZendleLetter letter="K" />
            <ZendleLetter letter="L" />
        </div>
        <div class="flex flex-row justify-between gap-x-1 sm:gap-x-2">
            <ZendleLetter
                letterClass="material-symbols-outlined"
                letter="subdirectory_arrow_right"
            />
            <ZendleLetter letter="Z" />
            <ZendleLetter letter="X" />
            <ZendleLetter letter="C" />
            <ZendleLetter letter="V" />
            <ZendleLetter letter="B" />
            <ZendleLetter letter="N" />
            <ZendleLetter letter="M" />
            <ZendleLetter letterClass="material-symbols-outlined" letter="backspace" />
        </div>
    </div>
</template>
