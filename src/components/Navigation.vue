// TODO: refactor to composition api
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
          <router-link v-if="user_login" class="link" :to="{ name: 'CreatePost' }">Create Post </router-link>
          <router-link v-if="!user_login" class="link" :to="{ name: 'Login' }">Login/Register </router-link>
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
        <router-link v-if="user_login" class="link" :to="{ name: 'CreatePost' }">Create Post</router-link
        >
        <router-link v-if="!user_login" class="link" :to="{ name: 'Login' }">Login/Register</router-link>
      </ul>
    </transition>
  </header>
</template>

<script>
import { mapState } from "vuex";
import firebase from "firebase/app"; // for using the firebase namespace
import "firebase/auth"; // for initilize the auth() as a function -> reference: https://stackoverflow.com/questions/48592656/firebase-auth-is-not-a-function
export default {
  name: "Navigation",
  components: {},
  data() {
    return {
      profileMenu: null,
      mobile: null, // true ? 'show icon' : '' -> can toggle mobileNav
      mobileNav: null,
      windowWidth: null,
    };
  },
  props: {
    user_login: {
      type: Boolean,
    },
  },
  created() {
    // when the screen size changes -> trigger the event -> call checkScreen
    window.addEventListener("resize", this.checkScreen);
    // the first time loading the app
    this.checkScreen();
  },
  computed: {
    ...mapState("users", [
      "user",
      "profileInitials",
      "profileFirstName",
      "profileLastName",
      "profileUsername",
      "profileEmail",
    ]),
  },
  methods: {
    checkScreen() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth <= 750) {
        this.mobile = true;
        return;
      }
      this.mobile = false;
      this.mobileNav = false;
      return;
    },
    toggleMobileNav() {
      this.mobileNav = !this.mobileNav;
    },
    toggleProfileMenu(e) {
      if (e.target === this.$refs.profile) {
        this.profileMenu = !this.profileMenu;
      }
    },
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("The user safely log out");
          // alert("Hope to see you again")
        });
      window.location.reload();
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  background-color: #fff;
  padding: 0 25px;
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
    padding: 25px 0;
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
