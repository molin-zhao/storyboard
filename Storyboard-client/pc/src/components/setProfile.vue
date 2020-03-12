<template>
  <div class="wrapper">
    <form style="width: 30%">
      <div class="form-group form-left-centered">
        <label for="username">{{ $t("USERNAME") }}</label>
        <div class="input-group flex-nowrap">
          <div class="input-group-prepend">
            <span class="input-group-text" id="addon-wrapping">@</span>
          </div>
          <input
            type="text"
            :class="`form-control ${usernameError ? 'is-invalid' : null}`"
            :placeholder="computedUsernamePlaceholder"
            v-model="selectedUsername"
          />
        </div>
        <span class="form-text text-danger error-text">{{
          usernameError
        }}</span>
      </div>
      <div class="form-group form-left-centered">
        <label>{{ $t("GENDER") }}</label>
        <div class="input-group gender">
          <div class="gender-item">
            <icon name="male" style="color: CornflowerBlue" />
            <checkmark
              @click.native.stop="selectGender('m')"
              :checked="selectedGender === 'm'"
            />
            <span class="display-only">{{ $t("MALE") }}</span>
          </div>
          <div class="gender-item">
            <icon name="female" style="color: LightPink" />
            <checkmark
              @click.native.stop="selectGender('f')"
              :checked="selectedGender === 'f'"
            />
            <span class="display-only">{{ $t("FEMALE") }}</span>
          </div>
        </div>
        <span class="form-text text-danger error-text"></span>
      </div>
      <div class="form-group form-left-centered">
        <label>{{ $t("AVATAR") }}</label>
        <div class="avatar" v-if="uploading">
          <span
            class="spinner-border spinner-border-md text-info"
            role="status"
            aria-hidden="true"
          ></span>
        </div>
        <div
          v-else
          @mouseover="mouseover('avatar')"
          @mouseleave="mouseleave('avatar')"
          class="avatar"
        >
          <avatar
            style="width: 100%;height: 100%; borderRadius: 50%; cursor: pointer"
            :src="computedAvatar"
          />
          <popover ref="avatar" style="left: 75px; bottom: -45px">
            <tooltip
              content-style="
              width: 220px;
              height: 150px;
              box-shadow: -5px 2px 5px lightgrey; 
              -webkit-box-shadow: -5px 2px 5px lightgrey;
              border: 1px solid whitesmoke;"
              arrow-placement="left"
              arrow-position="bottom: calc(50% - 10px)"
              background-color="white"
              border-color="whitesmoke"
            >
              <div class="avatar-source">
                <div
                  v-for="item in imgSrc[selectedGender]"
                  :key="item"
                  class="avatar-wrapper"
                >
                  <avatar
                    :src="item"
                    :style="computedLocalAvatarBorder(item)"
                    @click.native="selectLocalAvatar(item)"
                  />
                  <div class="img-cover" />
                </div>
                <div class="avatar-wrapper">
                  <div
                    v-if="uploadedAvatar"
                    style="uploaded-avatar"
                    @click="removeUploadedAvatar"
                  >
                    <avatar :src="uploadedAvatar" />
                    <icon
                      name="close"
                      style="position: absolute; top:2px; right: 2px"
                    />
                  </div>
                  <a v-else style="position: absolute">
                    <icon name="add" style="width: 30px; height: 30px" />
                    <input
                      id="fileChooser"
                      class="hidden-input"
                      type="file"
                      @change="chooseImage"
                      ref="fileChooser"
                      accept="image/png,image/jpeg,image/gif,image/jpg"
                    />
                  </a>
                </div>
              </div>
            </tooltip>
          </popover>
        </div>
      </div>
    </form>
    <div class="btns">
      <a class="text-primary" @click="skip">{{ $t("SKIP") }}</a>
      <a class="text-primary" @click="finish">{{ $t("FINISHED") }}</a>
    </div>
  </div>
</template>

