<template>
  <header>
    <nav class="container">
      <div class="branding">
        <router-link class="header" :to="{ name: 'Home' }"
          >FireBlogs</router-link
        >
      </div>
      <div class="nav-links">
        <ul v-show="!mobile">
          <router-link class="link" :to="{ name: 'Home' }">Home</router-link>
          <router-link class="link" :to="{ name: 'Blogs' }">Blogs</router-link>
          <router-link
            v-if="user_login && admin"
            class="link"
            :to="{ name: 'CreatePost' }"
            >Create Post
          </router-link>
          <router-link v-if="!user_login" class="link" :to="{ name: 'Login' }"
            >Login/Register
          </router-link>
        </ul>
        <div
          v-if="user"
          @click="toggleProfileMenu"
          class="profile"
          ref="profile"
        >
          <span>{{ profileInitials }}</span>
          <div v-show="profileMenu" class="profile-menu">
            <div class="info">
              <!-- directly access the global store/state/users -->
              <p class="initials">{{ profileInitials }}</p>
              <div class="right">
                <p>{{ profileFirstName }} {{ profileLastName }}</p>
                <p>{{ profileUsername }}</p>
                <p>{{ profileEmail }}</p>
              </div>
            </div>
            <div class="options">
              <div class="option">
                <router-link class="option" :to="{ name: 'Profile' }">
                  <img
                    class="icon"
                    src="@/assets/Icons/user-alt-light.svg"
                    alt=""
                  />
                  <p>Profile</p>
                </router-link>
              </div>
              <div @click="signOut" class="option">
                <img
                  class="icon"
                  src="@/assets/Icons/sign-out-alt-regular.svg"
                  alt=""
                />
                <p>Sign Out</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <!-- use file-loader to deal with svg file -->
    <!-- vue-cli-plugin-svg @see https://www.npmjs.com/package/vue-cli-plugin-svg-vue3 -->
    <img
      @click="toggleMobileNav"
      v-show="mobile"
      src="@/assets/Icons/bars-regular.svg"
      alt=""
      class="menu-icon"
    />
    <transition name="mobile-nav">
      <ul class="mobile-nav" v-show="mobileNav">
        <router-link class="link" :to="{ name: 'Home' }">Home</router-link>
        <router-link class="link" :to="{ name: 'Blogs' }">Blogs</router-link>
        <router-link
          v-if="user_login && admin"
          class="link"
          :to="{ name: 'CreatePost' }"
          >Create Post</router-link
        >
        <router-link v-if="!user_login" class="link" :to="{ name: 'Login' }"
          >Login/Register</router-link
        >
      </ul>
    </transition>
  </header>
</template>

<script>
import { useStore } from "vuex";
import { ref, computed } from "vue";
import firebase from "firebase/app"; // for using the firebase namespace
import "firebase/auth"; // for initilize the auth() as a function -> reference: https://stackoverflow.com/questions/48592656/firebase-auth-is-not-a-function
export default {
  name: "Navigation",
  setup() {
    // get the store
    const store = useStore();

    // the variables for adjusting the responsiiveness
    const profileMenu = ref(false);
    const mobile = ref(null); // true ? 'show icon' : '' -> can toggle mobileNav
    const mobileNav = ref(null);
    const windowWidth = ref(window.innerWidth);

    // variable for rendering the profile
    const profile = ref(null);

    /**
     * Check the the screen width to adjust the responsiiveness layout
     */
    function checkScreen() {
      if (windowWidth.value <= 750) {
        mobile.value = true; // for toggling mobile responsiveness and navigation
        return;
      }
      mobile.value = false;
      mobileNav.value = false;
      return;
    }

    /**
     * Toggle the boolean value to dynamically adjust the responsiiveness navigation layout
     */
    function toggleMobileNav() {
      mobileNav.value = !mobileNav.value;
    }

    /**
     * get the initials of the user with dropdown menu
     */
    function toggleProfileMenu(e) {
      if (e.target === profile.value) {
        profileMenu.value = !profileMenu.value;
      }
    }

    /**
     * Sign out the user and reload the application
     */
    function signOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("The user safely log out");
          // alert("Hope to see you again")
        });
      window.location.reload();
    }

    window.addEventListener("resize", () => {
      checkScreen();
    });

    return {
      // store states
      user: computed(() => store.getters["users/user"]),
      profileInitials: computed(() => store.getters["users/profileInitials"]),
      profileFirstName: computed(() => store.getters["users/profileFirstName"]),
      profileLastName: computed(() => store.getters["users/profileLastName"]),
      profileUsername: computed(() => store.getters["users/profileUsername"]),
      profileEmail: computed(() => store.getters["users/profileEmail"]),
      profileMenu,
      profile,
      mobile,
      mobileNav,
      windowWidth, // variables
      toggleProfileMenu,
      toggleMobileNav,
      signOut, // functions
    };
  },
  props: {
    user_login: {
      type: Boolean,
    },
    admin: {
      type: Boolean,
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  background-color: #fff;
  padding: 0 1% 0 1%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 99;
  .link {
    font-weight: 500;
    padding: 0 8px;
    transition: 0.3s color ease;
    &:hover {
      color: #1eb8b8;
    }
  }
  nav {
    display: flex;
    padding: 25px 5%;
    .branding {
      display: flex;
      align-items: center;
      .header {
        font-weight: 600;
        font-size: 24px;
        color: #000;
        text-decoration: none;
      }
    }
    .nav-links {
      position: relative;
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: flex-end;

      ul {
        margin-right: 30px;

        .link {
          margin-right: 32px;
        }

        .link:last-child {
          margin-right: 0;
        }
      }
      .profile {
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        color: #fff;
        background-color: #303030;
        span {
          pointer-events: none;
        }
        .profile-menu {
          position: absolute;
          top: 60px;
          right: 0;
          width: 250px;
          background-color: #303030;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          .info {
            display: flex;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #fff;
            .initials {
              position: initial;
              width: 40px;
              height: 40px;
              background-color: #fff;
              color: #303030;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
            }
            .right {
              flex: 1;
              margin-left: 24px;
              p:nth-child(1) {
                font-size: 14px;
              }
              p:nth-child(2),
              p:nth-child(3) {
                font-size: 12px;
              }
            }
          }
          .options {
            padding: 15px;
            .option {
              text-decoration: none;
              color: #fff;
              display: flex;
              align-items: center;
              margin-bottom: 12px;
              .icon {
                width: 18px;
                height: auto;
              }
              p {
                font-size: 14px;
                margin-left: 12px;
              }
              &:last-child {
                margin-bottom: 0px;
              }
            }
          }
        }
      }
    }
  }

  .menu-icon {
    cursor: pointer;
    position: absolute;
    top: 32px;
    right: 25px;
    height: 25px;
    width: auto;
  }

  .mobile-nav {
    padding: 20px;
    width: 70%;
    max-width: 250px;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100%;
    background-color: #303030;
    top: 0;
    left: 0;
    .link {
      padding: 15px 0;
      color: #fff;
    }
  }
  // apply all transition properties
  .mobile-nav-enter-active,
  .mobile-nav-leave-active {
    transition: all 1s ease;
  }
  // when entering, tranlate X -250 pixels to 0 pixel
  .mobile-nav-enter {
    transform: translateX(-250px);
  }

  .mobile-nav-enter-to {
    transform: translateX(0);
  }
  // when screen gets larger
  // or toggle to leave -> "leave to" the neagtive position, which cannot be seen on screen
  .mobile-nav-leave-to {
    transform: translateX(-250px);
  }
}
</style>
