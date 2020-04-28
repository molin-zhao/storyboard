<template>
  <div class="mainboard">
    <div class="mainboard-title">
      <div class="mainboard-title-name">
        <span style="font-size: 40px;">{{ $t("PROFILE") }}</span>
      </div>
    </div>
    <div class="mainboard-body">
      <vue-scroll :ops="ops">
        <div class="profile-wrapper">
          <div class="avatar" v-if="uploading">
            <span
              class="spinner-border spinner-border-sm text-info"
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
              icon-color="lightgrey"
              style="width: 100%;height: 100%; borderRadius: 50%; cursor: pointer"
              :src="computedAvatar"
            />
            <popover ref="avatar" style="left: 75px; bottom: -45px">
              <tooltip
                :content-style="computedAvatarPopoverStyle"
                arrow-placement="left"
                arrow-position="bottom: calc(50% - 10px)"
                background-color="white"
                border-color="whitesmoke"
              >
                <div class="avatar-source">
                  <div
                    v-for="item in imgSrc[gender]"
                    :key="item"
                    class="avatar-wrapper"
                  >
                    <avatar
                      class="img"
                      :src="item"
                      :style="computedLocalAvatarBorder(item)"
                      @click.native="selectLocalAvatar(item)"
                    />
                    <div class="img-cover" v-if="uploadedAvatar" />
                  </div>
                  <div class="avatar-wrapper">
                    <div
                      v-if="uploadedAvatar"
                      class="uploaded-avatar"
                      @click="removeUploadedAvatar"
                    >
                      <avatar
                        class="img"
                        :src="uploadedAvatar"
                        style="opacity: 0.5"
                      />
                      <div
                        style="position: absolute; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: none"
                      >
                        <icon name="delete" style="width: 20px; height: 20px" />
                      </div>
                    </div>
                    <a v-else style="position: relative">
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
          <div class="username">
            <span class="form-label-bold">{{ $t("CHANGE_USERNAME") }}</span>
            <div class="username-input">
              <input
                @change="resetUsernameError"
                :placeholder="computedUsernamePlaceholder"
                :style="computedUsernameStyle"
                v-model="selectedUsername"
              />
              <icon name="edit" style="margin-left: 5px" />
            </div>
          </div>
        </div>
        <div class="form-group form-left-centered" style="margin-left: 2%">
          <div style="form-label-wrapper">
            <span class="form-label-bold">{{ $t("LANGUAGE_SELECT") }}</span
            ><icon
              :name="computedLangIconName"
              style="width: 18px; height: 18px"
            />
          </div>
          <select
            v-model="selectedLang"
            class="custom-select"
            style="margin-top: 5px; height: 30px; width: 260px; border-radius: 10px; font-size: 14px"
          >
            <option
              :value="lang"
              v-for="(lang, index) in langSet"
              :key="index"
              >{{ computedLangName(lang) }}</option
            >
          </select>
        </div>
        <div class="btns">
          <button
            @click="updateProfile"
            :disabled="processing || !computedTouched"
            class="btn btn-primary my-btn"
          >
            <span
              v-if="processing"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else>{{ $t("CONFIRM") }}</span>
          </button>
          <button
            @click="cancelUpdate"
            :disabled="processing || !computedTouched"
            class="btn btn-danger my-btn"
          >
            <span>{{ $t("CANCEL") }}</span>
          </button>
        </div>
      </vue-scroll>
    </div>
  </div>
</template>

