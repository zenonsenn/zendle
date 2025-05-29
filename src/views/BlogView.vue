<script setup lang="ts">
import { marked } from 'marked'
import { onMounted, ref } from 'vue'

const blogData = ref('')

onMounted(async () => {
    const url =
        'https://raw.githubusercontent.com/zenonsenn/zendle-blog/refs/heads/main/blog_content.md'
    try {
        await fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`)
                }
                return response.text()
            })
            .then((textData) => (blogData.value = textData))
            .then(async () => {
                const parsedData = await marked.parse(blogData.value)
                return parsedData
            })
            .then((parsedData) => {
                document.getElementById('content')!.innerHTML = parsedData
            })
    } catch {}
})
</script>

<template>
    <div>
        <div class="flex h-fit w-full items-center justify-center">
            <div
                class="m-4 mb-8 flex w-full max-w-[600px] flex-col items-center justify-center gap-y-4 sm:mx-0 sm:my-4 sm:mb-8"
            >
                <router-link
                    to="/"
                    class="sticky top-8 cursor-pointer rounded-lg bg-gray-300 p-1 hover:bg-zendle-orange"
                    >Back to the game!</router-link
                >
                <div id="content" class="text-wrap"></div>
            </div>
        </div>
    </div>
</template>
