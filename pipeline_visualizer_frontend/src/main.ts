import { createAuth0 } from "@auth0/auth0-vue";
import { createApp } from "vue";
import App from "./App.vue";
import { Quasar } from "quasar";
import axios from "axios";
// Import icon libraries
import "@quasar/extras/roboto-font/roboto-font.css";
import "@quasar/extras/material-icons/material-icons.css";
// Import Quasar css
import "quasar/src/css/index.sass";
// and placed in same folder as main.js
import router from "./router";

const myApp = createApp(App);

const auth = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
  },
});

export { auth };

//Vue mixin to set the authorization token in the request header
myApp.mixin({
  mounted() {
    const { getAccessTokenSilently } = auth;
    getAccessTokenSilently().then((token) => {
      // Set the authorization token in the request headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    });
  },
});

myApp.use(router).use(auth).use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

myApp.mount("#app");
