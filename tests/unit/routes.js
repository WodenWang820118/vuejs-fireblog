import Home from "@/views/Home.vue";
import Login from "@/views/Login";
import ForgotPassword from "@/views/ForgotPassword";
import Register from "@/views/Register";
import Blogs from "@/views/Blogs";

const routes = [
    {
      path: "/",
      name: "Home",
      props: true,
      component: Home,
      meta: {
        title: "Home",
      },
    },
    {
      path: "/blogs",
      name: "Blogs",
      props: true,
      component: Blogs,
      meta: {
        title: "Blogs",
      },
    },
    {
      path: "/login",
      name: "Login",
      props: true,
      component: Login,
      meta: {
        title: "Login",
      },
    },
    {
      path: "/register",
      name: "Register",
      props: true,
      component: Register,
      meta: {
        title: "Register",
      },
    },
    {
      path: "/forgot-password",
      name: "ForgotPassword",
      props: true,
      component: ForgotPassword,
      meta: {
        title: "Forgot Password",
      },
    },
    {
      path: "/profile",
      name: "Profile",
      props: true,
      component: () => import("@/views/Profile.vue"),
      meta: {
        title: "Profile",
      },
    },
    {
      path: "/create-post",
      name: "CreatePost",
      props: true,
      component: () => import("@/views/CreatePost.vue"),
      meta: {
        title: "Create Post",
      },
    },
    {
      path: "/view-blog/:blogId",
      name: "ViewBlog",
      props: true,
      component: () => import("@/views/ViewBlog.vue"),
      meta: {
        title: "View Blog",
      },
    },
    {
      path: "/edit-post/:blogId",
      name: "EditBlog",
      props: true,
      component: () => import("@/views/EditBlog.vue"),
      meta: {
        title: "Edit Blog Post",
      },
    },
  ];

export default routes; 