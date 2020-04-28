<template>
  <div class="wrapper">
    <transition name="profile">
      <set-profile v-if="finishedRegister" />
    </transition>
    <form v-show="!finishedRegister" style="width: 30%">
      <div class="form-group form-left-centered">
        <label for="exampleInputEmail1">{{ $t("EMAIL_PHONE") }}</label>
        <div class="form-row" style="width: 100%; margin: 0; padding: 0">
          <ajax-input
            :disabled="sent || status === 'done'"
            type="email"
            class="form-control"
            :style="
              computedInputStyle(
                emailOrPhoneError || computedAlreadyRegisterdError
              )
            "
            @on-change="checkEmailOrPhoneValue"
          />
        </div>
        <span
          v-if="computedAlreadyRegisterdError"
          class="form-text text-danger error-text"
          >{{ computedAlreadyRegisterdError
          }}<router-link
            :to="{
              name: 'login',
              params: { emailOrPhone: this.emailOrPhoneValue }
            }"
            >{{ this.$t("LOGIN_NOW") }}</router-link
          ></span
        >
        <span v-else class="form-text text-danger error-text">{{
          emailOrPhoneError
        }}</span>
      </div>
      <div class="form-group form-left-centered">
        <label>{{ $t("SMS_CODE") }}</label>
        <div class="form-row" style="width: 100%; margin: 0; padding: 0">
          <div class="form-row-div">
            <ajax-input
              :disabled="status === 'done'"
              type="text"
              class="form-control code-input"
              :style="`${codeError ? 'border-color:lightcoral' : null}`"
              @on-change="checkCodeError"
            />
            <a
              @click.stop="getSMSPassword"
              class="input-group-append input-group-text code-btn"
              :style="
                `
                 pointer-events: ${computedCodeBtnDisabled ? 'none' : 'auto'};
                 color: ${computedCodeBtnDisabled ? 'grey' : 'black'};
                `
              "
            >
              <span
                v-if="processing"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span v-else>{{ computedBtnText }}</span>
            </a>
          </div>
        </div>
        <span class="form-text text-danger error-text">{{ codeError }}</span>
      </div>
      <div v-if="smsPassword" class="form-group form-left-centered">
        <drag-verify
          :on-success="verifySuccess"
          :on-failure="verifyFailure"
          :start-text="$t('SLIDE_TO_RIGHT')"
          :success-text="$t('VERIFY_SUCCESS')"
        />
      </div>
      <div class="form-group form-left-centered">
        <label>{{ $t("PASSWORD") }}</label>
        <div class="form-row-div">
          <ajax-input
            :disabled="status === 'done'"
            type="password"
            class="form-control"
            :style="computedInputStyle(passwordError)"
            @on-change="checkPasswordError"
          />
        </div>
        <span class="form-text text-danger error-text">{{
          passwordError
        }}</span>
        <label>{{ $t("CONFIRM_PASSWORD") }}</label>
        <div class="form-row-div">
          <ajax-input
            :disabled="status === 'done'"
            type="password"
            class="form-control"
            :style="computedInputStyle(confirmPasswordError)"
            @on-change="checkConfirmPasswordError"
          />
        </div>
        <span class="form-text text-danger error-text">{{
          confirmPasswordError
        }}</span>
      </div>
      <div style="width: 100%; margin-top: 30px;">
        <button
          :disabled="computedRegisterBtnDisabled"
          type="submit"
          :class="computedRegisterBtnClass"
          @click.stop="registerLocal"
        >
          <span
            v-show="status === 'doing'"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-show="status === 'todo'">{{ $t("REGISTER") }}</span>
          <span v-show="status === 'done'">{{ `√${$t("REGISTERED")}` }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import {
  isEmailOrPhone,
  isEmail,
  isPhone,
  isCode,
  isPassword,
  encrypt,
  decrypt
} from "@/common/utils/form";
import ajaxInput from "@/components/ajaxInput";
import dragVerify from "@/components/dragVerify";
import setProfile from "@/components/setProfile";
import { getRandomAvatar } from "@/common/utils/form";
import { LOCAL_SECRET_LEN } from "@/common/config/crypto";
import { IMG_SRC } from "@/common/config/static";
import * as URL from "@/common/utils/url";
import { mapMutations, mapActions, mapState } from "vuex";
export default {
  components: {
    ajaxInput,
    dragVerify,
    setProfile
  },
  data() {
    return {
      status: "todo",
      sent: false,
      emailOrPhoneValue: "",
      passwordValue: "",
      confirmPasswordError: "",
      codeValue: "",
      emailOrPhoneError: "",
      codeError: "",
      passwordError: "",
      confirmPasswordError: "",
      resendTimer: null,
      resendCount: 60,
      renderInterval: null,
      registeredEmailOrPhone: [],
      processing: false,
      finishedRegister: false,
      smsPassword: ""
    };
  },
  computed: {
    computedInputStyle() {
      return function(error) {
        return `width: 100%; ${error ? "border-color: lightcoral" : null}`;
      };
    },
    computedBtnText() {
      if (this.sent) return `${this.$t("RESEND_CODE")}(${this.resendCount}s)`;
      else return `${this.$t("SEND_CODE")}`;
    },
    computedCodeBtnDisabled() {
      const { sent, processing, emailOrPhoneValue, emailOrPhoneError } = this;
      let disabled =
        sent || processing || !emailOrPhoneValue || emailOrPhoneError;
      return disabled ? true : false;
    },
    computedBtnDisabled() {
      const {
        emailOrPhoneError,
        codeError,
        emailOrPhoneValue,
        codeValue,
        passwordValue,
        passwordError
      } = this;
      let disabled =
        !emailOrPhoneValue ||
        emailOrPhoneError ||
        !codeValue ||
        codeError ||
        !passwordValue ||
        passwordError;
      return disabled ? true : false;
    },
    computedRegisterBtnClass() {
      return `btn ${
        this.status === "done" ? "btn-success" : "btn-primary"
      } register-btn btn-center`;
    },
    computedRegisterBtnDisabled() {
      const {
        emailOrPhoneValue,
        emailOrPhoneError,
        codeValue,
        codeError,
        passwordValue,
        passwordError,
        confirmPasswordValue,
        confirmPasswordError,
        status
      } = this;
      let allTouched =
        emailOrPhoneValue && codeValue && passwordValue && confirmPasswordValue;
      let withoutError =
        !emailOrPhoneError &&
        !codeError &&
        !passwordError &&
        !confirmPasswordError;
      if (allTouched && withoutError && status === "todo") return false;
      return true;
    },
    computedAlreadyRegisterdError() {
      const { registeredEmailOrPhone, emailOrPhoneValue } = this;
      if (registeredEmailOrPhone.includes(emailOrPhoneValue)) {
        return this.$t("ALREADY_REGISTERED");
      }
      return "";
    }
  },
  methods: {
    ...mapMutations({
      add_userinfo: "user/add_userinfo"
    }),
    ...mapActions({
      save_credential: "user/save_credential",
      save_userinfo: "user/save_userinfo"
    }),
    changeLoginMode() {
      this.registerByPassword = !this.registerByPassword;
    },
    async getSMSPassword() {
      try {
        let id = this.emailOrPhoneValue;
        let url = URL.GET_SMS_PASSWORD(id);
        this.processing = true;
        const res = await this.$http.get(url);
        this.smsPassword = res.data.data;
        this.processing = false;
      } catch (err) {
        if (err.status === 406) {
          let exId = err.data.data;
          const { registeredEmailOrPhone } = this;
          if (registeredEmailOrPhone.indexOf(exId) === -1) {
            this.registeredEmailOrPhone = [...registeredEmailOrPhone, exId];
          }
        }
        this.showSMSError();
        this.processing = false;
      }
    },
    async sendCode() {
      try {
        const { smsPassword, emailOrPhoneError, emailOrPhoneValue } = this;
        if (!smsPassword || emailOrPhoneError) return this.showSMSError();
        const trimmedAccount = emailOrPhoneValue.trim();
        let token = encrypt(trimmedAccount, smsPassword);
        let url = URL.POST_SMS_SEND_CODE(isPhone(trimmedAccount));
        this.processing = true;
        const res = await this.$http.post(url, {
          account: trimmedAccount,
          token
        });
        this.sent = true;
        this.resendCount = 60;
        this.renderInterval = setInterval(() => {
          if (this.resendCount > 0) return this.resendCount--;
          this.resendCount = 60;
          this.sent = false;
          clearInterval(this.renderInterval);
        }, 1000);
      } catch (err) {
        console.log(err);
        this.showSMSError();
      } finally {
        this.processing = false;
        this.smsPassword = "";
      }
    },
    checkEmailOrPhoneValue(val) {
      this.emailOrPhoneValue = val;
      this.emailOrPhoneError = isEmailOrPhone(
        this.emailOrPhoneValue,
        this.$t("EMAIL_PHONE_ERROR")
      );
    },
    checkCodeError(val) {
      this.codeValue = val;
      this.codeError = isCode(this.codeValue, this.$t("CODE_ERROR"));
    },
    checkPasswordError(val) {
      this.passwordValue = val;
      this.passwordError = isPassword(
        this.passwordValue,
        this.$t("PASSWORD_ERROR")
      );
    },
    checkConfirmPasswordError(val) {
      this.confirmPasswordValue = val;
      if (val && val !== this.passwordValue) {
        this.confirmPasswordError = this.$t("CONFIRM_PASSWORD_ERROR");
      } else {
        this.confirmPasswordError = "";
      }
    },
    async registerLocal() {
      try {
        const { emailOrPhoneValue, codeValue, passwordValue } = this;
        this.status = "doing";
        let url = URL.POST_REGISTER_LOCAL();
        let account = emailOrPhoneValue.trim();
        let password = passwordValue.trim();
        let code = codeValue.trim();
        let encryptPassword = encrypt(
          password,
          account.substr(0, LOCAL_SECRET_LEN)
        );
        let defaultGender = "m";
        let avatar = getRandomAvatar(defaultGender, IMG_SRC);
        const res = await this.$http.post(
          url,
          {
            account,
            code,
            password: encryptPassword,
            avatar,
            gender: defaultGender
          },
          {
            emulateJSON: true
          }
        );
        // register successfully
        let data = res.data.data;
        this.save_credential(data);
        this.add_userinfo(data);
        this.save_userinfo(data);
        this.showRegisterError(this.$t("REGISTER_SUCCESS"), "success");
        this.status = "done";
        setTimeout(() => {
          this.finishedRegister = true;
        }, 1000);
      } catch (err) {
        if (err.status === 406) {
          this.showSMSError(this.$t("SMS_NOT_MATCH"), "danger");
        } else {
          this.showRegisterError();
        }
        this.status = "todo";
      }
    },
    verifySuccess() {
      return this.sendCode();
    },
    verifyFailure() {
      console.log("failed");
    },
    showSMSError(message, type) {
      return this.$alert.show({
        type: type ? type : "warning",
        message: message ? message : this.$t("SMS_ERROR"),
        interval: 5000
      });
    },
    showRegisterError(message, type) {
      return this.$alert.show({
        type: type ? type : "warning",
        message: message ? message : this.$t("REGISTER_ERROR"),
        interval: 5000
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../common/theme/container.css";
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.register-btn {
  width: 100%;
  height: 40px;
  border-radius: 20px;
}
.register-method-label {
  font-size: 14px;
  font-style: oblique;
  text-decoration: underline;
}
.code-input {
  width: 60%;
}
.code-btn {
  width: calc(40% - 4px);
  margin-left: 4px;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.code-btn:active {
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.code-btn:focus {
  outline: none;
}

// before enter and after leave
.profile-enter,
.profile-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

// after enter and before leave
.profile-leave,
.profile-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.profile-enter-active,
.profile-leave-active {
  transition: all 0.35s;
}
</style>
