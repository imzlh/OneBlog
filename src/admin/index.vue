<script lang="tsx" setup>
import { computed } from 'vue';
import { Post } from '../utils/post';
import { useRoute } from 'vue-router';

import { config } from '../../package.json';

import './icon.css';
import Posts from './posts.vue';
import Comments from './comments.vue';
import Setting from './setting.vue';
import Post2 from './write-post.vue';

function getWelcome() {
    const hour = new Date().getHours();
    switch (true) {
        case 22 <= hour || hour < 4:
            return "凌晨好！快去睡个觉活力下一天吧";
        case 4 <= hour && hour < 6:
            return "晚上好！写一篇blog记录生活吧";
        case 6 <= hour && hour < 12:
            return "早上好！又是活力满满的每一天";
        case 12 <= hour && hour < 18:
            return "下午好！工作顺利，继续加油吧";
        case 18 <= hour && hour < 22:
            return "晚上好！依旧活力满满的每一天";
    }
}

const totalPost = Post.get_all().array.length,
    totalComment = 0;   // TODO: get total comment count

const $route = useRoute();
const realpage = computed(() => {
    const route = $route.params.page;
    switch (route) {
        case 'post':
            return Post2;
        case 'comment':
            return Comments;
        case 'posts':
            return Posts;
        case 'setting':
            return Setting;
        default:
            return undefined;
    }
})
</script>

<template>
    <div class="admin-container" v-if="config.admin">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
            <router-link to="/admin/index" class="breadcrumb-item">
                <svg class="breadcrumb-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                OneBlog 管理后台
            </router-link>
        </div>

        <!-- 主要内容区域 -->
        <div class="dashboard-container" v-if="!realpage">
            <!-- 欢迎区域 -->
            <div class="welcome-section">
                <div class="welcome-content">
                    <h1 class="welcome-title">{{ getWelcome() }}</h1>
                    <p class="welcome-subtitle">管理您的博客内容，创造精彩故事</p>
                </div>
                <div class="welcome-decoration">
                    <div class="decoration-circle"></div>
                    <div class="decoration-circle"></div>
                    <div class="decoration-circle"></div>
                </div>
            </div>

            <!-- 统计卡片 -->
            <div class="stats-grid">
                <router-link to="/admin/posts" class="stat-card">
                    <div class="stat-icon">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
                        </svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ totalPost }}</div>
                        <div class="stat-label">文章总数</div>
                    </div>
                    <div class="stat-arrow">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                        </svg>
                    </div>
                </router-link>

                <router-link to="/admin/comment" class="stat-card">
                    <div class="stat-icon">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
                        </svg>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ totalComment }}</div>
                        <div class="stat-label">评论总数</div>
                    </div>
                    <div class="stat-arrow">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                        </svg>
                    </div>
                </router-link>
            </div>

            <!-- 快捷操作 -->
            <div class="actions-section">
                <h2 class="section-title">快捷操作</h2>
                <div class="actions-grid">
                    <router-link to="/admin/post" class="action-card primary">
                        <div class="action-icon">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                            </svg>
                        </div>
                        <div class="action-content">
                            <h3>写文章</h3>
                            <p>创作新的博客内容</p>
                        </div>
                    </router-link>

                    <router-link to="/admin/posts" class="action-card">
                        <div class="action-icon">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fill-rule="evenodd"
                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                            </svg>
                        </div>
                        <div class="action-content">
                            <h3>管理文章</h3>
                            <p>编辑和组织您的文章</p>
                        </div>
                    </router-link>

                    <router-link to="/admin/comment" class="action-card">
                        <div class="action-icon">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                            </svg>
                        </div>
                        <div class="action-content">
                            <h3>管理评论</h3>
                            <p>审核和回复读者评论</p>
                        </div>
                    </router-link>

                    <router-link to="/admin/setting" class="action-card">
                        <div class="action-icon">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                            </svg>
                        </div>
                        <div class="action-content">
                            <h3>设置</h3>
                            <p>配置博客系统选项</p>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>

        <!-- 子页面内容 -->
        <div class="page-content" v-else>
            <component :is="realpage"></component>
        </div>
    </div>

    <!-- 未启用管理后台提示 -->
    <div class="admin-disabled" v-else>
        <div class="disabled-content">
            <svg class="disabled-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
            </svg>
            <h1>管理后台未启用</h1>
            <p>请在 <code>package.json</code> 中配置 <code>"admin": true</code> 来启用管理功能</p>
        </div>
    </div>
</template>

