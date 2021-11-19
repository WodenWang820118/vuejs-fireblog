import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from "vuex";

import App from "@/App.vue";
import Home from "@/views/Home.vue";
import Navigation from "@/components/Navigation.vue";
import Footer from "@/components/Footer.vue";

// firebase mocks
// mock before any describe test, since jest will reorder the mocks before import
// reference: https://stackoverflow.com/questions/52043886/how-do-you-mock-firebase-firestore-methods-using-jest
jest.mock('firebase/app', () => ({
  __esModule: true, // for the successful mocking
  default: {
    apps:[],
    initializeApp: () => jest.fn(),
    auth: jest.fn(()=>{
      return {
        onAuthStateChanged: jest.fn(()=>Promise.resolve(false)),
        currentUser: {
          sendEmailVerification: jest.fn(() => Promise.resolve(true))
        }
      }
    }) 
  }
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      props: true,
      component: Home,
      meta: {
        title: "Home",
      },
    },
  ]
})

const createVuexStore = () => {
  return createStore({
    getters:{
      profileEmail: () => "",
      postLoaded: () => false,
    },
    actions:{
      getPost: jest.fn(),
      getCurrentUser: jest.fn(),
      mountUser: jest.fn()
    }
  })
}

describe("App.vue", () => {

  /**
   * The factory function reduces boilerplate mounting code with the store, and the router.
   * @returns the mount on the App.vue component with pluglin store, router.
   */
  async function factory() {
    const store = createVuexStore()
    // router warning discussion: https://github.com/testing-library/vue-testing-library/issues/195
    // documentation: https://next.vue-test-utils.vuejs.org/guide/advanced/vue-router.html#using-a-real-router
    router.push("/");
    await router.isReady();
    
    return mount(App, {
      global: {
        plugins: [store, router]
      }
    })
  }

  test('The Navigation component exists', async () => {
    // await the factory to be ready
    const wrapper = await factory()
    expect(wrapper.findComponent(Navigation)).toBeTruthy()
  })

  test('The Footer componets exist', async () => {
    const wrapper = await factory()
    expect(wrapper.findComponent(Footer)).toBeTruthy()
  })

  
})