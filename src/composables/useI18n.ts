import { useI18n as vueUseI18n } from 'vue-i18n'
import type { MessageSchema } from '../i18n'

/**
 * Vlastní composable pro i18n s typovou bezpečností
 */
export function useI18n() {
  return vueUseI18n<{ message: MessageSchema }>()
}

