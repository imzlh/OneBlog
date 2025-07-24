<style>
    .loader-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 60vh;
        margin: 0;
        font-family: Arial, sans-serif;
    }

    .loader {
        width: 60px;
        height: 60px;
        position: relative;
    }

    .loader-inner {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 5px solid transparent;
        border-top-color: #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loader-inner:nth-child(1) {
        animation-delay: 0.2s;
        border-top-color: #e74c3c;
    }

    .loader-inner:nth-child(2) {
        animation-delay: 0.4s;
        border-top-color: #2ecc71;
    }

    .loader-inner:nth-child(3) {
        animation-delay: 0.6s;
        border-top-color: #f1c40f;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    .loading-text {
        margin-top: 20px;
        text-align: center;
        color: #333;
        font-size: 18px;
    }
</style>
<template>
    <div class="loader-container">
        <div class="loader">
            <div class="loader-inner"></div>
            <div class="loader-inner"></div>
            <div class="loader-inner"></div>
        </div>
        <div class="loading-text">加载中...</div>
    </div>
</template>
