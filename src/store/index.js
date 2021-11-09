import { createStore, createLogger } from "vuex";
import users from "./modules/users";
import posts from "./modules/posts";
// Create store
// it's different from the tutorial in 2019
// https://stackoverflow.com/questions/66516327/vue-3-how-to-use-vuex-modules

const debug = process.env.NODE_ENV !== "production";

const store = createStore({
  modules: {
    users,
    posts,
    // put the modules for each specific item state management
    // the state, mutations, actions would be written in the module/sth.js
  },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});

export default store;
