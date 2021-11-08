<template>
  <div class="form-wrap">
    <form class="register">
      <p class="login-register">
        Already have an account?
        <router-link class="router-link" :to="{ name: 'Login' }"
          >Login</router-link
        >
      </p>
      <h2>Create Your FireBlog Account</h2>
      <div class="inputs">
        <div class="input">
          <input type="text" placeholder="First Name" v-model="firstName" />
          <img class="icon" src="@/assets/Icons/user-alt-light.svg" alt="" />
        </div>
        <div class="input">
          <input type="text" placeholder="Last Name" v-model="lastName" />
          <img class="icon" src="@/assets/Icons/user-alt-light.svg" alt="" />
        </div>
        <div class="input">
          <input type="text" placeholder="Username" v-model="username" />
          <img class="icon" src="@/assets/Icons/user-alt-light.svg" alt="" />
        </div>
        <div class="input">
          <input type="text" placeholder="Email" v-model="email" />
          <img class="icon" src="@/assets/Icons/envelope-regular.svg" alt="" />
        </div>
        <div class="input">
          <input type="password" placeholder="Password" v-model="password" />
          <img class="icon" src="@/assets/Icons/lock-alt-solid.svg" alt="" />
        </div>
        <div class="error" v-show="error">{{ errorMsg }}</div>
      </div>
      <button @click.prevent="register">Sign Up</button>
      <div class="angle"></div>
    </form>
    <div class="background"></div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import db from "../firebase/firebaseInit";

export default {
  name: "Register",
  data() {
    return {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      error: null,
      errorMsg: "",
    };
  },
  methods: {
    async register() {
      if (
        this.email !== "" &&
        this.password !== "" &&
        this.firstName !== "" &&
        this.lastName !== "" &&
        this.username !== ""
      ) {
        this.error = false;
        this.errorMsg = "";
        const createUser = await firebase
                            .auth()
                            .createUserWithEmailAndPassword(this.email, this.password);
        const result = await createUser;
        const dataBase = db.collection("users").doc(result.user.uid);
        // create the schema here
        await dataBase.set({
          firstName: this.firstName,
          lastName: this.lastName,
          username: this.username,
          email: this.email,
          uid: result.user.uid,
        });
        // here changes to this.$router.push to the named route
        this.$router.push({ name: "Home" });
        return;
      }
      this.error = true;
      this.errorMsg = "Please fill out all the fields";
    },
  },
};
</script>

<style lang="scss" scoped>
.register {
  h2 {
    max-width: 350px;
  }
}
</style>
