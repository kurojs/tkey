<template>
  <div id="app">
    <p class="font-italic">(This is a testing application. Please open console for debugging)</p>
    <div :style="{ marginTop: '20px' }">
      <input type="checkbox" id="mocked" v-model="isMocked" />
      <label for="mocked">Mock logins</label>
    </div>
    <div :style="{ marginTop: '20px' }" v-if="!isMocked">
      <span :style="{ marginRight: '6px' }">Verifier:</span>
      <select v-model="selectedVerifier">
        <option :key="login" v-for="login in Object.keys(verifiers)" :value="login">{{ verifiers[login].name }}</option>
      </select>
    </div>
    <div :style="{ marginTop: '20px' }" v-if="selectedVerifier === 'passwordless' && !isMocked">
      <input type="email" v-model="loginHint" placeholder="Enter your email" />
    </div>
    <div :style="{ marginTop: '20px' }">
      <h4>Login and Resets</h4>
      <button @click="login" v-if="!isMocked">Login</button>
      <button @click="createNewKey">Create new key</button>
      <button @click="getKeyDetails">Get key details</button>
      <button @click="getSDKObject">Get SDK object</button>
      <button @click="reconstructKey">Reconstuct key</button>
    </div>
    <div id="console">
      <p>{{ consoleOutput }}</p>
    </div>
  </div>
</template>

<script>
import ThresholdKey from "@tkey/default";
import WebStorageModule from "@tkey/web-storage";
import SecurityQuestionsModule from "@tkey/security-questions";
import BaseServiceProvider from "@tkey/service-provider-base";
import TorusServiceProvider from "@tkey/service-provider-torus";
import TorusStorageLayer from "@tkey/storage-layer-torus";

const GOOGLE = "google";
const FACEBOOK = "facebook";
const REDDIT = "reddit";
const DISCORD = "discord";
const TWITCH = "twitch";
const GITHUB = "github";
const APPLE = "apple";
const LINKEDIN = "linkedin";
const TWITTER = "twitter";
const WEIBO = "weibo";
const LINE = "line";
const EMAIL_PASSWORD = "email_password";
const PASSWORDLESS = "passwordless";
const HOSTED_EMAIL_PASSWORDLESS = "hosted_email_passwordless";
const HOSTED_SMS_PASSWORDLESS = "hosted_sms_passwordless";
const AUTH_DOMAIN = "https://torus-test.auth0.com";
const AGGREGATE_LOGIN_PARAMS = {
  aggregateVerifierType: "single_id_verifier",
  verifierIdentifier: "tkey-google",
  subVerifierDetailsArray: [
    {
      clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
      typeOfLogin: "google",
      verifier: "torus",
    },
  ],
};

