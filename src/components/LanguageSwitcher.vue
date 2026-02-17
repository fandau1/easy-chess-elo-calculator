<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale, SUPPORT_LOCALES, type SupportLocale } from '../i18n'

const { t, locale } = useI18n()

function changeLocale(newLocale: SupportLocale) {
  setLocale(newLocale)
}
</script>

<template>
  <div class="language-switcher">
    <label for="language-select">{{ t('language.select') }}:</label>
    <select
      id="language-select"
      :value="locale"
      @change="changeLocale(($event.target as HTMLSelectElement).value as SupportLocale)"
      class="language-select"
    >
      <option
        v-for="lang in SUPPORT_LOCALES"
        :key="lang"
        :value="lang"
      >
        {{ t(`language.${lang}`) }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

label {
  font-weight: 500;
  font-size: 0.9rem;
}

.language-select {
  padding: 0.4rem 0.8rem;
  border: 2px solid #ccc;
  border-radius: 6px;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.language-select:hover {
  border-color: #646cff;
}

.language-select:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}
</style>

