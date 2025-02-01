<script setup lang="ts">
    import { defineProps } from 'vue';

    const props = defineProps<{
        code: number;
        reason: string;
        handle?: () => void;
    }>();
</script>

<template>
    <div class="area">
        <div class="error-page">
            <h1>{{ props.code }}</h1>
            <p v-html="props.reason"></p>
            <button v-if="handle" @click="handle">Go Back</button>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .area{
        height: 100vh;
        height: 100svh;
        position: relative;
    }

    .error-page {
        text-align: center;

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        
        @keyframes hue {
            from {
                -webkit-filter: hue-rotate(0deg);
            }to {
                -webkit-filter: hue-rotate(-360deg);
            }
        }

        h1 {
            font-size: 8rem;
            // 渐变色
            background: linear-gradient(45deg, #007bff, #00c853);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
            animation: hue 30s infinite linear;
            font-weight: 600;
            margin: 0;
            font-family: 'Repair';
            letter-spacing: .5rem;
            user-select: none;
        }

        p {
            font-size: 1rem;
            color: rgb(105, 100, 100);
            margin: 0;
        }

        button {
            padding: 0.5rem 1.5rem;
            letter-spacing: 0.05rem;
            cursor: pointer;
            color: gray;
            border: solid 0.1rem rgb(181, 169, 169);
            border-radius: 3rem;
            transition: all 0.3s ease;
            margin-top: 2rem;
            background: none;

            &:hover {
                background-color: rgb(181, 169, 169);
                color: white;
            }
        }
    }
</style>