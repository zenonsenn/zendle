<script setup lang="ts">
const props = defineProps({
    letter: String,
    letterClass: {
        type: [String, null],
    },
})

const renderedClass = 'flex h-13 sm:h-16 items-center justify-center font-bold ' + props.letterClass
const letterClassNotNull = props.letterClass == null
</script>

<template>
    <div class="w-full rounded-lg bg-gray-300 text-lg sm:text-xl">
        <div
            @click="$emit('letterTap', props.letter)"
            id="content"
            :class="renderedClass"
            v-if="letterClassNotNull"
        >
            {{ props.letter }}
        </div>
        <div
            @click="$emit('letterTap', props.letter)"
            id="content"
            :class="renderedClass + ' w-full'"
            v-else
        >
            <div class="flex h-full items-center justify-center">{{ props.letter }}</div>
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
</style>
