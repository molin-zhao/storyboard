<template>
  <div class="wrapper">
    <form style="width: 26%">
      <div class="form-group form-left-centered">
        <label for="exampleInputEmail1">{{ $t("EMAIL_PHONE") }}</label>
        <div class="form-row" style="width: 100%; margin: 0; padding: 0">
          <ajax-input
            type="email"
            class="form-control"
            :style="computedInputStyle(emailOrPhoneError)"
            :init-value="computedInitEmailOrPhoneValue"
            @on-change="checkEmailOrPhoneValue"
          />
        </div>
        <span class="form-text text-danger error-text">{{
          emailOrPhoneError
        }}</span>
      </div>
      <div class="form-group form-left-centered">
        <label v-if="loginByPassword">{{ $t("PASSWORD") }}</label>
        <label v-else>{{ $t("SMS_CODE") }}</label>
        <div class="form-row" style="width: 100%; margin: 0; padding: 0">
          <div v-if="loginByPassword" class="form-row-div">
            <ajax-input
              type="password"
              class="form-control"
              :style="computedInputStyle(passwordError)"
              @on-change="checkPasswordError"
              :init-value="computedInitPasswordValue"
            />
          </div>
          <div v-else class="form-row-div">
            <ajax-input
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
        <span v-if="loginByPassword" class="form-text text-danger error-text">{{
          passwordError
        }}</span>
        <span v-else class="form-text text-danger error-text">{{
          codeError
        }}</span>
      </div>
      <div v-if="smsPassword" class="form-group form-left-centered">
        <drag-verify
          :on-success="verifySuccess"
          :on-failure="verifyFailure"
          :start-text="$t('SLIDE_TO_RIGHT')"
          :success-text="$t('VERIFY_SUCCESS')"
        />
      </div>
      <div class="form-group form-check form-space-between">
        <div class="form-group">
          <input
            type="checkbox"
            class="form-check-input"
            v-model="rememberMeValue"
          />
          <label class="form-check-label">{{ $t("REMEMBER_ME") }}</label>
        </div>
        <div
          class="form-group"
          style="cursor: pointer"
          @click.stop="changeLoginMode"
        >
          <span
            class="login-method-label text-primary"
            v-if="!loginByPassword"
            >{{ $t("LOGIN_PASSWORD") }}</span
          >
          <span class="login-method-label text-primary" v-else>{{
            $t("LOGIN_SMS")
          }}</span>
        </div>
      </div>
    </form>
    <div style="width: 26%; margin-top: 30px;">
      <button
        :disabled="computedLoginBtnDisabled"
        type="submit"
        :class="computedLoginBtnClass"
        @click.stop="login"
      >
        <span
          v-show="status === 'doing'"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        <span v-show="status === 'todo'">{{ $t("LOGIN") }}</span>
        <span v-show="status === 'done'">{{ `√${$t("LOGGEDIN")}` }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import {
  isEmailOrPhone,
  isCode,
  isPassword,
  encrypt,
  decrypt
} from "@/common/utils/form";
import { LOCAL_SECRET_LEN } from "@/common/config/crypto";
import ajaxInput from "@/components/ajaxInput";
import { mapActions } from "vuex";
export default {
  components: {
    ajaxInput
  },
  data() {
    return {
      status: "todo",
      loginByPassword: true,
      sent: false,
      emailOrPhoneValue: "",
      passwordValue: "",
      codeValue: "",
      rememberMeValue: false,
      emailOrPhoneError: "",
      codeError: "",
      passwordError: "",
      resendTimer: null,
      resendCount: 60,
      renderInterval: null,
      smsPassword: "",
      processing: false
    };
  },
  mounted() {
    this.emailOrPhoneValue = this.computedInitEmailOrPhoneValue;
    this.passwordValue = this.computedInitPasswordValue;
    this.rememberMeValue = this.computedInitRemembermeValue;
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
    computedBtnDisabled() {
      const {
        sent,
        emailOrPhoneError,
        codeError,
        emailOrPhoneValue,
        codeValue
      } = this;
      let disabled =
        sent ||
        !emailOrPhoneValue ||
        emailOrPhoneError ||
        !codeValue ||
        codeError;
      if (disabled) return true;
      return false;
    },
    computedLoginBtnClass() {
      return `btn ${
        this.status === "done" ? "btn-success" : "btn-primary"
      } login-btn btn-center`;
    },
    computedLoginBtnDisabled() {
      const {
        emailOrPhoneValue,
        emailOrPhoneError,
        codeValue,
        codeError,
        passwordValue,
        passwordError,
        status
      } = this;
      let allTouched = emailOrPhoneValue && (passwordValue || codeValue);
      let withoutError = !emailOrPhoneError && !codeError && !passwordError;
      if (allTouched && withoutError && status === "todo") return false;
      return true;
    },
    computedInitEmailOrPhoneValue() {
      if (this.$route.params.emailOrPhone)
        return this.$route.params.emailOrPhone;
      return localStorage.getItem("account");
    },
    computedInitPasswordValue() {
      if (this.$route.params.emailOrPhone) return "";
      let encryptedPass = localStorage.getItem("password");
      let account = localStorage.getItem("account");
      if (!encryptedPass || !account) return "";
      return decrypt(encryptedPass, account.substr(0, LOCAL_SECRET_LEN));
    },
    computedInitRemembermeValue() {
      if (this.$route.params.emailOrPhone) return false;
      let rememberme = localStorage.getItem("rememberme");
      return rememberme;
    },
    computedCodeBtnDisabled() {
      const { sent, processing, emailOrPhoneValue, emailOrPhoneError } = this;
      let disabled =
        sent || processing || !emailOrPhoneValue || emailOrPhoneError;
      return disabled ? true : false;
    }
  },
  methods: {
    ...mapActions({
      save_credential: "user/save_credential"
    }),
    changeLoginMode() {
      this.loginByPassword = !this.loginByPassword;
    },
    async getSMSPassword() {
      try {
        let id = this.emailOrPhoneValue;
        let host = process.env.PASSPORT_HOST;
        let url = host + `/user/sms/password?id=${id}`;
        this.processing = true;
        const res = await this.$http.get(url);
        if (res.status === 200) {
          this.smsPassword = res.data.data;
        } else if (res.status === 202) {
          // user already registered
          // 406 request not acceptable
          let exId = res.data.data;
          const { registeredEmailOrPhone } = this;
          if (registeredEmailOrPhone.indexOf(exId) === -1) {
            this.registeredEmailOrPhone = [...registeredEmailOrPhone, exId];
          }
        } else {
          this.showSMSError();
        }
        this.processing = false;
      } catch (err) {
        console.log(err);
        this.showSMSError();
        this.processing = false;
      }
    },
    async sendCode() {
      try {
        const { smsPassword, emailOrPhoneError, emailOrPhoneValue } = this;
        if (!smsPassword || emailOrPhoneError) return this.showSMSError();
        let token = encrypt(emailOrPhoneValue, smsPassword);
        let host = process.env.PASSPORT_HOST;
        let url =
          host + `/user/sms/${isPhone(emailOrPhoneValue) ? "phone" : "email"}`;
        this.processing = true;
        const res = await this.$http.post(
          url,
          { account: emailOrPhoneValue, token },
          { emulateJSON: true }
        );
        if (res.status === 200) {
          this.sent = true;
          this.resendCount = 60;
          this.renderInterval = setInterval(() => {
            if (this.resendCount > 0) return this.resendCount--;
            this.resendCount = 60;
            this.sent = false;
            clearInterval(this.renderInterval);
          }, 1000);
        } else {
          this.showSMSError();
        }
        this.processing = false;
        this.smsPassword = "";
      } catch (err) {
        console.log(err);
        this.showSMSError();
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
    async login() {
      try {
        const {
          emailOrPhoneValue,
          codeValue,
          passwordValue,
          loginByPassword
        } = this;
        this.status = "doing";
        let host = process.env.PASSPORT_HOST;
        let url = host + `/user/login/${loginByPassword ? "password" : "sms"}`;
        let body = loginByPassword
          ? {
              account: emailOrPhoneValue,
              password: encrypt(
                passwordValue,
                emailOrPhoneValue.substr(0, LOCAL_SECRET_LEN)
              )
            }
          : { account: emailOrPhoneValue, code: codeValue };
        const res = await this.$http.post(url, body, {
          emulateJSON: true
        });
        if (res.status === 200) {
          // login successfully
          let credential = res.data.data;
          this.showLoginError(this.$t("LOGIN_SUCCESS"), "success");
          this.status = "done";
          this.save_credential(credential);
          if (this.rememberMeValue) {
            localStorage.setItem("rememberme", this.rememberMeValue);
            localStorage.setItem("account", emailOrPhoneValue);
            if (emailOrPhoneValue)
              localStorage.setItem(
                "password",
                encrypt(
                  passwordValue,
                  emailOrPhoneValue.substr(0, LOCAL_SECRET_LEN)
                )
              );
          }
          setTimeout(() => {
            this.$router.replace("/storyboard");
          }, 1000);
        } else if (res.status === 202) {
          // code error
          if (loginByPassword) {
            this.showLoginError(this.$t("PASSWORD_NOT_MATCH"), "danger");
          } else {
            this.showSMSError(this.$t("SMS_NOT_MATCH"), "danger");
          }
          this.status = "todo";
        } else {
          this.showLoginError();
          this.status = "todo";
        }
      } catch (err) {
        this.showLoginError();
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
    showLoginError(message, type) {
      return this.$alert.show({
        type: type ? type : "warning",
        message: message ? message : this.$t("LOGIN_ERROR"),
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
.login-btn {
  width: 100%;
  height: 40px;
  border-radius: 20px;
}
.login-method-label {
  font-size: 14px;
  font-style: oblique;
  text-decoration: underline;
}
.code-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  width: 60%;
}
.code-btn {
  width: calc(40% - 1px);
  margin-left: 1px;
  height: 100%;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}
.code-btn:active {
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.code-btn:focus {
  outline: none;
}
.error-text {
  font-size: 14px;
  line-height: 14px;
  min-height: 28px;
  max-width: 100%;
}
</style>
