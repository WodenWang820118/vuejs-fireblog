<template>
  <div class="blog-card">
    <div v-show="editPost" class="icons">
      <div @click="editBlog" class="icon">
        <!-- the image has its own container, that's why the it's not centered -->
        <img class="edit" src="@/assets/Icons/edit-regular.svg" alt="" />
      </div>
      <div @click="deletePost" class="icon">
        <img class="delete" src="@/assets/Icons/trash-regular.svg" alt="" />
      </div>
    </div>
    <img class="image" :src="card.blogCoverPhoto" alt="" />
    <div class="info">
      <h4>{{ card.blogTitle }}</h4>
      <h6>
        Posted on:
        {{
          new Date(card.blogDate).toLocaleString("en-us", { dateStyle: "long" })
        }}
      </h6>
      <router-link
        class="link"
        :to="{ name: 'ViewBlog', params: { blogId: card.blogId } }"
      >
        View The Post
        <img class="arrow" src="@/assets/Icons/arrow-right-light.svg" />
      </router-link>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { computed } from "vue";
export default {
  name: "BlogCards",
  props: {
    card: {
      type: Object,
    },
  },
  setup(props) {
    // state managemnet
    const store = useStore();

    // actions
    const deletePostFromDatabase = (id) => {
      return store.dispatch("posts/deletePostFromDatabase", id);
    };

    // route management
    const router = useRouter();

    function editBlog() {
      router.push({
        name: "EditBlog",
        params: {
          blogId: props.card.blogId,
        },
      });
    }

    function deletePost() {
      deletePostFromDatabase(props.card.blogId);
    }

    return {
      editPost: computed(() => {
        return store.getters["posts/editPost"];
      }),
      deletePost,
      editBlog,
    };
  },
};
</script>

<style lang="scss" scoped>
.blog-card {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background-color: #fff;
  min-height: 420px;
  transition: 0.5s ease all;
  &:hover {
    transform: rotateZ(-1deg) scale(1.01);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .icons {
    display: flex;
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 99;
    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10%;
      width: 5.5vh;
      height: 5.5vh;
      border-radius: 50%;
      background-color: #fff;
      transition: 0.5s ease all;
      // need to deal with the color with filter here
      &:hover {
        background-color: #303030;
        // give the svg image color, then can use the filter
        .edit,
        .delete {
          color: #000;
          filter: invert(1);
        }
      }
      &:nth-child(1) {
        margin-right: 8px;
      }
      .edit,
      .delete {
        pointer-events: none;
        height: 15px;
        width: auto;
      }
    }
  }
  .image {
    display: block;
    border-radius: 8px 8px 0 0;
    z-index: 1;
    width: 100%;
    min-height: 200px;
    object-fit: cover;
  }
  .info {
    display: flex;
    flex-direction: column;
    height: 100%;
    z-index: 3;
    padding: 32px 16px;
    color: #000;
    h4 {
      padding-bottom: 8px;
      font-size: 20px;
      font-weight: 300;
    }
    h6 {
      font-weight: 400;
      font-size: 12px;
      padding-bottom: 16px;
    }
    .link {
      display: inline-flex;
      align-items: center;
      margin-top: auto;
      font-weight: 500;
      padding-top: 20px;
      font-size: 12px;
      padding-bottom: 4px;
      transition: 0.5s ease-in all;
      &:hover {
        color: rgba(48, 48, 48, 0.8);
      }
      .arrow {
        width: 10px;
      }
    }
  }
}
</style>
