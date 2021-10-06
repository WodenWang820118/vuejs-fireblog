<template>
  <div class="profile">
    <Modal
      v-if="modalActive"
      :modalMessage="modalMessage"
      @close-modal="closeModal"
    />
    <div class="container">
      <h2>Account Settings</h2>
      <div class="profile-info">
        <div class="initials">{{ profileInitials }}</div>
        <!-- <div class="admin-badge">
          <img class="icon" src="@/assets/Icons/user-crown-light.svg" alt="" />
          <span>admin</span>
        </div> -->
        <div class="input">
          <label for="firstName">First Name:</label>
          <!-- mutating computed property is not a good idea, although achievable -->
          <input
            disabled
            type="text"
            id="firstName"
            v-model="profileFirstName"
          />
        </div>
        <!-- separate the udpate data and computed property -->
        <div class="input">
          <label>New First Name:</label>
          <input type="text" v-model="wishedFirstName" />
        </div>
        <!-- label attribute "for" would bind the input id: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label -->
        <div class="input">
          <label for="lastName">Last Name:</label>
          <input disabled type="text" id="lastName" v-model="profileLastName" />
        </div>
        <div class="input">
          <label>New Last Name:</label>
          <input type="text" v-model="wishedLastName" />
        </div>
        <div class="input">
          <label for="username">Username:</label>
          <input disabled type="text" id="username" v-model="profileUsername" />
        </div>
        <div class="input">
          <label>New Username:</label>
          <input type="text" v-model="wishedUsername" />
        </div>
        <div class="input">
          <label for="email">Email:</label>
          <input disabled type="text" id="email" v-model="profileEmail" />
        </div>
        <button @click="updateProfile">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Modal from "@/components/Modal";
export default {
  name: "Profile",
  components: {
    Modal,
  },
  data() {
    return {
      modalMessage: "Changes were saved!",
      modalActive: null,
      wishedFirstName: "",
      wishedLastName: "",
      wishedUsername: "",
    };
  },
  methods: {
    ...mapActions("users", {
      updFirstName: "updFirstName",
      updLastName: "updLastName",
      updUsername: "updUsername",
      updUserSettings: "updUserSettings",
    }),
    updateProfile() {
      if (
        this.wishedFirstName.length == 0 &&
        this.wishedLastName.length == 0 &&
        this.wishedUsername.length == 0
      ) {
        alert("No field has changed");
        return;
      }
      // debugging code
      console.log(
        "------------------------------------------------------------"
      );
      console.log("[Original state]");
      console.log(`first name: ${this.profileFirstName}`);
      console.log(`last name: ${this.profileLastName}`);
      console.log(`username: ${this.profileUsername}`);
      console.log(
        "------------------------------------------------------------"
      );
      console.log("[Check returned property]");
      console.log(this.wishedFirstName);
      console.log(this.wishedLastName);
      console.log(this.wishedUsername);
      console.log(
        "------------------------------------------------------------"
      );
      console.log("[Check return property length]");
      console.log(this.wishedFirstName.length);
      console.log(this.wishedLastName.length);
      console.log(this.wishedUsername.length);

      // update the database value when necessary
      this.wishedFirstName.length > 0
        ? this.updFirstName(this.wishedFirstName)
        : null;
      this.wishedLastName.length > 0
        ? this.updLastName(this.wishedLastName)
        : null;
      this.wishedUsername.length > 0
        ? this.updUsername(this.wishedUsername)
        : null;

      this.modalActive = !this.modalActive;
      this.wishedFirstName = "";
      this.wishedLastName = "";
      this.wishedUsername = "";
      console.log(
        "------------------------------------------------------------"
      );
      console.log("[Checkpoint: Has state changed? Retrieve the state]");
      // retreive the computed state
      console.log(`New first name: ${this.profileFirstName}`);
      console.log(`New last name: ${this.profileLastName}`);
      console.log(`New username: ${this.profileUsername}`);
      console.log(
        "------------------------------------------------------------"
      );
      console.log("[Successfully update the state]");
    },
    closeModal() {
      this.modalActive = !this.modalActive;
    },
  },
  computed: {
    ...mapState("users", [
      "profileInitials",
      "profileFirstName",
      "profileLastName",
      "profileUsername",
      "profileEmail",
    ]),
  },
};
</script>
<style lang="scss" scoped>
.profile {
  .container {
    max-width: 1000px;
    padding: 60px 25px;
    h2 {
      text-align: center;
      margin-bottom: 16px;
      font-weight: 300;
      font-size: 32px;
    }
    .profile-info {
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 32px;
      background-color: #f1f1f1;
      display: flex;
      flex-direction: column;
      max-width: 600px;
      margin: 32px auto;
      .initials {
        position: initial;
        width: 80px;
        height: 80px;
        font-size: 32px;
        background-color: #303030;
        color: #fff;
        display: flex;
        align-self: center;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      .admin-badge {
        display: flex;
        align-self: center;
        color: #fff;
        font-size: 14px;
        padding: 8px 24px;
        border-radius: 8px;
        background-color: #303030;
        margin: 16px 0;
        text-align: center;
        text-transform: capitalize;
        .icon {
          width: 14px;
          height: auto;
          margin-right: 8px;
        }
      }
      .input {
        margin: 16px 0;
        label {
          font-size: 14px;
          display: block;
          padding-bottom: 6px;
        }
        input {
          width: 100%;
          border: none;
          background-color: #f2f7f6;
          padding: 8px;
          height: 50px;
          @media (min-width: 900px) {
          }
          &:focus {
            outline: none;
          }
        }
      }
      button {
        align-self: center;
      }
    }
  }
}
</style>
