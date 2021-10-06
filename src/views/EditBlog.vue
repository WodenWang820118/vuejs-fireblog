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
        <!-- Since instantly preview possible, doesn't need preview post function anymore -->
        <!-- TODO: last updated -->
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

import { mapActions, mapState } from "vuex";
export default {
  name: "EditBlog",
  data() {
    return {
      error: null,
      errorMsg: null,
      coverPhoto: null,
      blogTitle: "",
      text: "", // the content inside the editor, which is the html
      loading: null,
      currentBlog: null,
    };
  },
  components: {
    BlogCoverPreview,
    Loading,
  },
  computed: {
    ...mapState("users", ["profileId"]),
    ...mapState("posts", [
      "blogPhotoFileURL",
      "blogCoverPhotoName",
      "blogHTML",
      "blogPhotoPreview",
      "blogPosts",
    ]),
  },
  methods: {
    // for using the "this.method()" convention to call methods
    ...mapActions("posts", {
      updBlogTitle: "updBlogTitle",
      fileNameChange: "fileNameChange",
      createFileURL: "createFileURL",
      togglePreview: "togglePreview",
      getCertainPost: "getCertainPost",
      setBlogState: "setBlogState",
      deletePostFromDatabase: "deletePostFromDatabase",
    }),
    /**
     * used for cover photo preview, therefore, need to change the state
     */
    fileChange() {
      console.log("[There's a new photo]");
      this.coverPhoto = this.$refs.blogPhoto.files[0];
      const fileName = this.coverPhoto.name;
      console.log(`The fileName: ${fileName}`);
      this.fileNameChange(fileName); // change the state
      this.createFileURL(URL.createObjectURL(this.coverPhoto)); // create the URL
    },
    // reference: https://code-farmer-i.github.io/vue-markdown-editor/senior/upload-image.html
    // seems to upload one image every time when clicking the upload image on the toolbar
    // TODO: bug, if trigger bug, the function won't redirect to the named route
    imageHandler(event, insertImage, files) {
      console.log("[Trigger imageHandler]");
      const contentPhoto = files[0];
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
    },
    async updateBlog() {
      if (db) {
        console.log("database alive");
      }
      const document = await db
        .collection("blogPosts")
        .doc(this.$route.params.blogId);
      if (this.blogTitle.length !== 0 && this.text.length !== 0) {
        if (this.coverPhoto) {
          this.loading = true;
          console.log("[All validations passed]");
          // this.coverPhoto = this.$refs.blogPhoto.files[0]
          const timestamp = Date.now();
          const fileName = this.coverPhoto.name;
          const uniqueFileName = fileName + timestamp;
          // const url = URL.createObjectURL(this.coverPhoto)
          const storageRef = firebase.storage().ref();
          // file name should be unique, othwise, might get 403: https://stackoverflow.com/questions/41943860/getting-403-forbidden-error-when-trying-to-load-image-from-firebase-storage
          const docRef = storageRef.child(
            `documents/BlogCoverPhotos/${uniqueFileName}`
          );

          const uploadTask = docRef.put(this.coverPhoto);
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
              this.loading = false;
            },
            async () => {
              uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                console.log("The URL back from firebase:" + url);
                console.log("The database id: " + document.id);
                document.update({
                  blogHTML: DOMPurify.sanitize(this.text),
                  blogCoverPhoto: url,
                  blogCoverPhotoName: uniqueFileName,
                  blogTitle: this.blogTitle,
                });
              });
              this.loading = true;
              console.log("[Route to the new post]");
              this.loading = false;
              await this.$router.push({
                name: "ViewBlog",
                params: { blogId: document.id },
              });
            }
          );
          return;
        }
        // if there's no new cover photo, just update the HTML and title
        this.loading = true;
        await document.update({
          blogHTML: this.text,
          blogTitle: this.blogTitle,
        });
        this.loading = false;
        this.$router.push({
          name: "ViewBlog",
          params: { blogId: document.id },
        });
      }
      this.error = true;
      this.errorMsg = "Please ensure Blog Title & Blog Post has been filled";
      setTimeout(() => {
        this.error = false;
      }, 5000);
      return;
    },
  },
  async mounted() {
    const docRef = await db
      .collection("blogPosts")
      .doc(this.$route.params.blogId);
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          // console.log("Document data:", doc.data())
          this.currentBlog = doc.data();
          console.log(`The currentBlog is: ${this.currentBlog}`);
          console.log("--------------------------------------------");
          console.log("Bring the data back to the editor");
          this.text = this.currentBlog.blogHTML; // data return
          this.blogTitle = this.currentBlog.blogTitle; // data return
          console.log("--------------------------------------------");
          console.log(
            `The blogCoverPhotoName: ${this.currentBlog.blogCoverPhotoName}`
          );
          console.log(`The blogCoverPhoto: ${this.currentBlog.blogCoverPhoto}`);
          // need to set the state
          console.log("--------------------------------------------");
          // this.fileNameChange(this.currentBlog.blogCoverPhotoName) // bring it back to state to reflect in computed property
          // console.log("[Check the filename state]")
          // console.log(`The filename state: ${this.blogCoverPhotoName}`)
          console.log("--------------------------------------------");
          // this.createFileURL(this.currentBlog.blogCoverPhoto) // bring it back to state to reflect in computed peoperty
          // console.log("[Check the URL]")
          // this.coverPhoto = this.currentBlog[0].blogCoverPhoto
          // console.log(`The URL: ${this.blogPhotoFileURL}`)
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
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
