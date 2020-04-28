<template>
  <div class="header">
    <div class="header-nav display-only">
      <a class="navbar-brand nav-title" style="margin-left: 10px">
        <img
          src="/static/logo.png"
          width="30"
          height="30"
          class="d-inline-block align-top"
        />
        Storyboard
      </a>
      <div v-if="id && token" class="avatar-wrapper ml-auto">
        <span class="avatar-label">{{ $t("WELCOME") }}</span>
        <span class="avatar-label">{{ username }}</span>
        <avatar
          :src="avatar"
          style="width: 40px; height: 40px; border-radius: 20px"
        />
      </div>
      <div v-else class="ml-auto">
        <div class="navbar-nav header-items">
          <div>
            <icon
              :name="computedLocaleIcon"
              style="width: 20px; height: 20px"
            />
          </div>
          <div class="header-item dropdown">
            <a
              class="nav-link nav-link-custom dropdown-toggle nav-title"
              id="navbarDropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              style="margin-left: 5px"
            >
              {{ $t("LANGUAGE") }}
            </a>
            <div
              class="dropdown-menu dropdown-menu-right"
              aria-labelledby="navbarDropdownMenuLink"
              style="position: absolute; top: 5vh"
            >
              <a class="dropdown-item" @click="changeLocale('en-US')"
                >{{ $t("EN_US") }} {{ renderCurrentLocale("en-US") }}</a
              >
              <a class="dropdown-item" @click="changeLocale('zh-CN')"
                >{{ $t("ZH_CN") }} {{ renderCurrentLocale("zh-CN") }}</a
              >
            </div>
          </div>
          <div
            v-show="!isMobile"
            :class="`header-item ${computedActiveLink('register')}`"
          >
            <router-link
              class="nav-link nav-link-custom nav-title"
              to="/register"
              >{{ $t("REGISTER") }}</router-link
            >
          </div>
          <div v-show="!isMobile">
            <div
              style="width: 2px; height: 90%; background-color: whitesmoke; border-radius: 1px"
            />
          </div>
          <div
            v-show="!isMobile"
            :class="`header-item ${computedActiveLink('login')}`"
          >
            <router-link
              class="nav-link nav-link-custom nav-title"
              to="/login"
              >{{ $t("LOGIN") }}</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import avatar from "@/components/avatar";
export default {
  components: {
    avatar
  },
  data() {
    return {
      activeItem: this.$route.path.split("/").pop()
    };
  },
  computed: {
    ...mapState("user", ["id", "token", "avatar", "username"]),
    isMobile() {
      let pathLastValue = this.$route.path.split("/").pop();
      return pathLastValue === "mobile" ? true : false;
    },
    computedActiveLink() {
      return function(item) {
        if (item === this.activeItem) return "nav-active";
        return "";
      };
    },
    computedLocaleIcon() {
      return this.$i18n.locale;
    }
  },
  methods: {
    changeLocale(localeId) {
      if (this.$i18n.locale !== localeId) {
        this.$i18n.locale = localeId;
      }
    },
    renderCurrentLocale(localeId) {
      if (this.$i18n.locale === localeId) {
        return "✓";
      }
    }
  },
  watch: {
    $route(newVal, oldVal) {
      if (newVal) return (this.activeItem = newVal.path.split("/").pop());
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  position: absolute;
  top: 0;
  left: 0;
  height: 5vh;
  width: 100%;
  min-width: 1024px;
  background-color: #090723;
  .header-nav {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
  }
  .header-items {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    .header-item {
      border: none;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      max-width: 100px;
      min-width: 60px;
      height: 100%;
      margin-left: 5px;
      margin-right: 5px;
    }
  }
  .nav-title {
    color: whitesmoke;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .nav-active {
    font-weight: bold;
  }
}
a {
  cursor: pointer;
}
.avatar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-right: 10px;
  .avatar-label {
    color: whitesmoke;
    margin-right: 10px;
  }
}

.nav-link-custom {
  border: none;
}
</style>
