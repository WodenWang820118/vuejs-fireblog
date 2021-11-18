<template>
  <div class="blog-wrapper" :class="{ 'no-user': !user }">
    <!-- use no-user class only if user not login -->
    <div class="blog-content">
      <div>
        <!-- if welcomeScreen object -->
        <h2 v-if="post.welcomeScreen">{{ post.title }}</h2>
        <h2 v-else>{{ post.blogTitle }}</h2>
        <p v-if="post.welcomeScreen">{{ post.blogPost }}</p>
        <!-- <p class="content-preview" v-else v-html="post.blogHTML"></p> -->
        <p class="content-preview" v-else v-html="compiledMarkdown"></p>
        <router-link class="link link-light" v-if="post.welcomeScreen" to="#">
          Login/Register<img
            class="arrow-light"
            src="@/assets/Icons/arrow-right-light.svg"
          />
        </router-link>
        <router-link
          class="link"
          v-else
          :to="{ name: 'ViewBlog', params: { blogId: post.blogId } }"
        >
          View The Post<img
            class="arrow"
            src="@/assets/Icons/arrow-right-light.svg"
          />
        </router-link>
      </div>
    </div>
    <div class="blog-photo">
      <img
        v-if="post.welcomeScreen"
        :src="require(`@/assets/blogPhotos/${post.photo}.jpg`)"
        alt=""
      />
      <img v-else :src="post.blogCoverPhoto" alt="" />
    </div>
  </div>
</template>

<script>
import { computed, inject } from "vue";
import marked from "marked";
export default {
  name: "BlogPost",
  props: {
    // more clear about props type, easier for type check and validations
    // https://v3.vuejs.org/guide/component-props.html
    post: {
      type: Object,
    },
  },
  setup() {
    // state management
    const store = inject("store");
    const user = computed(() => store.getters["users/user"]);

    return {
      user
    }
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.post.blogHTML);
    },
  },
};
</script>

<style lang="scss" scoped>
.blog-wrapper {
  display: flex;
  flex-direction: column;
  padding: 10px 5% 1px 5%;
  // box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
  //   0 2px 4px -1px rgba(0, 0, 0, 0.06);
  @media (min-width: 700px) {
    min-height: 650px;
    max-height: 650px;
    flex-direction: row;
  }
  .blog-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 4;
    order: 2;
    @media (min-width: 700px) {
      order: 1;
    }
    @media (min-width: 800px) {
      flex: 3;
    }
    div {
      max-width: 375px;
      padding: 72px 24px;
      @media (min-width: 700px) {
        padding: 0 24px;
      }
      h2 {
        font-size: 32px;
        font-weight: 300;
        text-transform: uppercase;
        margin-bottom: 24px;
        @media (min-width: 700px) {
          font-size: 40px;
        }
      }
      p {
        font-size: 15px;
        font-weight: 300;
        line-height: 1.7;
      }
      // TODO: if user put a picture first, the preview would just crop the picture
      // option: use conditional rendering to render only text part
      .content-preview {
        font-size: 13px;
        max-height: 24px;
        width: 250px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .link {
        display: inline-flex;
        align-items: center;
        margin-top: 32px;
        padding-bottom: 4px;
        border-bottom: 1px solid transparent;
        transition: 0.5s ease-in all;
        &:hover {
          border-bottom-color: #303030;
        }
      }
      .link-light {
        &:hover {
          border-bottom-color: #ffff;
        }
      }
    }
  }
  .blog-photo {
    order: 1;
    flex: 3;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    @media (min-width: 700px) {
      order: 2;
    }
    @media (min-width: 800px) {
      flex: 4;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 5px;
      object-fit: cover;
    }
  }
  &:nth-child(even) {
    .blog-content {
      order: 2;
    }
    .blog-photo {
      order: 1;
    }
  }
}
.no-user:first-child {
  .blog-content {
    background-color: #303030;
    color: #fff;
  }
}
// .arrow {
//   margin-left: 8px;
//   width: 12px;
//   path {
//     fill: currentColor;
//   }
//   color: #303030;
// }
// .arrow-light {
//   margin-left: 8px;
//   width: 12px;
//   path {
//     fill: currentColor;
//   }
//   color: #fff;
// }
</style>
