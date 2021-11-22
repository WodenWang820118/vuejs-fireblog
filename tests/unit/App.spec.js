import { mount, shallowMount } from "@vue/test-utils";
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from "vuex";
import { computed } from "vue";

import routesMock from './routes'

import Home from "@/views/Home.vue";
import App from "@/App.vue";
import Navigation from "@/components/Navigation.vue";
import Footer from "@/components/Footer.vue";


// the module to mock the firebase firestore
// reference: https://www.npmjs.com/package/firestore-jest-mock
const { mockFirebase } = require('firestore-jest-mock');
const firebase = require('firebase');

// mock the built store
// everythin is inside the store and is mocked by the jest.mock function
jest.mock("@/store")
jest.mock('@/router')

const router = createRouter({
  history: createWebHistory(),
  // routes: routesMock,
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

/**
 * With each test, the VuexStore is reseted and instantiated again
 * @returns {Vuex.Store}
 */
const createVuexStore = () => {
  // reference: https://stackoverflow.com/questions/51313280/mocking-vuex-module-action-in-component-unit-test
  let users = {
    actions: {
      getCurrentUser: jest.fn(),
      mountUser: jest.fn() ,
    },
    namespaced: true,
  }

  let posts = {
    state:{
      postLoaded: null,
      blogPosts: [],
    },
    getters: {
      profileEmail: jest.fn(() => "") ,
      postLoaded: jest.fn((state) => state.postLoaded),
      blogPosts: jest.fn((state) => state.blogPosts),
    },
    actions: {
      getPost: jest.fn(({ commit }) => {
        const postLoaded = true;
        const blogPosts = [
          {
            blogId: "1",
            blogHTML: "Hello World",
            blogCoverPhoto: null,
            blogTitle: "Title",
            blogDate: null,
            blogCoverPhotoName: "empty",
          }
        ]
        commit("setPost", blogPosts);
        commit("setPostLoaded", postLoaded);
      }),
    },
    mutations: {
      setPost: jest.fn((state, payload) => {
        payload.forEach((post) => {
          state.blogPosts.push(post);
        })
      }),
      setPostLoaded: jest.fn((state, payload) => {
        state.postLoaded = payload;
      })
    },
    namespaced: true,
  }

  const store = createStore({
    modules: {
      users,
      posts
    }
  })
  return store
}

describe("App.vue", () => {

  /**
   * The factory function reduces boilerplate mounting code with the store, and the router.
   * @returns the mount on the App.vue component with pluglin store, router.
   */
  async function factory(functions) {
    const store = createVuexStore()
    // router warning discussion: https://github.com/testing-library/vue-testing-library/issues/195
    // documentation: https://next.vue-test-utils.vuejs.org/guide/advanced/vue-router.html#using-a-real-router
    router.push("/");
    await router.isReady();
    
    // the shallowMount doesn't render children components
    // otherwise, using mount needs all the routes and children components imported
    return shallowMount(App, {
      global: {
        plugins: [store, router]
      },
      methods: functions,
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

  test('The posts does not loaded when routing in the home page initially', async () => {
    // create a new store and dispatch the getPost action
    const store = createVuexStore()
    const postLoaded = store.getters['posts/postLoaded']

    // mount the App.vue component with the store and router
    await factory()

    expect(postLoaded).toBe(null)
  })

  test('getPost function called when mounting the DOM; store correctly receives the data; the app rendered'
    , async () => {
    
    const wrapper = await factory() // the wrapper already called the getPost function
    const store = wrapper.vm.$store

    const blogPosts = store.getters['posts/blogPosts']

    expect(blogPosts.length).toBe(1)
    expect(wrapper.vm.postLoaded).toBe(true)
  })
})