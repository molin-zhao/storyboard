<template>
  <transition name="fade">
    <div
      v-show="visible"
      class="chat-wrapper"
      :style="`font-family: ${font}`"
      @click="hide"
    >
      <div class="chat-content-wrapper" @click.stop="stopPropagation">
        <transition name="sidebar">
          <div v-show="visible" class="chat-content shadow">
            <div class="chat-header">
              <a class="chat-close" @click.stop="hide"
                ><icon name="close" style="width: 70%; height: 70%"
              /></a>
            </div>
            <span
              v-if="!to || loading"
              class="spinner-border spinner-border-bg"
              role="status"
              aria-hidden="true"
            ></span>
            <div v-else class="chat">
              <div class="chat-user">
                <div class="chat-user-avatar-wrapper">
                  <avatar
                    class="chat-user-avatar"
                    :user-id="to._id"
                    :src="to.avatar"
                  />
                </div>
                <div class="chat-user-meta">
                  <div class="chat-user-label">
                    <icon
                      v-if="to.gender === 'm'"
                      name="male"
                      style="color: cornflowerblue"
                    />
                    <icon v-else name="female" style="color: lightpink" />
                    <online-status
                      style="margin-left: 5px"
                      :status="onlineStatus"
                    />
                  </div>
                  <div class="chat-user-name">
                    <span>{{ to.username }}</span>
                  </div>
                </div>
              </div>
              <div class="chat-body">
                <vue-scroll :ops="ops">
                  <div
                    v-for="(message, index) in messages[to._id]"
                    :key="index"
                    class="message-wrapper"
                  >
                    <div class="message-from" v-if="message.from === to._id">
                      <div class="message-avatar">
                        <avatar
                          style="width: 30px; height: 30px; border-radius: 15px"
                        />
                      </div>
                      <div class="message-content">
                        <div style="background-color: #5cb85c">
                          <span>{{ message.content }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="message-to" v-else>
                      <div class="message-avatar">
                        <avatar
                          style="width: 30px; height: 30px; border-radius: 15px"
                        />
                      </div>
                      <div class="message-content">
                        <div style="background-color: whitesmoke">
                          <span>{{ message.content }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </vue-scroll>
                <div class="chat-input">
                  <chat-input />
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>
import sidebar from "@/components/sidebar";
import vueScroll from "vuescroll";
import avatar from "@/components/avatar";
import onlineStatus from "@/components/onlineStatus";
import chatInput from "@/components/chatInput";
import { stopPropagation } from "@/common/utils/mouse";
import { mapState, mapMutations } from "vuex";
import * as URL from "@/common/utils/url";
export default {
  components: {
    sidebar,
    vueScroll,
    avatar,
    onlineStatus,
    chatInput
  },
  props: {
    to: {
      type: Object,
      default: () => null
    },
    font: {
      type: String,
      default: "kai"
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      ops: {
        vuescroll: {
          mode: "native"
        },
        scrollPanel: {
          scrollingX: false
        },
        bar: {
          background: "lightgrey"
        }
      },
      onlineStatus: false
    };
  },
  computed: {
    ...mapState("user", ["id", "token"]),
    ...mapState("message", ["messages"])
  },
  methods: {
    stopPropagation,
    show() {
      if (!this.visible) {
        this.visible = true;
      }
    },
    hide() {
      if (this.visible) {
        this.visible = false;
      }
    }
  },
  watch: {
    async to(newVal, oldVal) {
      if (newVal) {
        try {
          const { _id } = newVal;
          this.loading = true;
          let url = URL.GET_USER_ONLINE(_id);
          const resp = await this.$http.get(url);
          this.onlineStatus = resp.data.data;
        } catch (err) {
          console.log(err);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.chat-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10040 !important;
  background-color: #0000001a;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.chat-content-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}
.chat-content {
  position: absolute;
  width: 400px;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chat {
  width: 100%;
  margin-top: 30px;
  height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  .chat-user {
    width: 100%;
    height: 10%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px gainsboro solid;
    .chat-user-avatar-wrapper {
      height: 100%;
      width: 20%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }
    .chat-user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 25px;
    }
    .chat-user-meta {
      width: calc(100% - 50px);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .chat-user-label {
      width: 100%;
      height: 25%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
    .chat-user-name {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: nowrap;
      width: 100%;
      height: 25%;
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
        white-space: nowrap;
        width: 95%;
      }
    }
  }
  .chat-body {
    width: 100%;
    height: 90%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: lightblue;
  }
}
.chat-header {
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
.chat-close {
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: all 0.35s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}
.chat-input {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: whitesmoke;
}

.message-wrapper {
  width: 100%;
  height: auto;
}
.message-from {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}
.message-to {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
}
.message-avatar {
  width: 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.message-content {
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  div {
    flex-wrap: wrap;
    border: 1px lightgrey solid;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    span {
      font-size: 16px;
      color: black;
    }
  }
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.fade-leave,
.fade-enter-to {
  opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.sidebar-enter,
.sidebar-leave-to {
  opacity: 0;
  //   transform: translateX(400px);
  right: -400px;
}
.sidebar-leave,
.sidebar-enter-to {
  opacity: 1;
  //   transform: translateX(0);
  right: 0px;
}
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.35s;
}
</style>
