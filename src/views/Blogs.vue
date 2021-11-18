<template>
  <div class="blog-card-wrap">
    <div class="blog-cards container">
      <div class="toggle-edit" v-if="admin">
        <span>Toggle Editing Post</span>
        <input type="checkbox" autocomplete="off" @change="updEditPost" />
      </div>
      <BlogCards v-for="(card, index) in blogPosts" :card="card" :key="index" />
    </div>
  </div>
</template>

<script>
import BlogCards from "@/components/BlogCards";
// import { useStore } from "vuex";
import { onBeforeUnmount, computed, ref, onBeforeMount, inject } from "vue";
import firebase from "firebase/app"; // for using the firebase namespace
import "firebase/auth"; // for initilize the auth() as a function -> reference: https://stackoverflow.com/questions/48592656/firebase-auth-is-not-a-function


export default {
  name: "Blogs",
  components: {
    BlogCards,
  },
  setup() {
    // state management
    const store = inject('store');
    const editPost = computed(() => store.getters["posts/editPost"]);
    
    // actions
    const toggleEditPost = (edit) => {
      store.dispatch("posts/toggleEditPost", edit);
    };

    // varibles
    const edit = ref(null); // for toggle purpose
    const admin = ref(false);


    /**
     * According to the state, reassign the local edit boolean to toggle the edit mode
     */
    function updEditPost(edit) {
      edit.value = !editPost.value;
      console.log(edit.value);
      toggleEditPost(edit.value);
    }

     /**
     * The function check if the logged in user is admin or not
     */
    function checkUserState() {
      // offical recommended way to fire the methods after the user state changes
      // otherwise, could be null
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          let email = user.email
          // console.log(`The user email: ${email}`)
          // console.log(`The admin email: ${process.env.VUE_APP_ADMINEMAIL}`)
          email === process.env.VUE_APP_ADMINEMAIL ? admin.value = true : admin.value = false
        } else {
          admin.value = false
          console.log("There is no user using right now");
        }
      });
    }
    
    onBeforeMount(() => {
      checkUserState();
    });
    
    onBeforeUnmount(() => {
      // reset the state whenever leave the page
      toggleEditPost(false);
    });

    return {
      blogPosts: computed(() => store.getters["posts/blogPosts"]),
      editPost,
      edit,
      updEditPost,
      toggleEditPost,
      admin,
    };
  },
};
</script>

<style lang="scss" scoped>
.blog-cards {
  position: relative;
  .toggle-edit {
    display: flex;
    align-items: center;
    position: absolute;
    top: -70px;
    right: 0;
    span {
      margin-right: 16px;
    }
    input[type="checkbox"] {
      position: relative;
      border: none;
      -webkit-appearance: none;
      background: #fff;
      outline: none;
      width: 80px;
      height: 30px;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    input[type="checkbox"]:before {
      content: "";
      position: absolute;
      width: 30px;
      height: 30px;
      border-radius: 20px;
      top: 0;
      left: 0;
      background: #303030;
      transform: scale(1.1);
      transition: 750ms ease all;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    input:checked[type="checkbox"]:before {
      background: #fff;
      left: 52px;
    }
  }
}
</style>
