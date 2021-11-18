<template>
  <div class="app-wrapper">
    <!-- provide the router view only if posts are loaded -->
    <div class="app" v-if="postLoaded">
      <Navigation :user_login="user_login" :admin="admin" />
        <router-view />
      <Footer v-if="!user_login" />
    </div>
  </div>
</template>

<script>
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ref, onMounted, computed, inject } from "vue";
// import { useStore } from 'vuex'
import firebase from "firebase/app"; // for using the firebase namespace
import "firebase/auth"; // for initilize the auth() as a function -> reference: https://stackoverflow.com/questions/48592656/firebase-auth-is-not-a-function
export default {
  name: "app",
  components: {
    Navigation,
    Footer,
  },
  setup() {
    // composition api, useStore with vuex
    const store = inject('store')
    // composition api, use ref
    const user_login = ref(null);
    const admin = ref(null);
    // dispatched, or committed method from store
    const getCurrentUser = () => {
      return store.dispatch('users/getCurrentUser')
    }
    const mountUser = (user) => {
      return store.dispatch('users/mountUser', user)
    }
    const getPost = () => {
      return store.dispatch('posts/getPost')
    }
    // the functions used in this view
    /**
     * The function check if any user logged in
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
          console.log("The user signed in!");
          user = mountUser(user);
          getCurrentUser();
          user_login.value = true;
        } else {
          user_login.value = false;
          console.log("There is no user using right now");
        }
      });
    }
    // at setup phase, get the posts before mounting; otherwise, looks slow
    getPost();
    // define the behaviors of the view
    // mount the user
    onMounted(() => {
      checkUserState();
    });
    // the return here returns the functions that are used in the template
    return {
      profileEmail: computed(() => store.getters['users/profileEmail']),
      postLoaded: computed(() => store.getters['posts/postLoaded']),
      user_login, admin,
    };
  },
  watch: {
    user_login(val) {
      console.log(`The user_login value is changed to ${val}`);
      this.user_login = val;
    },
    admin(val) {
      console.log(`The admin value is changed to ${val}`);
      this.admin = val;
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap");
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Quicksand", sans-serif;
}
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.container {
  max-width: 1440px;
  margin: 0 auto;
}
.link {
  cursor: pointer;
  text-decoration: none;
  text-transform: uppercase;
  color: black;
}
.link-light {
  color: #fff;
}
.arrow {
  margin-left: 8px;
  width: 12px;
  path {
    fill: #000;
  }
}
.arrow-light {
  margin-left: 8px;
  width: 12px;
  path {
    fill: currentColor;
  }
  // since using svg as img, cannot fill the color with path
  // customed color: https://bit.ly/3io6iI5
  filter: invert(1);
}
button,
.router-button {
  transition: 500ms ease all;
  cursor: pointer;
  margin-top: 24px;
  padding: 12px 24px;
  background-color: #303030;
  color: #fff;
  border-radius: 20px;
  border: none;
  text-transform: uppercase;
  &:focus {
    outline: none;
  }
  &:hover {
    background-color: rgba(48, 48, 48, 0.7);
  }
}
.button-ghost {
  color: #000;
  padding: 0;
  border-radius: 0;
  margin-top: 50px;
  font-size: 15px;
  font-weight: 500;
  background-color: transparent;
  @media (min-width: 700px) {
    margin-top: 0;
    margin-left: auto;
  }
  i {
    margin-left: 8px;
  }
}
.button-light {
  background-color: transparent;
  border: 2px solid #fff;
  color: #fff;
}
.button-inactive {
  pointer-events: none !important;
  cursor: none !important;
  background-color: rgba(128, 128, 128, 0.5) !important;
}
.error {
  text-align: center;
  font-size: 12px;
  color: red;
}
.blog-card-wrap {
  position: relative;
  padding: 80px 16px;
  background-color: #f1f1f1;
  @media (min-width: 500px) {
    padding: 100px 16px;
  }
  .blog-cards {
    display: grid;
    gap: 32px;
    grid-template-columns: 1fr;
    @media (min-width: 500px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 900px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (min-width: 1200px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>
