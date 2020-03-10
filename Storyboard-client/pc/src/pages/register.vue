<template>
  <div class="wrapper">
    <form style="width: 26%">
      <div class="form-group form-left-centered">
        <label for="exampleInputEmail1">{{ $t("EMAIL_PHONE") }}</label>
        <div class="form-row" style="width: 100%; margin: 0; padding: 0">
          <ajax-input
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
    </form>
    <div style="width: 26%; margin-top: 30px;">
      <button
        :disabled="computedRegisterBtnDisabled"
        type="submit"
        :class="computedRegisterBtnClass"
        @click.stop="register"
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
  </div>
</template>

<script>
import {
  isEmailOrPhone,
  isEmail,
  isPhone,
  isCode,
  isPassword,
  encrypt
} from "@/common/utils/form";
import ajaxInput from "@/components/ajaxInput";
import dragVerify from "@/components/dragVerify";
export default {
  components: {
    ajaxInput,
    dragVerify
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
    changeLoginMode() {
      this.registerByPassword = !this.registerByPassword;
    },
    async getSMSPassword() {
      let id = this.emailOrPhoneValue;
      let host = process.env.PASSPORT_HOST;
      let url = host + `/user/sms/password?id=${id}`;
      this.processing = true;
      try {
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
      const { smsPassword, emailOrPhoneError, emailOrPhoneValue } = this;
      if (!smsPassword || emailOrPhoneError) return this.showSMSError();
      let token = encrypt(emailOrPhoneValue, smsPassword);
      let host = process.env.PASSPORT_HOST;
      let url =
        host + `/user/sms/${isPhone(emailOrPhoneValue) ? "phone" : "email"}`;
      this.processing = true;
      try {
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
    checkConfirmPasswordError(val) {
      this.confirmPasswordValue = val;
      if (val && val !== this.passwordValue) {
        this.confirmPasswordError = this.$t("CONFIRM_PASSWORD_ERROR");
      } else {
        this.confirmPasswordError = "";
      }
    },
    async register() {
      const { emailOrPhoneValue, codeValue, passwordValue } = this;
      this.status = "doing";
      let host = process.env.PASSPORT_HOST;
      let url = host + "/user/register";
      let encryptPassword = encrypt(passwordValue, codeValue);
      try {
        const res = await this.$http.post(
          url,
          {
            account: emailOrPhoneValue,
            code: codeValue,
            password: encryptPassword
          },
          {
            emulateJSON: true
          }
        );
        if (res.status === 200) {
          // register successfully
          let token = res.data.data;
          this.showRegisterError(this.$t("REGISTER_SUCCESS"), "success");
          this.status = "done";
        } else if (res.status === 202) {
          // code error
          this.showSMSError(this.$t("SMS_NOT_MATCH"), "danger");
          this.status = "todo";
        } else {
          this.showRegisterError();
          this.status = "todo";
        }
      } catch (err) {
        this.showRegisterError();
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
</style>
