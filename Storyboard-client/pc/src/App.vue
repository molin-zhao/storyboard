<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { LOCAL_SECRET_LEN } from "@/common/config/crypto";
import { decrypt } from "@/common/utils/form";
export default {
  name: "Storyboard-App",
  mounted() {
    // check user credential
    this.checkCredentials();
    // check if the client requested from a mobile device
    let isMobile = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    );
    let currentNavStackIsMobile =
      this.$route.path.split("/").pop() === "mobile" ? true : false;
    if (isMobile && !currentNavStackIsMobile)
      return this.$router.replace("/mobile");
  },
  computed: {
    ...mapState("user", ["id", "token", "avatar", "username", "gender"])
  },
  methods: {
    ...mapMutations({
      add_credential: "user/add_credential",
      add_userinfo: "user/add_userinfo"
    }),
    checkCredentials() {
      const { id, token, avatar, username, gender } = this;
      if (id && token) return;
      let localId = localStorage.getItem("id");
      let localEncryptedToken = localStorage.getItem("token");
      if (!localId || !localEncryptedToken) return;
      let secret = localId.substr(0, LOCAL_SECRET_LEN);
      let localToken = decrypt(localEncryptedToken, secret);
      let localAvatar = localStorage.getItem("avatar");
      let localUsername = localStorage.getItem("username");
      let localGender = localStorage.getItem("gender");
      this.add_credential({ id: localId, token: localToken });
      this.add_userinfo({
        avatar: localAvatar,
        username: localUsername,
        gender: localGender
      });
    }
  }
};
</script>

<style>
@import "./assets/font/font.css";
@import "./common/theme/container.css";
@import "./common/theme/color.css";
html,
body {
  margin: 0;
}
#app {
  /* font-family: "Avenir", Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* protect browser from scrolling along x-axis */
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
  font-family: kai;
  min-width: 1024px;
  min-height: 600px;
  position: relative;
  overflow: hidden;
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
