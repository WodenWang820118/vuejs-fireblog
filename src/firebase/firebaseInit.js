// import the file only needed, remove redundency
// the vue app would hook on the firebase backend
import firebase from "firebase/app";
import "firebase/firestore"; // to initilize the default App

var firebaseConfig = {
  apiKey: "AIzaSyB9D51M_e4XkvBSoyFZPc8hTaKCTbgqBjk",
  authDomain: "vuejs3-fireblog.firebaseapp.com",
  projectId: "vuejs3-fireblog",
  storageBucket: "vuejs3-fireblog.appspot.com",
  messagingSenderId: "954680780309",
  appId: "1:954680780309:web:147f187f86f99dc590901c",
};

export default !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig).firestore()
  : firebase.app().firestore();
