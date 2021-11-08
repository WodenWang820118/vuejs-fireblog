import firebase from "firebase/app";
import "firebase/auth";
import db from "@/firebase/firebaseInit";

const state = {
  user: null,
  profileEmail: null,
  profileFirstName: null,
  profileLastName: null,
  profileUsername: null,
  profileId: null,
  profileInitials: null,
};

const getters = {
  user: (state) => state.user,
  profileEmail(state) {
    return state.profileEmail;
  },
  profileFirstName(state) {
    return state.profileFirstName;
  },
  profileLastName(state) {
    return state.profileLastName;
  },
  profileUsername(state) {
    return state.profileUsername;
  },
  profileInitials(state) {
    return state.profileInitials;
  },
};

const actions = {
  async getCurrentUser({ commit }) {
    const dataBase = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid);
    await dataBase
      .get()
      .then((user) => {
        if (user.exists) {
          // console.log(`The user is: ${user.data()}`)
          // console.log(`The uid: ${user.data().uid}`)
          // console.log(`The email: ${user.data().email}`)
          // console.log(`The first name: ${user.data().firstName}`)
          // console.log(`The last name: ${user.data().lastName}`)
          // console.log(`The username: ${user.data().username}`)
          commit("setProfileInfo", user);
          commit("setProfileInitials", user);
        } else {
          console.log("No such user");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  },
  async mountUser({ commit }, user) {
    commit("setUser", user);
  },
  // update the each user file when needed
  // will commit and mutate the state
  async updFirstName({ commit }, firstName) {
    console.log("[Retrieve the new first name]: " + firstName);
    const dataBase = await db.collection("users").doc(state.profileId);
    await dataBase.update({
      firstName: firstName,
    });
    console.log("[Successfully update the first name in firestore]");
    commit("setFirstName", firstName);
  },
  async updLastName({ commit }, lastName) {
    console.log("[Retrieve the new last name]: " + lastName);
    const dataBase = await db.collection("users").doc(state.profileId);
    await dataBase.update({
      lastName: lastName,
    });
    console.log("[Successfully update the last name in firestore]");
    commit("setLastName", lastName);
  },
  async updUsername({ commit }, username) {
    console.log("[Retrieve the new username]: " + username);
    const dataBase = await db.collection("users").doc(state.profileId);
    await dataBase.update({
      username: username,
    });
    console.log("[Successfully update the username in firestore]");
    commit("setUsername", username);
  },
};

const mutations = {
  setProfileInfo(state, response) {
    state.profileId = response.data().uid;
    state.profileEmail = response.data().email;
    state.profileFirstName = response.data().firstName;
    state.profileLastName = response.data().lastName;
    state.profileUsername = response.data().username;
  },
  // TODO: the current initials would grab
  setProfileInitials(state) {
    // state.profileInitials =
    //   state.profileFirstName.match(/(\b\S)?/g).join("") +
    //   state.profileLastName.match(/(\b\S)?/g).join("")
    // much better just use the first letter
    state.profileInitials =
      state.profileFirstName[0] + state.profileLastName[0];
  },
  setUser(state, payload) {
    state.user = payload;
  },
  setFirstName(state, payload) {
    state.profileFirstName = payload;
  },
  setLastName(state, payload) {
    state.profileLastName = payload;
  },
  setUsername(state, payload) {
    state.profileUsername = payload;
  },
};

export default {
  namespaced: true, // for using the multiple modules together
  state,
  getters,
  actions,
  mutations,
};