<script>
import checkmark from "@/components/animated/checkmark";
import tooltip from "@/components/tooltip";
import popover from "@/components/popover";
import avatar from "@/components/avatar";
import { mouseover, mouseleave } from "@/common/utils/mouse";
import { generateRandomNumber } from "@/common/utils/number";
import { getRandomAvatar, compressImage } from "@/common/utils/form";
import { IMG_SRC } from "@/common/config/static";
import { mapState } from "vuex";
export default {
  components: {
    checkmark,
    tooltip,
    avatar,
    popover
  },
  data() {
    return {
      imgSrc: IMG_SRC,
      selectedGender: "m",
      localAvatar: "",
      uploadedAvatar: "group2/M00/00/00/rBEAC15qGkSAE60kAAAsnWuH4N0092.png",
      selectedUsername: "",
      usernameError: "",
      uploading: false,
      processing: false
    };
  },
  mounted() {},
  computed: {
    ...mapState("user", ["id", "token", "avatar", "gender", "username"]),
    computedAvatar() {
      const { localAvatar, avatar, uploadedAvatar } = this;
      if (uploadedAvatar) return uploadedAvatar;
      if (localAvatar) return localAvatar;
      if (avatar) return avatar;
      return this.genRandomAvatar();
    },
    computedUsernamePlaceholder() {
      const { selectedUsername, username } = this;
      if (!selectedUsername) {
        if (username) return username;
        return this.$t("USERNAME") + "...";
      }
      return selectedUsername;
    },
    computedLocalAvatarBorder() {
      return function(src) {
        const { computedAvatar } = this;
        if (src === computedAvatar) return "border: 2px LightSalmon solid";
        return "";
      };
    }
  },
  watch: {
    selectedUsername(newVal, oldVal) {
      if (newVal === "") {
        this.usernameError = this.$t("USERNAME_NOT_EMPTY");
      } else {
        this.usernameError = "";
      }
    },
    selectedGender(newVal, oldVal) {
      this.localAvatar = this.genRandomAvatar();
    }
  },
  methods: {
    mouseover,
    mouseleave,
    chooseImage(e) {
      let fileDOM = this.$refs["fileChooser"];
      // fileDOM.value = null;
      let file = fileDOM.files[0];
      let reader = new FileReader();
      this.uploading = true;
      reader.readAsDataURL(file);
      reader.onload = async event => {
        try {
          const src = event.target.result;
          const compressedFile = await compressImage(src, {
            width: 100,
            quality: 0.8,
            type: "file",
            name: "avatar"
          });
          let formData = new FormData();
          formData.append("file", compressedFile);
          let host = process.env.DFS_HOST;
          let url = host + "/dfs/upload";
          const uploadRes = await this.$http.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          this.uploadedAvatar = uploadRes.data.data;
          console.log(uploadRes.data.data);
          fileDOM.value = null;
        } catch (err) {
          console.log(err);
        } finally {
          this.uploading = false;
        }
      };
    },
    selectGender(val) {
      this.selectedGender = val;
    },
    genRandomAvatar() {
      const { selectedGender, imgSrc } = this;
      return getRandomAvatar(selectedGender, imgSrc);
    },
    selectLocalAvatar(item) {
      const { computedAvatar } = this;
      if (item === computedAvatar) return;
      this.localAvatar = item;
    },
    skip() {},
    async finish() {
      try {
        const {
          computedAvatar,
          avatar,
          selectedGender,
          gender,
          username,
          selectedUsername
        } = this;
        if (selectedUsername === "")
          return (this.usernameError = this.$t("USERNAME_NOT_EMPTY"));
        let avatarChanged = computedAvatar !== avatar;
        let usernameChanged = selectedUsername !== username;
        let genderChanged = selectedGender !== gender;
        if (!avatarChanged && !usernameChanged && !genderChanged)
          return this.skip();
        let host = process.env.API_HOST;
        let url = host + "/user/profile";
        const updateProfileRes = await this.$http.post(
          url,
          {
            username: selectedUsername,
            gender: selectedGender,
            avatar: computedAvatar
          },
          { emulateJSON: true }
        );
      } catch (err) {
        console.log(err);
      }
    },
    removeUploadedAvatar() {
      this.$confirm.show({
        title: this.$t("REMOVE_AVATAR_TITLE"),
        message: this.$t("REMOVE_AVATAR_MESSAGE"),
        success: async () => {
          try {
            const { uploadedAvatar } = this;
            if (!uploadedAvatar) return;
            let host = process.env.DFS_HOST;
            let url = host + `/dfs/delete?id=${uploadedAvatar}`;
            this.uploading = true;
            const rmvRes = await this.$http.delete(url);
          } catch (err) {
            console.log(err);
          } finally {
            this.uploading = false;
          }
        },
        confirmLabel: this.$t("CONFIRM"),
        cancelLabel: this.$t("CANCEL")
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  background-color: white;
  top: 0;
}
.avatar {
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  .avatar-source {
    display: flex;
    width: 210px;
    height: 140px;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    .avatar-wrapper {
      width: 70px;
      height: 70px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      img {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        cursor: pointer;
      }
      .img-cover {
        width: 100%;
        height: 100%;
        background-color: white;
        opacity: 0.5;
        position: absolute;
      }
      .uploaded-avatar {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        cursor: pointer;
      }
      a {
        width: 60px;
        height: 60px;
        border: 1px lightgrey solid;
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }
      a:active {
        -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      }
    }
  }
}
.gender {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .gender-item {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }
}
.btns {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 30%;
  height: 100px;
  a {
    cursor: pointer;
  }
}
.hidden-input {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0;
  cursor: pointer;
}
</style>
