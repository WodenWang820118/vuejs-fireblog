<template>
  <div class="create-post">
    <BlogCoverPreview v-show="blogPhotoPreview" />
    <Loading v-show="loading" />
    <div class="container">
      <!-- invisible if nothing wrong -->
      <div :class="{ invisible: !error }" class="err-message">
        <p><span>Error:</span>{{ errorMsg }}</p>
      </div>
      <div class="blog-info">
        <input type="text" placeholder="Enter Blog Title" v-model="blogTitle" />
        <div class="upload-file">
          <label for="blog-photo">Change Cover Photo</label>
          <!-- the "file" type allows uploading photo -->
          <input
            type="file"
            ref="blogPhoto"
            id="blog-photo"
            @change="fileChange"
            accept=".png, .jpg, .jpeg"
          />
          <!-- disable if not having photo -->
          <button
            @click="togglePreview"
            class="preview"
            :class="{ 'button-inactive': !blogPhotoFileURL }"
          >
            Preview Photo
          </button>
          <span v-if="coverPhoto">File Chosen: {{ blogCoverPhotoName }}</span>
        </div>
      </div>
      <div class="editor">
        <!-- TODO: response rendered box under editor when screen size shrinks -->
        <!-- tool reference: https://github.com/code-farmer-i/vue-markdown-editor -->
        <v-md-editor
          v-model="text"
          height="600px"
          :disabled-menus="[]"
          @upload-image="imageHandler"
        >
        </v-md-editor>
      </div>
      <div class="blog-actions">
        <button @click="updateBlog">Save changes</button>
      </div>
    </div>
  </div>
</template>

<script>
import BlogCoverPreview from "@/components/BlogCoverPreview";
import Loading from "@/components/Loading";
import firebase from "firebase/app";
import db from "../firebase/firebaseInit"; // the configuration data
import "firebase/storage";
import DOMPurify from "dompurify";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import imageCompression from "browser-image-compression";

