<script setup lang="ts">
import GameView from '@/views/GameView.vue'
</script>

<template>
    <Suspense>
        <GameView />
        <template #fallback>
            <!-- Loading icon -->
            <div class="flex h-screen w-full items-center justify-center bg-calm-grey">
                <div class="h-12 w-12 animate-loading bg-zendle-orange"></div>
            </div>
        </template>
    </Suspense>
</template>
