<template>
  <div id="app">
    <p>Note: This is a testing application. Please open console for debugging.</p>
    <div :style="{ marginTop: '16px' }">
      <input type="text" v-model="input" placeholder="Input" />
    </div>
    <div :style="{ marginTop: '16px' }">
      <button @click="getPublicKey">Get public key</button>
      <button @click="encrypt">Encrypt</button>
      <button @click="decrypt">Decrypt</button>
      <br />
    </div>
    <div id="console">
      <p>{{ consoleOutput }}</p>
    </div>
  </div>
</template>

<script>
import { getPubKeyECC } from "@tkey/common-types";
import BaseServiceProvider from "@tkey/service-provider-base";

export default {
  name: "App",
  data() {
    return {
      input: "",
      encryptedInput: "",
      consoleOutput: "",
    };
  },
  methods: {
    async init() {
      this.serviceProvider = new BaseServiceProvider({ postboxKey: "f1f02ee186749cfe1ef8f957fc3d7a5b7128f979bacc10ab3b2a811d4f990852" });
    },
    async encrypt() {
      this.encryptedInput = await this.serviceProvider.encrypt(Buffer.from(this.input));
      this.console(this.encryptedInput);
    },
    async decrypt() {
      this.input = (await this.serviceProvider.decrypt(this.encryptedInput)).toString();
      this.console(this.input);
    },
    getPublicKey() {
      this.console(getPubKeyECC(this.serviceProvider.postboxKey).toString("hex"));
    },
    console(output) {
      this.consoleOutput = typeof output === "string" ? output : JSON.stringify(output, null, 2);
      console.log(output);
    },
  },
  async mounted() {
    await this.init();
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#console {
  position: relative;
  border: 1px solid black;
  padding: 2px;
  margin-top: 36px;
  margin-left: 6px;
  width: calc(100% - 20px);
  min-height: 64px;
  border-radius: 5px;
  text-align: left;
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
button {
  margin: 0 0.5em 0.5em 0;
}
</style>
