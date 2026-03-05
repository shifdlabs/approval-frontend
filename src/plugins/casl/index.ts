import type { App } from 'vue'

import type { Rule } from './ability'

export default function (app: App) {
  const userAbilityRules = useCookie<Rule[]>('userAbilityRules')
  // const initialAbility = createMongoAbility(userAbilityRules.value ?? [])

  // app.use(abilitiesPlugin, initialAbility, {
  //   useGlobalProperties: true,
  // })
}