export default {
  data() {
    return {
      consoleOutput: "",
      isMocked: true,
      loginHint: "",
      selectedVerifier: "google",
      verifiers: {
        [GOOGLE]: {
          name: "Google",
          typeOfLogin: "google",
          clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
          verifier: "google-lrc",
        },
        [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "617201755556395", verifier: "facebook-lrc" },
        [REDDIT]: { name: "Reddit", typeOfLogin: "reddit", clientId: "YNsv1YtA_o66fA", verifier: "torus-reddit-test" },
        [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "f5and8beke76mzutmics0zu4gw10dj", verifier: "twitch-lrc" },
        [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "682533837464666198", verifier: "discord-lrc" },
        [EMAIL_PASSWORD]: {
          name: "Email Password",
          typeOfLogin: "email_password",
          clientId: "sqKRBVSdwa4WLkaq419U7Bamlh5vK1H7",
          verifier: "torus-auth0-email-password",
        },
        [PASSWORDLESS]: {
          name: "Passwordless",
          typeOfLogin: "passwordless",
          clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
          verifier: "torus-auth0-passwordless",
        },
        [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "m1Q0gvDfOyZsJCZ3cucSQEe9XMvl9d9L", verifier: "torus-auth0-apple-lrc" },
        [GITHUB]: { name: "Github", typeOfLogin: "github", clientId: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff", verifier: "torus-auth0-github-lrc" },
        [LINKEDIN]: { name: "Linkedin", typeOfLogin: "linkedin", clientId: "59YxSgx79Vl3Wi7tQUBqQTRTxWroTuoc", verifier: "torus-auth0-linkedin-lrc" },
        [TWITTER]: { name: "Twitter", typeOfLogin: "twitter", clientId: "A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO", verifier: "torus-auth0-twitter-lrc" },
        [WEIBO]: { name: "Weibo", typeOfLogin: "weibo", clientId: "dhFGlWQMoACOI5oS5A1jFglp772OAWr1", verifier: "torus-auth0-weibo-lrc" },
        [LINE]: { name: "Line", typeOfLogin: "line", clientId: "WN8bOmXKNRH1Gs8k475glfBP5gDZr9H1", verifier: "torus-auth0-line-lrc" },
        [HOSTED_EMAIL_PASSWORDLESS]: {
          name: "Hosted Email Passwordless",
          typeOfLogin: "jwt",
          clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
          verifier: "torus-auth0-passwordless",
        },
        [HOSTED_SMS_PASSWORDLESS]: {
          name: "Hosted SMS Passwordless",
          typeOfLogin: "jwt",
          clientId: "nSYBFalV2b1MSg5b2raWqHl63tfH3KQa",
          verifier: "torus-auth0-sms-passwordless",
        },
      },
    };
  },

  computed: {
    verifiersToConnections() {
      return {
        [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
        [PASSWORDLESS]: { domain: AUTH_DOMAIN, login_hint: this.loginHint },
        [HOSTED_EMAIL_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "", isVerifierIdCaseSensitive: false },
        [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },
        [APPLE]: { domain: AUTH_DOMAIN },
        [GITHUB]: { domain: AUTH_DOMAIN },
        [LINKEDIN]: { domain: AUTH_DOMAIN },
        [TWITTER]: { domain: AUTH_DOMAIN },
        [WEIBO]: { domain: AUTH_DOMAIN },
        [LINE]: { domain: AUTH_DOMAIN },
      };
    },
  },

  watch: {
    async isMocked() {
      return this.init();
    },
  },

  methods: {
    async init() {
      this.tkey = null;

      const webStorage = new WebStorageModule();
      const securityQuestions = new SecurityQuestionsModule();
      const serviceProvider = this.isMocked
        ? new BaseServiceProvider({ postboxKey: "f1f02ee186749cfe1ef8f957fc3d7a5b7128f979bacc10ab3b2a811d4f990852" })
        : new TorusServiceProvider({
            directParams: {
              baseUrl: `${location.origin}/serviceworker`,
              proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
              network: "testnet", // details for test net
            },
          });
      if (!this.isMocked) {
        await serviceProvider.init({ skipSw: false });
      }

      const storageLayer = new TorusStorageLayer({ hostUrl: "https://metadata.tor.us", serviceProvider });

      this.tkey = new ThresholdKey({
        serviceProvider,
        storageLayer,
        modules: {
          webStorage,
          securityQuestions,
        },
      });
    },
    async login() {
      if (!this.tkey) return;
      if (this.isMocked) {
        alert("'Login' is only available for non-mocked mode.");
        return;
      }

      this.console("Logging in...");

      const jwtParams = this.verifiersToConnections[this.selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = this.verifiers[this.selectedVerifier];

      await this.tkey.serviceProvider.triggerHybridAggregateLogin({
        singleLogin: {
          typeOfLogin,
          verifier,
          clientId,
          jwtParams,
        },
        aggregateLoginParams: AGGREGATE_LOGIN_PARAMS,
      });
      await this.afterLogin();
    },
    async afterLogin() {
      const initDetails = await this.tkey.initialize();

      let shareDescriptions = Object.assign({}, initDetails.shareDescriptions);
      Object.keys(shareDescriptions).forEach((el) => {
        shareDescriptions[el] = shareDescriptions[el].map((jl) => {
          return JSON.parse(jl);
        });
      });

      let priorityOrder = ["webStorage", "securityQuestions"];
      let sortedShareDescriptions = Object.values(shareDescriptions)
        .flatMap((x) => x)
        .sort((a, b) => {
          return priorityOrder.indexOf(a.module) - priorityOrder.indexOf(b.module);
        });
      if (sortedShareDescriptions.length === 0 && requiredShares > 0) {
        throw new Error("No share description available. New key assign may be required or contact support.");
      }

      let requiredShares = initDetails.requiredShares;
      while (requiredShares > 0 && sortedShareDescriptions.length > 0) {
        let currentPriority = sortedShareDescriptions.shift();
        if (currentPriority.module === "webStorage") {
          try {
            await this.tkey.modules.webStorage.inputShareFromWebStorage();
            requiredShares--;
          } catch (err) {
            console.log("Couldn't find device share.");
          }
        } else if (currentPriority.module === "securityQuestions") {
          throw new Error("Password is required.");
        }
      }

      if (sortedShareDescriptions.length === 0 && requiredShares > 0) {
        throw new Error("New key assign is required.");
      }

      this.console("Logged in!");
    },
    async createNewKey() {
      if (!this.tkey) return;
      const result = await this.tkey.initializeNewKey({ initializeModules: true });
      this.console(result);
    },
    async reconstructKey() {
      let key = await this.tkey.reconstructKey();
      this.console(key);
    },
    getKeyDetails() {
      this.console(this.tkey.getKeyDetails());
    },
    getSDKObject() {
      this.console(this.tkey);
    },
    console(...args) {
      console.log(...args);
      this.consoleOutput = JSON.stringify(args, null, 2);
    },
  },

  async mounted() {
    return this.init();
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#font-italic {
  font-style: italic;
}
button {
  margin: 0 10px 10px 0;
}
#console {
  border: 1px solid black;
  min-height: 80px;
  margin-top: 20px;
  padding: 2px;
  text-align: left;
  width: calc(100% - 20px);
  border-radius: 5px;
}
#console::before {
  content: "Console";
  position: absolute;
  top: -20px;
  font-size: 12px;
}
#console > p {
  margin: 0.5em;
  word-wrap: break-word;
}
</style>
