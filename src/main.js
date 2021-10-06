import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { sync } from 'vuex-router-sync'
// find a alternative for vue2-editor
// the vue2-editor is used for the blog content modification
import db from "./firebase/firebaseInit"; // the configuration data
import firebase from "firebase/app"; // for using the firebase services (web only)
import "firebase/auth"; // for using the auth()
import "firebase/firestore"; // for accessing the firestore; otherwise default app cannot initialized

// the markdown text editor, with instant preview
import VMdEditor from "@kangc/v-md-editor/lib/codemirror-editor";
import "@kangc/v-md-editor/lib/style/codemirror-editor.css";
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";

// Resources for the codemirror editor
import Codemirror from "codemirror";
// mode
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/vue/vue";
// edit
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/matchbrackets";
// placeholder
import "codemirror/addon/display/placeholder";
// active-line
import "codemirror/addon/selection/active-line";
// scrollbar
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
// style
import "codemirror/lib/codemirror.css";
// language
import enUS from "@kangc/v-md-editor/lib/lang/en-US";

VMdEditor.Codemirror = Codemirror;
VMdEditor.use(githubTheme);
VMdEditor.lang.use("en-US", enUS);

// puzzle here..
// don't know how it works, but it works
// console.log("<1> try to print the apps.length to see if firebase activated")
if (firebase.apps.length > 0 && db) {
  console.log("The firebase activated");
} else {
  console.log("The firebase failed");
}

// console.log("<2> No matter what, create the vue app")
// reference: https://www.npmjs.com/package/vuex-router-sync
sync(store, router)
createApp(App).use(VMdEditor).use(router).use(store).mount("#app");
