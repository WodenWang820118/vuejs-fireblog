<template>
  <div class="blog-card-wrap">
    <div class="blog-cards container">
      <div class="toggle-edit">
        <span>Toggle Editing Post</span>
        <input type="checkbox" autocomplete="off" @change="updEditPost" />
      </div>
      <BlogCards v-for="(card, index) in blogPosts" :card="card" :key="index" />
    </div>
  </div>
</template>

<script>
import BlogCards from "@/components/BlogCards";
import { mapState, mapActions } from "vuex";
// import posts from "@/store/modules/posts";

export default {
  name: "Blogs",
  data() {
    return {
      // blogPosts: [],
    };
  },
  components: {
    BlogCards,
  },
  mounted() {
    // console.log(store)
  },
  methods: {
    ...mapActions("posts", ["toggleEditPost"]),
    updEditPost(editPost) {
      // and assign the opposite way to the variable for setting
      // call the method from mapActions to change the state
      editPost = !this.editPost;
      this.toggleEditPost(editPost);
    },
  },
  computed: {
    ...mapState("posts", ["blogPosts", "editPost"]),
  },
  beforeUnmount() {
    this.toggleEditPost(false);
  },
};
</script>

<style lang="scss" scoped>
.blog-cards {
  position: relative;
  .toggle-edit {
    display: flex;
    align-items: center;
    position: absolute;
    top: -70px;
    right: 0;
    span {
      margin-right: 16px;
    }
    input[type="checkbox"] {
      position: relative;
      border: none;
      -webkit-appearance: none;
      background: #fff;
      outline: none;
      width: 80px;
      height: 30px;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    input[type="checkbox"]:before {
      content: "";
      position: absolute;
      width: 30px;
      height: 30px;
      border-radius: 20px;
      top: 0;
      left: 0;
      background: #303030;
      transform: scale(1.1);
      transition: 750ms ease all;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    input:checked[type="checkbox"]:before {
      background: #fff;
      left: 52px;
    }
  }
}
</style>
