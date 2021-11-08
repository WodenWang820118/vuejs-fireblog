# vuejs-fireblog

## The file structure preference (make the components inside the parent component)
https://stackoverflow.com/questions/61782533/vue-js-naming-conventions-children-of-single-instance-components

## import { ref } from "vue"
- the ref is a reactive property that can be used to access the value of the property.
- originally, used with data() block to return a value to the component.

## Regarding Vuex with composition API
- the state is not accessible; only the getters can access the data.
- use "dispatch" to get the actions; use "commit" to get the mutations.
- remember the arguments when dispatching or committing functions.