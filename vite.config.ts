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
                    if(id.includes('/src/admin/')){
                        return 'admin';
                    }else{
                        return 'app';
                    }
                }
            }
        }
    }
})
