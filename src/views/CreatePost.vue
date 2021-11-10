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
          <label for="blog-photo">Upload Cover Photo</label>
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
        <!-- Since instantly preview possible, doesn't need preview post function anymore -->
        <v-md-editor
          v-model="text"
          height="600px"
          :disabled-menus="[]"
          @upload-image="imageHandler"
        >
        </v-md-editor>
      </div>
      <div class="blog-actions">
        <button @click="uploadBlog">Publish Blog</button>
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
import { ref, computed } from "vue";
import imageCompression from 'browser-image-compression';

export default {
  name: "CreatePost",
  components: {
    BlogCoverPreview,
    Loading,
  },
  setup() {
    // state management
    const store = useStore();
    const profileId = computed(() => store.getters["users/profileId"]);
    const storeComputed = {
      blogHTML: computed(() => store.getters["posts/blogHTML"]),
      blogCoverPhotoName: computed(
        () => store.getters["posts/blogCoverPhotoName"]
      ),
      blogPhotoFileURL: computed(() => store.getters["posts/blogPhotoFileURL"]),
      blogPhotoPreview: computed(() => store.getters["posts/blogPhotoPreview"]),
    };

    const updBlogTitle = (title) => {
      store.dispatch("posts/updateBlogTitle", title);
    };

    const filenameChange = (filename) => {
      store.dispatch("posts/filenameChange", filename);
    };

    const createFileURL = (file) => {
      store.dispatch("posts/createFileURL", file);
    };

    const togglePreview = () => {
      store.dispatch("posts/togglePreview");
    };

    const storeActions = {
      updBlogTitle,
      togglePreview,
    };

    // route management
    const route = useRoute();
    const router = useRouter();

    // variables
    const error = ref(null);
    const errorMsg = ref(null);
    const coverPhoto = ref(null);
    const blogTitle = ref("");
    const text = ref("");
    const loading = ref(null);
    const blogPhoto = ref(null); // ref props in the template

    // functions

    async function imageCompressionHandler(imageFile) {
      // options to compress the image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      }

      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
        console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

        return compressedFile;
      } catch (error) {
        console.log(error);
      }
    }

    /**
     * create the filename state and the ObjectURL state
     */
    async function fileChange() {
      coverPhoto.value = await imageCompressionHandler(blogPhoto.value.files[0]);
      console.log(coverPhoto.value);
      const fileName = coverPhoto.value.name;
      filenameChange(fileName); // change the state
      createFileURL(URL.createObjectURL(coverPhoto.value)); // create the URL
    }

    // reference: https://code-farmer-i.github.io/vue-markdown-editor/senior/upload-image.html
    // seems to upload one image every time when clicking the upload image on the toolbar
    // TODO: bug, if trigger bug, the function won't redirect to the named route
    /**
     * The image handler according to the v-md-editor, which is to upload the image
     * to the firebase
     */
    async function imageHandler(event, insertImage, files) {
      console.log("[Trigger imageHandler]");
      const contentPhoto = await imageCompressionHandler(files[0]);
      const fileName = contentPhoto.name;
      // const url = URL.createObjectURL(contentPhoto);
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

    /**
     * Get the uploaded written blog from the firebase
     */
    function getWrittenPost() {
      const docRef = db.collection("blogPosts").doc(route.params.blogId);
      docRef
        .get()
        .then((doc) => {
          doc.exists
            ? console.log("Document data:", doc.data())
            : console.log("No such document!");
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }

    /**
     * Upload the blog post to the firebase
     */
    function uploadBlog() {
      if (db) {
        console.log("database alive");
      }
      if (blogTitle.value.length !== 0 && text.value.length !== 0) {
        if (coverPhoto.value) {
          loading.value = true;
          console.log("[All validations passed]");
          const timestamp = Date.now();
          const fileName = coverPhoto.value.name;
          const uniqueFileName = fileName + timestamp;
          const storageRef = firebase.storage().ref();
          const docRef = storageRef.child(
            `documents/BlogCoverPhotos/${uniqueFileName}`
          );

          const uploadTask = docRef.put(coverPhoto.value);
          // watch the upload task according to the progress
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
              const timestamp = Date.now();
              const document = db.collection("blogPosts").doc(); // auto-generate the document path
              uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                console.log("The URL back from firebase:" + url);
                console.log("The database id: " + document.id);
                // set the schema
                document.set({
                  blogId: document.id, // the blogID is also used as path
                  blogHTML: DOMPurify.sanitize(text.value),
                  blogCoverPhoto: url,
                  blogCoverPhotoName: uniqueFileName,
                  blogTitle: blogTitle.value,
                  profileId: profileId.value,
                  blogDate: timestamp,
                });
              });
              loading.value = true;
              console.log("[Route to the new post]");
              getWrittenPost();
              loading.value = false;
              await router.push({
                name: "ViewBlog",
                params: { blogId: document.id },
              });
            }
          );
          return;
        }
        error.value = true;
        errorMsg.value = "Please ensure you uploaded a cover photo";
        setTimeout(() => {
          error.value = false;
        }, 5000);
        return; // if no return, directly execute the code below
      }
      error.value = true;
      errorMsg.value = "Please ensure Blog Title & Blog Post has been filled";
      setTimeout(() => {
        error.value = false;
      }, 5000);
      return;
    }

    return {
      ...storeComputed,
      ...storeActions,
      fileChange,
      imageHandler,
      uploadBlog,
      error,
      errorMsg,
      coverPhoto,
      blogTitle,
      text,
      loading,
      blogPhoto,
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
