<script lang="ts">
import { defineComponent } from "vue";
import loginButton from "./buttons/login-button.vue";
import logoutButton from "./buttons/logout-button.vue";
import signupButton from "./buttons/signup-button.vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { soundEnabled } from "../store/soundState";

export default defineComponent({
  name: "Navbar",
  components: {
    loginButton,
    logoutButton,
    signupButton,
  },
  data() {
    return {
      isNavbarVisible: false,
    };
  },
  methods: {
    showNavbar() {
      this.isNavbarVisible = true;
    },
    hideNavbar() {
      this.isNavbarVisible = false;
    },
  },
  setup() {
    const { isAuthenticated } = useAuth0();

    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value;
    };

    return {
      isAuthenticated,
      soundEnabled,
      toggleSound,
    };
  },
});
</script>

<template>
  <nav class="navbar">
  <div
    class="fixed-bottom"
    :class="{ visible: isNavbarVisible }"
    @mouseover="showNavbar"
    @mouseout="hideNavbar"
    style="z-index: 100; background-color: rgb(37, 207, 213)"
  >
    <q-bar>
      <template v-if="!isAuthenticated">
        <!-- <signup-button /> -->
        <login-button />
      </template>
      <template v-if="isAuthenticated">
        <logout-button />
      </template>

      <q-space />

      <q-btn href="#" dense flat icon="refresh" />
      <q-btn @click="toggleSound">{{
        soundEnabled ? "Sound OFF" : "Sound ON"
      }}</q-btn>
    </q-bar>
  </div>
</nav>
</template>

<style lang="scss" scoped>

.navbar {
  .fixed-bottom {
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.fixed-bottom.visible {
  opacity: 1;
}
}

@media (max-width: 768px) {
  .navbar {
    .fixed-bottom {
      
      opacity: 1;
    }

  }
}

</style>
