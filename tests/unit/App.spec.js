import { mount } from "@vue/test-utils";
import { useRoute, useRouter } from "vue-router";
import { createStore } from "vuex";

import App from "@/App.vue";
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

describe("App.vue", () => {
  // Vuex mocks
  // define the store and the getters, actions
  let store;

  const route = useRoute()
  const router = useRouter()

  // before mounting the component
  // create a store to mock the getters and actions
  // before each test, the store would be reset
  beforeEach(() => {
    // create a mocked store with the mocked getters and actions
    store = createStore({
      getters:{
        profileEmail: jest.fn(),
        postLoaded: jest.fn(),
      },
      actions:{
        getPost: jest.fn(),
        getCurrentUser: jest.fn(),
        mountUser: jest.fn()
      }
    })
  })

  function factory() {
    return mount(App, {
      global: {
        plugins: [store, router]
      }
    })
  }

  test('The Navigation component exists', () => {
    const wrapper = factory()
    expect(wrapper.findComponent(Navigation)).toBeTruthy()
  })

  test('The Footer componets exist', () => {
    const wrapper = factory()
    expect(wrapper.findComponent(Footer)).toBeTruthy()
  })

  // test('App.vue called those functions', () => {
  //   mockedInitializeAppFn()
  //   const wrapper = mount(App, {
  //     global: {
  //       plugins: [store,router],
  //     }
  //   })
  //   expect(mockedInitializeAppFn).toHaveBeenCalled()
  // })
})