export default {
  name: "EditBlog",
  components: {
    BlogCoverPreview,
    Loading,
  },
  setup() {
    // the router reference
    const route = useRoute();
    const router = useRouter();

    // store management
    const store = useStore();

    // computed properties
    const storeComputed = {
      users: computed(() => store.getters["users/profileId"]),
      blogHTML: computed(() => store.getters["posts/blogHTML"]),
      blogCoverPhotoName: computed(
        () => store.getters["posts/blogCoverPhotoName"]
      ),
      blogPhotoFileURL: computed(() => store.getters["posts/blogPhotoFileURL"]),
      blogPhotoPreview: computed(() => store.getters["posts/blogPhotoPreview"]),
      blogPosts: computed(() => store.getters["posts/blogPosts"]),
    };

    // actions
    const filenameChange = (filename) => {
      return store.dispatch("posts/filenameChange", filename);
    };

    const createFileURL = (fileName) => {
      return store.dispatch("posts/createFileURL", fileName);
    };

    const updBlogTitle = (title) => {
      return store.dispatch("posts/updBlogTitle", title);
    };

    const togglePreview = () => {
      return store.dispatch("posts/togglePreview");
    };

    const setBlogState = (state) => {
      return store.dispatch("posts/setBlogState", state);
    };

    // variables
    const error = ref(null);
    const errorMsg = ref(null);
    const coverPhoto = ref(null);
    const blogTitle = ref("");
    const text = ref("");
    const loading = ref(null);
    const currentBlog = ref(null);
    const blogPhoto = ref(null);

    // functions
    async function fileChange() {
      console.log("[There's a new photo]");
      // console.log(blogPhoto.value.files[0]);
      coverPhoto.value = await imageCompressionHandler(
        blogPhoto.value.files[0]
      );
      const fileName = coverPhoto.value.name;
      console.log(`The fileName: ${fileName}`);
      filenameChange(fileName); // change the state
      createFileURL(URL.createObjectURL(coverPhoto.value)); // create the URL
    }

    async function imageCompressionHandler(imageFile) {
      // options to compress the image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(
          "compressedFile instanceof Blob",
          compressedFile instanceof Blob
        ); // true
        console.log(
          `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
        ); // smaller than maxSizeMB

        return compressedFile;
      } catch (error) {
        console.log(error);
      }
    }

    async function imageHandler(event, insertImage, files) {
      console.log("[Trigger imageHandler]");
      let contentPhoto = files[0];
      contentPhoto = await imageCompressionHandler(contentPhoto); // compress the photo
      const fileName = contentPhoto.name;
      const url = URL.createObjectURL(contentPhoto);
      // const contentPhotoName = this.contentPhoto.name
      // const url = URL.createObjectURL(this.contentPhoto)
      console.log("Corresponding files: " + contentPhoto); // [object File]
      console.log("The file name is: " + fileName); // 5741195.jpg
      console.log("The event: " + event); // [object Event]
      console.log("The url: " + url); // blob:http://localhost:8080/08e9f458-8d7e-4828-9b96-0b404ca3a133
      console.log("[Initialize the database..]");
      const storageRef = firebase.storage().ref();
      console.log("[Initialize the firebase stoarge successfully]");
      const docRef = storageRef.child(`documents/blogPostPhotos/${fileName}`);

      const uploadTask = docRef.put(contentPhoto);
      uploadTask.on(
        "stata_changed",
        (snapshot) => {
          console.log(snapshot); // multiple snapshot -> upload progressing
        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log("[Waiting for downloading the image URL]");
          uploadTask.snapshot.ref.getDownloadURL().then((url) => {
            console.log("The URL back from firebase:" + url);
            insertImage({
              url: url,
              desc: "desc",
            });
          });
        }
      );
    }

    function updateBlog() {
      if (db) {
        console.log("database alive");
      }
      const document = db.collection("blogPosts").doc(route.params.blogId);
      if (blogTitle.value.length !== 0 && text.value.length !== 0) {
        if (coverPhoto.value) {
          loading.value = true;
          console.log("[All validations passed]");
          const timestamp = Date.now();
          const fileName = coverPhoto.value.name;
          const uniqueFileName = fileName + timestamp;
          // const url = URL.createObjectURL(this.coverPhoto)
          const storageRef = firebase.storage().ref();
          // file name should be unique, othwise, might get 403: https://stackoverflow.com/questions/41943860/getting-403-forbidden-error-when-trying-to-load-image-from-firebase-storage
          const docRef = storageRef.child(
            `documents/BlogCoverPhotos/${uniqueFileName}`
          );

          const uploadTask = docRef.put(coverPhoto.value);
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              var progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload is " + progress + "% done");
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  console.log("Upload is paused");
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  console.log("Upload is running");
                  break;
              }
            },
            (err) => {
              console.log(err);
              loading.value = false;
            },
            async () => {
              uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                console.log("The URL back from firebase:" + url);
                console.log("The database id: " + document.id);
                document.update({
                  blogHTML: DOMPurify.sanitize(text.value),
                  blogCoverPhoto: url,
                  blogCoverPhotoName: uniqueFileName,
                  blogTitle: blogTitle.value,
                });
              });
              loading.value = true;
              console.log("[Route to the new post]");
              loading.value = false;
              await router.push({
                name: "ViewBlog",
                params: { blogId: document.id },
              });
            }
          );
          return;
        }
        // if there's no new cover photo, just update the HTML and title
        loading.value = true;
        document.update({
          blogHTML: text.value,
          blogTitle: blogTitle.value,
        });
        loading.value = false;
        router.push({
          name: "ViewBlog",
          params: { blogId: document.id },
        });
      }
      error.value = true;
      errorMsg.value = "Please ensure Blog Title & Blog Post has been filled";
      setTimeout(() => {
        error.value = false;
      }, 5000);
      return;
    }

    // bring the data back to the text editor from firebase
    onMounted(() => {
      const docRef = db.collection("blogPosts").doc(route.params.blogId);
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            currentBlog.value = doc.data();
            text.value = currentBlog.value.blogHTML; // data return
            blogTitle.value = currentBlog.value.blogTitle; // data return
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    });

    return {
      ...storeComputed,
      error,
      errorMsg,
      blogPhoto,
      coverPhoto,
      blogTitle,
      text,
      loading,
      currentBlog,
      fileChange,
      imageHandler,
      updateBlog,
      togglePreview,
      updBlogTitle,
      setBlogState,
    };
  },
};
</script>

<style lang="scss">
.create-post {
  position: relative;
  height: 100%;
  button {
    margin-top: 0;
  }
  .router-button {
    text-decoration: none;
    color: #fff;
  }
  label,
  button,
  .router-button {
    transition: 0.5s ease-in-out all;
    align-self: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 20px;
    padding: 12px 24px;
    color: #fff;
    background-color: #303030;
    text-decoration: none;
    &:hover {
      background-color: rgba(48, 48, 48, 0.7);
    }
  }
  .container {
    position: relative;
    height: 100%;
    padding: 10px 25px 60px;
  }
  // error styling
  .invisible {
    opacity: 0 !important;
  }
  .err-message {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    color: #fff;
    margin-bottom: 10px;
    background-color: #303030;
    opacity: 1;
    transition: 0.5s ease all;
    p {
      font-size: 14px;
    }
    span {
      font-weight: 600;
    }
  }
  .blog-info {
    display: flex;
    margin-bottom: 32px;
    input:nth-child(1) {
      min-width: 300px;
    }
    input {
      transition: 0.5s ease-in-out all;
      padding: 10px 4px;
      border: none;
      border-bottom: 1px solid #303030;
      &:focus {
        outline: none;
        box-shadow: 0 1px 0 0 #303030;
      }
    }
    .upload-file {
      flex: 1;
      margin-left: 16px;
      position: relative;
      display: flex;
      input {
        display: none;
      }
      .preview {
        margin-left: 16px;
        text-transform: initial;
      }
      span {
        font-size: 12px;
        margin-left: 16px;
        align-self: center;
      }
    }
  }
  .editor {
    height: 100%;
    // display: flex;
    flex-direction: column;
    .quillWrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .ql-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: scroll;
    }
    .ql-editor {
      padding: 20px 16px 30px;
    }
  }
  .blog-actions {
    margin-top: 32px;
    button {
      margin-right: 16px;
    }
  }
}
</style>
