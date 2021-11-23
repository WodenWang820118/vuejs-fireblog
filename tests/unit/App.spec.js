import { shallowMount } from "@vue/test-utils";
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from "vuex";

import routesMock from './routes'

import Home from "@/views/Home.vue";
import App from "@/App.vue";

import firebase from 'firebase';

// the module to mock the firebase firestore
// reference: https://www.npmjs.com/package/firestore-jest-mock
// the firebase database
const { mockFirebase } = require('firestore-jest-mock');
const { mockCollection, mockDoc } = require('firestore-jest-mock/mocks/firestore');

mockFirebase({
  database: {
    users: [
      { id:"1", name: "Guan-Xin", email: "email" },
    ],
    posts: [
      {
        blogId: "1",
        blogHTML: "Hello World",
        blogCoverPhoto: "",
        blogTitle: "Title",
        blogDate: 1627665412781,
        blogCoverPhotoName: "empty",
      }
    ]
  }
})

// firestore mock
const db = firebase.firestore();

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
    state:{
      user: null,
      profileEmail: null,
    },
    getters:{
      user: state => state.user,
      profileEmail: state => state.profileEmail,
    },
    actions: {
      getCurrentUser: jest.fn(),
      mountUser: jest.fn(({commit}, user)=> {
        commit("setUser", user);
      }) ,
    },
    mutations: {
      setUser: (state, user) => {
        state.user = user;
      }
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
        // assure that the query made to the mock firebase
        // if a Promise returened, commit it with mutation
        try {
          const response = db.collection("blogPosts").orderBy("blogDate", "desc").get();
          commit("setPost", response);
        } catch (error) {
          console.log(error);
        }
      }),
    },
    mutations: {
      setPost: jest.fn((state, dbCollection) => {
        // console.log(dbCollection); // it would be a Pending Promise
        // the dbCollection is uneresolved Promise
        // inside the Promise, there's no further implementation
        // trigger the triggerUncaughtException
        console.log(dbCollection)
        const data = {
          blogId: "1",
          blogHTML: "Hello World",
          blogCoverPhoto: "",
          blogTitle: "Title",
          blogDate: 1627665412781,
          blogCoverPhotoName: "empty",
        }
          state.blogPosts.push(data);
          state.postLoaded = true;
        
      }),  
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

  test('Initially, the blogPosts is empty; the app does not loaded', () => {
    // create a new store and dispatch the getPost action
    const store = createVuexStore()
    const postLoaded = store.getters['posts/postLoaded']
    const blogPosts = store.getters['posts/blogPosts']
    
    expect(postLoaded).toBe(null)
    expect(blogPosts.length).toBe(0)
  })

  test('getPost function called when mounting the DOM; store correctly receives the data; the app rendered'
    , async () => {
    const wrapper = await factory() // the wrapper already called the getPost function
    const store = wrapper.vm.$store

    const blogPosts = store.getters['posts/blogPosts']

    expect(blogPosts.length).toBe(1)
    expect(wrapper.vm.postLoaded).toBe(true)
  })

  test('user login is by default false; null by admin; null by user state', async () => {
    const wrapper = await factory()
    const store = wrapper.vm.$store
    const user = store.getters['users/user']

    expect(wrapper.vm.user_login).toBe(false)
    expect(wrapper.vm.admin).toBe(null)
    expect(user).toBe(null)
  })

  test('correctly query the users database', () => {
    const database = db.collection("users").get();
    database.then(()=>{
      expect(mockCollection).toHaveBeenCalledWith('users');
    })
  })

  // TODO: test the user login
  test('correctly mount the logged in user', () => {
    
  })
})