<script lang="ts">
import { useSound } from '@vueuse/sound';
import { defineComponent, watch, ref, computed } from "vue";
import SW_Klaxon from "../assets/SW_Klaxon.mp3";
import { soundEnabled } from "../store/soundState";

export default defineComponent({
  props: {
    step: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const klaxon = useSound(SW_Klaxon);
    console.log("Klaxon Error", klaxon);
    let playCount = ref(0);

    watch(
      () => props.step,
      (newStep: any, oldStep: any) => {
        if (
          newStep?.result === "FAILED" &&
          oldStep?.result !== "FAILED" &&
          soundEnabled.value
        ) {
          playCount.value = 0;
          playKlaxon();
        }
      }
    );

    const playKlaxon = () => {
      console.log("playKlaxon called");
      if (playCount.value < 3) {
        console.log("Playing sound");
        klaxon.play({ volume: 1 });
        playCount.value++;
        setTimeout(playKlaxon, 2100); // waits 2 seconds before playing the sound again
      }
    };


    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) {
        return text;
      } else {
        return text.slice(0, maxLength) + "...";
      }
    };

    const getStepColor = (result: string | undefined) => {
      switch (result) {
        case "SUCCESSFUL":
          return "#1a1a66";
        case "FAILED":
          return "#961c48";
        case "Unknown Result":
          return "grey";
        case "RUNNING":
          return "#e67700";
          case "started_on":
          return "#e67700";
        case "NOT_RUN":
          return "grey";
        default:
          return "grey";
      }
    };

    // This will keep the current step reactively up-to-date.
    const curStep = computed(() => props.step);

    // We expose the pipelines ref to our template.
    return {
      getStepColor,
      truncateText,
      curStep,
      playKlaxon,
    };
  },
});
</script>

<template>
  <div
    class="pipeline-steps"
    :style="{
      backgroundColor: curStep.result ? getStepColor(curStep.result) : 'grey',
    }"
  >
    <span
      v-if="getStepColor(curStep.result) === '#e67700'"
      class="loader"
    ></span>
    <span class="step-time" v-show="getStepColor(curStep.result) !== '#e67700'">
      {{ curStep.duration_seconds ? curStep.duration_seconds + "s" : "--" }}
    </span>
    <p class="step-text">{{ truncateText(curStep.name, 14) }}</p>
  </div>
</template>

<style lang="scss">
.pipeline-steps {
  position: relative;
  top: -20px;
  border-radius: 20px;
  color: white;
  margin-top: 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  p,
  span {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  span {
    padding-top: 10px;
    margin-left: 10px;
  }
}

.center-text {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.step-time {
  font-size: 2.5em;
  text-align: center;
  color: orange;
}

.loader {
  width: 3em;
  height: 3em;
  margin-top: 0.6rem;
  margin-bottom: 0.6rem;
  border-radius: 50%;
  position: relative;
  animation: rotate 1s linear infinite;

  top: 50%;
  right: 5%;
  transform: translate(-50%, -50%);

  &::before,
  &::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    border-radius: 50%;
    border: 5px solid #fff;
    animation: prixClipFix 2s linear infinite;
  }

  &::after {
    top: 8px;
    right: 8px;
    bottom: 8px;
    left: 8px;
    transform: rotate3d(90, 90, 0, 180deg);
    border-color: #ff3d00;
  }
}

.header-loader {
  width: 19px;
  height: 19px;
  margin-left: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 50%;
  position: relative;
  animation: rotate 1s linear infinite;

  transform: translate(-50%, -50%);

  &::before,
  &::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    border-radius: 60%;
    border: 2.5px solid #fff;
    animation: prixClipFix 1s linear infinite;
  }

  &::after {
    top: 4px;
    right: 4px;
    bottom: 4px;
    left: 4px;
    transform: rotate3d(90, 90, 0, 180deg);
    border-color: #ff3d00;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes prixClipFix {
  0% {
    clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
  }

  50% {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
  }

  100% {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
  }
}

@media (max-width: 768px) {
  .pipeline-steps {
    // height: 150px;
    min-height: 100px;

    .step-text {
      font-size: 0.7em;
    }

    .step-time {
      font-size: 1.5em;
    }
  }
}
</style>
