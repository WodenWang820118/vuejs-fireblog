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
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import db from "../firebase/firebaseInit";

export default {
  name: "ViewBlog",
  setup() {
    // varailables defined
    const currentBlog = ref();
    const reload = ref(true);

    // access router
    const router = useRoute();


    /**
     * The function get the blog post using the default generaetd blogId by firebase
     */
    function getCertainPost() {
      const docRef = db.collection("blogPosts").doc(router.params.blogId);
      docRef.get()
      .then((doc) => {
        doc.exists ? currentBlog.value = doc.data() : currentBlog.value = null;
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
    }

    onMounted(() => {
      getCertainPost();
    });

    // cannot return the marked during the setup phase
    // it will return the function string instead of calling

    return {
      reload, currentBlog,
    }

  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.currentBlog.blogHTML);
    },
  },
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
