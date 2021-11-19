# vuejs-fireblog

## The file structure preference (make the components inside the parent component)
https://stackoverflow.com/questions/61782533/vue-js-naming-conventions-children-of-single-instance-components

## import { ref } from "vue"
- the ref is a reactive property that can be used to access the value of the property.
- originally, used with data() block to return a value to the component.
- the `ref` in template can be referenced by ref from "vue"
  - `<div ref="src"></div>`
  - `setup() { const src=ref() return { src } }`

## Regarding Vuex with composition API
- the state is not accessible; only the getters can access the data.
  - the getters should be like `store.getters["module/SomeGetter"]`
- use "dispatch" to get the actions; use "commit" to get the mutations.
  - `store.dispatch("module/action")`
  - `store.commit("module/mutation")`
- remember the arguments when dispatching or committing functions.
  - `store.dispatch("module/action", id)`
  - `store.commit("module/mutation", id)`
- the computed properties cannot be reassigned.

## Deployment
- if deployed from the beginning, `npx firebase init`
  - select the option `hosting` and without Github auto-deployment.
  - select `dist` as the target folder to deploy.
- `npm run build`  -> bundle the project into the `dist` folder.
- `npx firebase deploy`

## Testing
- using `vue-jest`, `unit-jest`
- use `npm run test:unit --verbose -- --watchAll` to keep watching the testing changes.
- how to deal with the components that use store, which is not recognized by the testing?