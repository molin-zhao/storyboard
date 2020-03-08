<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { LOCAL_SECRET_LEN } from "@/common/config/crypto";
import { decrypt } from "@/common/utils/form";
import axios from "axios";
export default {
  name: "Storyboard-App",
  async mounted() {
    try {
      // check if the client requested from a mobile device
      let isMobile = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      let currentNavStackIsMobile =
        this.$route.path.split("/").pop() === "mobile" ? true : false;
      if (isMobile && !currentNavStackIsMobile)
        return this.$router.replace("/mobile");
      let id = localStorage.getItem("id");
      let encrypt_token = localStorage.getItem("token");
      if (!id || !encrypt_token) return;
      let secret = id.substr(0, LOCAL_SECRET_LEN);
      let token = decrypt(encrypt_token, secret);
      let host = process.env.PASSPORT_HOST;
      let url = host + `/user/token/verification?id=${id}&&token=${token}`;
      const verfResp = await this.$http.get(url);
      // either token valid or renewed
      if (verfResp.status === 200)
        return this.save_credential(verfResp.body.data);
    } catch (err) {
      if (err.status === 403) {
        // token is expired, delete user id and token
        return this.delete_credential();
      }
    }
  },
  methods: {
    ...mapActions({
      save_credential: "user/save_credential",
      delete_credential: "user/delete_credential"
    })
  },
  data() {
    return {
      loading: false
    };
  }
};
</script>

<style>
@import "./assets/font/font.css";
html,
body {
  margin: 0;
}
#app {
  /* font-family: "Avenir", Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* protect browser from scrolling along x-axis */
  overflow-x: hidden;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
  font-family: kai;
  min-width: 1024px;
  min-height: 600px;
}
#app::-webkit-scrollbar {
  display: none;
}
.btn:focus,
.btn:active,
.btn:active:focus,
.btn.active:focus,
.btn.focus,
.btn:active.focus,
.btn.active.focus {
  outline: none;
  box-shadow: none;
}
</style>
