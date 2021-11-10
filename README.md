# Fireblog using firebase & Vue 3 composition API

## Overview
The project is initially implemented by John Komarnicki "https://github.com/johnkomarnicki/FireBlogs-YouTube".

Since the project was built in Vue 2, the related libraries stopped supporting Vue 2 and gradually moved to Vue 3.
In August, I upgraded the options API to Vue 3 and refactored the codebase into personal use blog. 
Currently, the project moves to the composition API, which seamlessly improves the overall readability and maintainability.
The project is still ongoing the refactor and debugging process as you might see some options API and bugs show up in some views or components.

## What are the differences?
- Using Vue 3 composition API with Vuex and Vue-router.
- Disregarding the admin tab and its functionality.
- Only the specific, unique registered email user can create a post. Visitors can only read the posts.
- Optimize the logic when creating a new post; compress the image before uploading to firebase.
- Organize the states into sub-modules.
- Use the markdown editor and renderer.
- Slightly change the homepage layout.

## Future plans
I've been learning Vue 3 for a while, but it could be hard to look up specific components within a view. Further, when uploading
high-resolution preview pictures, the website responds slowly. Therefore, the future goals:
1. I will incorporate Typescript, the prevalent language for better development collaboration, debugging, and maintenance.
2. Lazy loading the Vuex store, improving the overall latency issue.
3. Start implementing the unit tests for ensuring the code quality.
4. I'll re-organize the folder structure that the components are under the related view. The re-usable or utility components will still be in the same folder in src/components.

## To use the project
- npm install -> install the tools and dependencies according to package.json.
- apply a firebase key to be used in src/firebase/firebaseInit.js
- register an account with an email for being an admin. See `App.vue` for how it works.
- npm run server -> start the application in localhost.

## Special thanks
Appreciate John and Traversy Media giving the code and tutorial for free.
The [tutorial](https://www.youtube.com/watch?v=ISv22NNL-aE&t=1s&ab_channel=TraversyMedia).

## The application
https://vuejs3-fireblog.web.app/