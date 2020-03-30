<template>
  <div class="wrapper">
    <div class="chat-input">
      <textarea
        id="input"
        v-model="message"
        @input="inputInfo($event)"
        class="input"
      />
    </div>
    <div class="chat-btn display-only">
      <a @click.stop="sendMessage"
        ><span>{{ $t("SEND") }}</span></a
      >
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "",
      maxHeight: 112
    };
  },
  methods: {
    getHeight() {
      const { maxHeight } = this;
      let textarea = document.getElementById("input");
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = maxHeight + "px";
      } else {
        textarea.style.height = textarea.scrollHeight + "px";
      }
    },
    inputInfo(e) {
      let inputValue = e.target.value;
      if (inputValue === this.message) {
        let textarea = document.getElementById("input");
        textarea.style.height = textarea.offsetHeight + "px";
      }
    },
    sendMessage() {
      const { message } = this;
      let trimmedMsg = message.trim();
      this.$emit("send-message", trimmedMsg);
    }
  },
  watch: {
    message() {
      this.getHeight();
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
}
.chat-input {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  .input {
    width: 100%;
    height: 31px;
    border-radius: 10px;
    border: 1px lightgrey solid;
    font-size: 18px;
    resize: none;
    overflow: hidden;
  }
  textarea:focus {
    outline: none;
  }
}
.chat-btn {
  width: 20%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  a {
    width: 80%;
    height: 30px;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--main-color-blue);
    color: white;
    cursor: pointer;
  }
  a:active {
    -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  }
}
</style>
