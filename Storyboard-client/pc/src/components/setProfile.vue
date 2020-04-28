<template>
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
      <span class="form-text text-danger error-text">{{ usernameError }}</span>
    </div>
    <div class="form-group form-left-centered">
      <label>{{ $t("GENDER") }}</label>
      <div class="input-group gender">
        <div class="gender-item">
          <icon name="male" style="color: cornflowerblue" />
          <checkmark
            @click.native.stop="selectGender('m')"
            :checked="selectedGender === 'm'"
          />
          <span class="display-only">{{ $t("MALE") }}</span>
        </div>
        <div class="gender-item">
          <icon name="female" style="color: lightpink" />
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
            border: 1px solid whitesmoke;
            "
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
    </div>
    <div class="btns">
      <a class="text-primary" @click="skip">{{ $t("SKIP") }}</a>
      <span
        v-if="processing"
        class="spinner-border spinner-border-md text-primary"
        role="status"
        aria-hidden="true"
      ></span>
      <a v-else class="text-primary" @click="finish">{{ $t("FINISHED") }}</a>
    </div>
  </form>
</template>

<script>
import checkmark from "@/components/animated/checkmark";
import tooltip from "@/components/tooltip";
import popover from "@/components/popover";
import avatar from "@/components/avatar";
import { mouseover, mouseleave } from "@/common/utils/mouse";
import { getRandomAvatar, compressImage } from "@/common/utils/form";
import { IMG_SRC } from "@/common/config/static";
import * as URL from "@/common/utils/url";
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
      uploadedAvatar: "",
      selectedGender: "m",
      selectedAvatar: "",
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
      const { avatar, selectedAvatar, uploadedAvatar } = this;
      if (uploadedAvatar) return uploadedAvatar;
      if (selectedAvatar) return selectedAvatar;
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
    },
    computedTouched() {
      const {
        computedAvatar,
        selectedUsername,
        selectedGender,
        avatar,
        username,
        gender
      } = this;
      let avatarChanged = computedAvatar && computedAvatar !== avatar;
      let usernameChanged = selectedUsername && selectedUsername !== username;
      let genderChanged = selectedGender && selectedGender !== gender;
      if (!avatarChanged && !usernameChanged && !genderChanged) return false;
      return true;
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
      if (!uploadedAvatar) this.selectedAvatar = this.genRandomAvatar();
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
    selectGender(val) {
      this.selectedGender = val;
    },
    genRandomAvatar() {
      const { selectedGender, imgSrc, uploadedAvatar, avatar } = this;
      if (uploadedAvatar || avatar.startsWith("/static")) return;
      return getRandomAvatar(selectedGender, imgSrc);
    },
    selectLocalAvatar(item) {
      if (this.uploadedAvatar) return;
      if (item === this.computedAvatar) return;
      this.selectedAvatar = item;
    },
    skip() {
      this.$router.replace("/storyboard");
    },
    async finish() {
      try {
        const {
          computedAvatar,
          computedTouched,
          avatar,
          selectedGender,
          gender,
          username,
          selectedUsername
        } = this;
        if (!selectedUsername) {
          this.usernameError = this.$t("USERNAME_NOT_EMPTY");
          return;
        }
        if (!computedTouched) return this.$router.replace("/storyboard");
        let updateObj = {};
        if (computedAvatar && computedAvatar !== avatar)
          updateObj["avatar"] = computedAvatar;
        if (selectedUsername && selectedUsername !== username)
          updateObj["username"] = selectedUsername;
        if (selectedGender && selectedGender !== gender)
          updateObj["gender"] = selectedGender;

        let url = URL.POST_UPLOAD_USER_PROFILE();
        this.processing = true;
        const updateProfileRes = await this.$http.post(url, updateObj);
        this.$router.replace("/storyboard");
      } catch (err) {
        console.log(err);
      } finally {
        this.processing = false;
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
    }
  }
};
</script>

<style lang="scss" scoped>
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
  width: 100%;
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
</style>