<style lang="scss">
.admin-container {
    max-width: 60rem;
    margin: auto;

    // 面包屑导航
    .breadcrumb {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem 1.5rem;

        .breadcrumb-item {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            color: #6b7280;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s ease;

            &:hover {
                color: #4f46e5;
            }

            .breadcrumb-icon {
                width: 1rem;
                height: 1rem;
            }
        }
    }

    // 仪表盘容器
    .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem 3rem;

        @media (max-width: 768px) {
            padding: 0 1rem 2rem;
        }
    }

    // 欢迎区域
    .welcome-section {
        background: linear-gradient(135deg, #e7ebff 0%, #ac8dcb 100%);
        border-radius: 1rem;
        padding: 3rem 2rem;
        margin-bottom: 2rem;
        position: relative;
        overflow: hidden;
        color: white;

        @media (max-width: 768px) {
            padding: 2rem 1.5rem;
            text-align: center;
        }

        .welcome-content {
            position: relative;
            z-index: 2;

            .welcome-title {
                font-size: 2.5rem;
                font-weight: 700;
                margin: 0 0 0.5rem 0;
                line-height: 1.2;

                @media (max-width: 768px) {
                    font-size: 2rem;
                }
            }

            .welcome-subtitle {
                font-size: 1.1rem;
                opacity: 0.9;
                margin: 0;
                font-weight: 400;
            }
        }

        .welcome-decoration {
            position: absolute;
            right: 2rem;
            top: 50%;
            transform: translateY(-50%);

            @media (max-width: 768px) {
                display: none;
            }

            .decoration-circle {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                position: absolute;

                &:nth-child(1) {
                    animation: float 6s ease-in-out infinite;
                }

                &:nth-child(2) {
                    width: 80px;
                    height: 80px;
                    top: 20px;
                    right: 40px;
                    animation: float 4s ease-in-out infinite reverse;
                }

                &:nth-child(3) {
                    width: 40px;
                    height: 40px;
                    top: -10px;
                    right: -10px;
                    animation: float 5s ease-in-out infinite;
                }
            }
        }
    }

    @keyframes float {

        0%,
        100% {
            transform: translateY(0px) rotate(0deg);
        }

        50% {
            transform: translateY(-10px) rotate(5deg);
        }
    }

    // 统计卡片
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;

        @media (max-width: 640px) {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }

    .stat-card {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        text-decoration: none;
        color: inherit;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 1px solid #f3f4f6;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
            border-color: #e5e7eb;
        }

        .stat-icon {
            width: 3rem;
            height: 3rem;
            background: linear-gradient(210deg, #b1b4c2 0%, #e9ebc4 100%);
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            svg {
                width: 1.5rem;
                height: 1.5rem;
                color: white;
            }
        }

        .stat-content {
            flex: 1;

            .stat-number {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                line-height: 1;
                margin-bottom: 0.25rem;
            }

            .stat-label {
                font-size: 0.9rem;
                color: #6b7280;
                font-weight: 500;
            }
        }

        .stat-arrow {
            width: 1.25rem;
            height: 1.25rem;
            color: #9ca3af;
            flex-shrink: 0;
            transition: transform 0.2s ease;

            svg {
                width: 100%;
                height: 100%;
            }
        }

        &:hover .stat-arrow {
            transform: translateX(2px);
            color: #6b7280;
        }
    }

    // 操作区域
    .actions-section {
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 1.5rem 0;
        }
    }

    .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;

        @media (max-width: 640px) {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }

    .action-card {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        text-decoration: none;
        color: inherit;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 1px solid #f3f4f6;
        transition: all 0.3s ease;
        display: flex;
        align-items: flex-start;
        gap: 1rem;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }

        &.primary {
            background: linear-gradient(49deg, #d1ffd5 0%, #cbe5ed 100%);
            color: white;

            .action-icon {
                background: rgba(255, 255, 255, 0.2);

                svg {
                    color: white;
                }
            }

            h3 {
                color: white;
            }

            p {
                color: rgba(255, 255, 255, 0.9);
            }
        }

        .action-icon {
            width: 3rem;
            height: 3rem;
            background: #f3f4f6;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            svg {
                width: 1.5rem;
                height: 1.5rem;
                color: #6b7280;
            }
        }

        .action-content {
            flex: 1;

            h3 {
                font-size: 1.125rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 0.25rem 0;
            }

            p {
                font-size: 0.9rem;
                color: #6b7280;
                margin: 0;
                line-height: 1.4;
            }
        }
    }

    // 子页面内容
    .page-content {
        max-width: 55rem;
        margin: 0 auto;
        padding: 0 1.5rem 3rem;
        min-height: 100vh;
        position: relative;
        margin-bottom: 4rem;

        @media (max-width: 768px) {
            padding: 0 1rem 2rem;
        }
    }
}

// 未启用提示
.admin-disabled {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;

    .disabled-content {
        text-align: center;
        max-width: 400px;

        .disabled-icon {
            width: 4rem;
            height: 4rem;
            color: #dc2626;
            margin-bottom: 1rem;
        }

        h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.5rem 0;
        }

        p {
            color: #6b7280;
            margin: 0;
            line-height: 1.6;

            code {
                background: #f3f4f6;
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-size: 0.875rem;
                color: #dc2626;
                font-family: ui-monospace, 'SF Mono', monospace;
            }
        }
    }
}
</style>