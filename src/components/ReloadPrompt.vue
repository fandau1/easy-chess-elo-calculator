<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

async function close() {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div v-if="offlineReady || needRefresh" class="pwa-toast" role="alert">
    <div class="message">
      <span v-if="offlineReady">
        Aplikace je připravena pro offline použití
      </span>
      <span v-else>
        Nová verze aplikace je k dispozici
      </span>
    </div>
    <div class="buttons">
      <button v-if="needRefresh" @click="updateServiceWorker()">
        Aktualizovat
      </button>
      <button @click="close">
        Zavřít
      </button>
    </div>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #2a2a2a;
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 90%;
  width: 400px;
  border: 2px solid #4a4a4a;
}

.message {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.4;
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.buttons button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.buttons button:first-child {
  background: #4ade80;
  color: #000;
}

.buttons button:first-child:hover {
  background: #22c55e;
}

.buttons button:last-child {
  background: #666;
  color: white;
}

.buttons button:last-child:hover {
  background: #888;
}

@media (max-width: 480px) {
  .pwa-toast {
    width: calc(100% - 40px);
    bottom: 10px;
  }
}
</style>
