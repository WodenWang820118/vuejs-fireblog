import db from "@/firebase/firebaseInit";

const state = {
  // the attributes of a post
  blogHTML: "Write your blog title here...",
  blogTitle: "",
  blogCoverPhotoName: "",
  blogPhotoFileURL: null,
  blogPhotoPreview: null,
  // get the data from firebase storage
  blogPosts: [],
  postLoaded: null,
  editPost: null,
};

const getters = {
  blogPostsFeed(state) {
    return state.blogPosts.slice(0, 2);
  },
  blogPostsCards(state) {
    return state.blogPosts.slice(2, 6);
  },
  blogPosts(state) {
    return state.blogPosts;
  },
  editPost: (state) => state.editPost,
};

const actions = {
  toggleEditPost({ commit }, payload) {
    commit("setEdit", payload);
  },
  async updBlogTitle({ commit }, title) {
    commit("setBlogTitle", title);
  },
  async newBlogPost({ commit }, post) {
    commit("setBlog", post);
  },
  async fileNameChange({ commit }, fileName) {
    commit("setFileName", fileName);
  },
  async createFileURL({ commit }, fileURL) {
    commit("setFileURL", fileURL);
  },
  async togglePreview({ commit }) {
    commit("setPreview");
  },
  /**
   * The function connects to the database and bring the data to the array
   * @param {*} param0
   * @returns
   */
  // accessing the state -> { state }
  async getPost({ commit }) {
    // console.log(`The blog posts: ${state.blogPosts}`)
    const dataBase = await db
      .collection("blogPosts")
      .orderBy("blogDate", "desc");
    const dbResults = await dataBase.get();
    console.log("[Connect and get the blog posts data]");
    console.log(dbResults + "from [blogPosts.js]");
    if (dbResults) {
      commit("setPost", dbResults);
      return;
    }
    console.log("There's something wrong with the database, or empty data");
  },
  async deletePostFromDatabase({ state }, payload) {
    // console.log(`Delete post id: ${payload}`)
    const post = await db.collection("blogPosts").doc(payload);
    post.delete();
    state.blogPosts = state.blogPosts.filter((post) => post.blogId !== payload);
  },
  getCertainPost({ state }, blogId) {
    // console.log(`The current blogPosts: ${state.blogPosts}`)
    return state.blogPosts.filter((post) => post.blogId == blogId);
  },
};

const mutations = {
  setEdit: (state, payload) => (state.editPost = payload),
  setBlogTitle(state, payload) {
    state.blogTitle = payload;
  },
  setBlog(state, payload) {
    state.blogHTML = payload;
  },
  setFileName(state, payload) {
    state.blogCoverPhotoName = payload;
  },
  setFileURL(state, payload) {
    state.blogPhotoFileURL = payload;
  },
  setPreview(state) {
    state.blogPhotoPreview = !state.blogPhotoPreview;
  },
  setPost(state, dbCollection) {
    console.log(dbCollection);
    dbCollection.forEach((doc) => {
      const data = {
        blogId: doc.data().blogId,
        blogHTML: doc.data().blogHTML,
        blogCoverPhoto: doc.data().blogCoverPhoto,
        blogTitle: doc.data().blogTitle,
        blogDate: doc.data().blogDate,
        blogCoverPhotoName: doc.data().blogCoverPhotoName,
      };
      state.blogPosts.push(data);
      console.log(`The updated blog posts: ${state.blogPosts}`);
    });
    state.postLoaded = true;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