<script>
import vueScroll from "vuescroll";
import popover from "@/components/popover";
import tooltip from "@/components/tooltip";
import avatar from "@/components/avatar";
import * as URL from "@/common/utils/url";
import { mouseover, mouseleave } from "@/common/utils/mouse";
import { getRandomAvatar, compressImage } from "@/common/utils/form";
import { IMG_SRC } from "@/common/config/static";
import { ops } from "@/common/theme/style";
import { mapState, mapActions } from "vuex";
export default {
  components: {
    vueScroll,
    popover,
    tooltip,
    avatar
  },
  data() {
    return {
      imgSrc: IMG_SRC,
      uploadedAvatar: "",
      selectedAvatar: "",
      selectedUsername: "",
      usernameError: "",
      selectedLang: 0,
      uploading: false,
      processing: false,
      ops,
      langSet: ["en-US", "zh-CN"]
    };
  },
  created() {
    this.selectedLang = this.$i18n.locale;
    this.selectedUsername = this.username;
    this.selectedAvatar = this.avatar;
    this.usernameError = "";
  },
  computed: {
    ...mapState("user", ["id", "token", "username", "avatar", "gender"]),
    computedAvatarPopoverStyle() {
      return `
      width: 220px; 
      height: 150px; 
      box-shadow: -5px 2px 5px lightgrey; 
      -webkit-box-shadow: -5px 2px 5px lightgrey; 
      border: 1px solid whitesmoke
      `;
    },
    computedLocalAvatarBorder() {
      return function(src) {
        const { computedAvatar } = this;
        if (src === computedAvatar) return "border: 2px LightSalmon solid";
        return "";
      };
    },
    computedAvatar() {
      const { avatar, selectedAvatar, uploadedAvatar } = this;
      if (uploadedAvatar) return uploadedAvatar;
      else if (selectedAvatar) return selectedAvatar;
      else if (avatar) return avatar;
      return this.genRandomAvatar();
    },
    computedUsername() {
      const { username } = this;
    },
    computedUsernameStyle() {
      const { usernameError } = this;
      const borderStyle = usernameError ? "1px solid" : "1px dashed";
      const borderColor = usernameError ? "#d9534f" : "lightgrey";
      return `
      font-size: 15px;
      width: 50%;
      height: 100%;
      border: ${borderStyle};
      border-color: ${borderColor}; 
      border-radius: 5px;
      cursor: pointer;
      `;
    },
    computedLangName() {
      return function(lang) {
        switch (lang) {
          case "en-US":
            return this.$t("EN_US");
          case "zh-CN":
            return this.$t("ZH_CN");
          default:
            return this.$t("EN_US");
        }
      };
    },
    computedLangIconName() {
      return this.selectedLang + "-sqr";
    },
    computedTouched() {
      const {
        username,
        avatar,
        selectedUsername,
        computedAvatar,
        selectedLang
      } = this;
      const usernameTouched = selectedUsername && username !== selectedUsername;
      const avatarTouched = computedAvatar && avatar !== computedAvatar;
      const localeTouched = selectedLang && this.$i18n.locale !== selectedLang;
      if (!usernameTouched && !avatarTouched && !localeTouched) return false;
      return true;
    },
    computedUsernamePlaceholder() {
      return this.username;
    }
  },
  methods: {
    mouseover,
    mouseleave,
    ...mapActions({
      save_userinfo: "user/save_userinfo"
    }),
    selectLocalAvatar(item) {
      if (this.uploadedAvatar) return;
      if (item === this.computedAvatar) return;
      this.selectedAvatar = item;
    },
    genRandomAvatar() {
      const { gender, imgSrc, uploadedAvatar, avatar } = this;
      if (uploadedAvatar || avatar.startsWith("/static")) return;
      return getRandomAvatar(gender, imgSrc);
    },
    removeUploadedAvatar() {
      this.$confirm.show({
        title: this.$t("REMOVE_AVATAR_TITLE"),
        message: this.$t("REMOVE_AVATAR_MESSAGE"),
        success: async () => {
          try {
            const { uploadedAvatar } = this;
            if (!uploadedAvatar) return;
            let url = URL.DELETE_DFS_DELETE(uploadedAvatar);
            this.uploading = true;
            const rmvRes = await this.$http.delete(url);
            this.uploadedAvatar = "";
          } catch (err) {
            console.log(err);
          } finally {
            this.uploading = false;
          }
        },
        confirmLabel: this.$t("CONFIRM"),
        cancelLabel: this.$t("CANCEL")
      });
    },
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
          let url = URL.POST_DFS_UPLOAD();
          const uploadRes = await this.$http.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          this.uploadedAvatar = uploadRes.data.data;
          fileDOM.value = null;
        } catch (err) {
          console.log(err);
        } finally {
          this.uploading = false;
        }
      };
    },
    usernameChange(val) {
      this.selectedUsername = val;
    },
    async updateProfile() {
      try {
        const {
          computedAvatar,
          selectedUsername,
          selectedLang,
          username,
          avatar
        } = this;
        if (!selectedUsername) {
          this.usernameError = this.$t("USERNAME_NOT_EMPTY");
          console.log(this.usernameError);
          return;
        }
        let updateObj = {};
        if (selectedUsername && selectedUsername !== username)
          updateObj["username"] = selectedUsername;
        if (computedAvatar && computedAvatar !== avatar)
          updateObj["avatar"] = computedAvatar;
        if (selectedLang && selectedLang !== this.$i18n.locale)
          updateObj["locale"] = selectedLang;
        const url = URL.POST_UPDATE_USER_PROFILE();
        this.processing = true;
        const resp = await this.$http.post(url, updateObj);
        this.save_userinfo(resp.data.data);
      } catch (err) {
      } finally {
        this.processing = false;
      }
    },
    cancelUpdate() {
      const { username, avatar } = this;
      this.selectedUsername = username;
      this.selectedAvatar = avatar;
      this.uploadedAvatar = "";
      this.selectedLang = this.$i18n.locale;
      this.usernameError = "";
    },
    resetUsernameError() {
      if (this.usernameError) this.usernameError = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.hidden-input {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0;
  cursor: pointer;
}

.avatar {
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.avatar-source {
  display: flex;
  width: 210px;
  height: 140px;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
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

.avatar-wrapper {
  width: 70px;
  height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  .img {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    cursor: pointer;
  }
  .img-cover {
    width: 100%;
    height: 100%;
    background-color: white;
    opacity: 0.3;
    position: absolute;
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
.username {
  width: 350px;
  height: 70%;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  .username-input {
    width: 100%;
    height: 25px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    input:focus {
      outline: none;
    }
    div {
      width: 100px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}

.profile-wrapper {
  width: 98%;
  height: 200px;
  margin-left: 2%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.btns {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.my-btn {
  max-width: 150px;
  width: 10%;
  min-width: 80px;
  height: 40px;
  border-radius: 20px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
