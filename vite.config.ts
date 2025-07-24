import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue()
    ],
    build: {
        target: 'es2020',
        rollupOptions: {
            output: {
                manualChunks(id){
                    if(id.includes('/prism-')){
                        return 'prism'; // 防止access before initialization
                    }else if(id.includes('/@muyajs/')){
                        return 'muya';
                    }else if(id.includes('/src/admin/')){
                        return 'admin';
                    }else{
                        return 'app';
                    }
                }
            }
        }
    }
})
