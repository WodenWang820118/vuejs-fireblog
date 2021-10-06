<template>
  <div class="post-view" v-if="currentBlog">
    <div class="container quillWrapper">
      <h2>{{ currentBlog.blogTitle }}</h2>
      <h4>
        Posted on:
        {{
          new Date(currentBlog.blogDate).toLocaleString("en-us", {
            dateStyle: "long",
          })
        }}
      </h4>
      <img class="cover-photo" :src="currentBlog.blogCoverPhoto" alt="" />
      <div class="post-content ql-editor" v-html="compiledMarkdown"></div>
    </div>
  </div>
</template>

<script>
import marked from "marked";
import db from "../firebase/firebaseInit";
import { mapActions } from "vuex";

export default {
  name: "ViewBlog",
  data() {
    return {
      currentBlog: null,
      reload: true,
    };
  },
  components: {},
  computed: {
    // ...mapGetters('blogPosts','blogPosts'),
    compiledMarkdown: function () {
      return marked(this.currentBlog.blogHTML);
    },
  },
  methods: {
    ...mapActions("posts", ["getCertainPost"]),
  },
  async created() {
    // this.getCertainPost(this.$route.params.blogId)
    // the data would be different from state and the firestore
    // therefore, directly get the document from the firestore
    // console.log("[Try to get the post..]")
    const docRef = await db
      .collection("blogPosts")
      .doc(this.$route.params.blogId);
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          // console.log("Document data:", doc.data())
          this.currentBlog = doc.data();
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  },
  mounted() {},
};
</script>

<style lang="scss">
.post-view {
  h4 {
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 24px;
  }
  min-height: 100%;
  .container {
    max-width: 1000px;
    padding: 60px 25px;
  }
  .ql-editor {
    padding: 0;
  }
  h2 {
    margin-bottom: 16px;
    font-weight: 300;
    font-size: 32px;
  }
  .cover-photo {
    width: 100%;
    margin-bottom: 32px;
  }
}
</style>
