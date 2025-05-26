<script setup lang="ts">
import ZendleKeyboard from '@/components/ZendleKeyboard.vue'

const displayModal = () => {
    document.getElementById('cookies-modal')?.classList.remove('hidden')
    document.getElementById('cookies-modal')?.classList.add('flex')
    setTimeout(() => {
        document.getElementById('cookies-modal')?.classList.remove('flex')
        document.getElementById('cookies-modal')?.classList.add('hidden')
    }, 3000)
}
</script>

<template>
    <div class="bg-calm-grey font-inter">
        <div id="cookies-modal" class="absolute top-4 hidden w-full items-center justify-center">
            <div class="rounded-lg bg-gray-300 p-3">
                Cookies contain your best score; that's it.
            </div>
        </div>
        <div class="flex h-screen w-full flex-col">
            <!-- Screen -->
            <div class="flex h-full w-full items-center justify-center">
                <!-- Content -->
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
