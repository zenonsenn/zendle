<template>
    <RouterView v-slot="{ Component }">
        <template v-if="Component">
            <KeepAlive>
                <Suspense>
                    <!-- Main content -->
                    <component :is="Component"></component>

                    <!-- Loading state -->
                    <template #fallback>
                        <!-- Loading icon -->
                        <div class="flex h-screen w-full items-center justify-center">
                            <div class="h-12 w-12 animate-loading bg-zendle-orange"></div>
                        </div>
                    </template>
                </Suspense>
            </KeepAlive>
        </template>
    </RouterView>
</template>
