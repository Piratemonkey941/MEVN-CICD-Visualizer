<script lang="ts">
// imports necessary functions and components from vue and quasar.
import { defineComponent, ref, onMounted } from "vue";
import Step from "./Step.vue";
import { auth } from "../main";
import { QCard, QCardSection, QSeparator } from "quasar";


// Defines an interface for Steps data.
interface Step {
  _id?: string;
  name: string;
  result?: string;
  started_on?: string;
  duration_seconds: number;
  completed_on?: string;
}

// Defines an interface for Pipeline data.
interface Pipeline {
  _id: string;
  build_number: number;
  branch_name: string;
  uuid: string;
  status: string;
  duration_seconds: number;
  build_seconds_used?: number;
  steps: Step[];
  started_on?: string;
  created_on?: string;
  completed_on?: string;
}

export default defineComponent({
  components: {
    QCard,
    QCardSection,
    QSeparator,
    Step,
  },

  methods: {
    formatTimestamp(timestamp: string | undefined) {
      if (!timestamp) return "";

      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    refreshPage() {
    location.reload();
  }

  },

  setup() {
    // Creates a ref to hold our pipelines data.
    const pipelines = ref<Pipeline[]>([]);

    // Initialize expansion states. Only the first two are expanded.
    const expansionStates = ref<boolean[]>([true, true]);

    const stepsName = ref<Step[]>([]);
    const searchTerm = ref('');
    const isNavbarVisible = ref(false);


    // Creates an async function to fetch the pipelines data.
    const fetchData = async () => {
      try {
        const token = await auth.getAccessTokenSilently();
        const response = await fetch(
          `${import.meta.env.VITE_API_SERVER_URL}/pipelines`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        pipelines.value = data;
        // console.log("Pipelines Info", pipelines); //provides data to console for debugging purposes

        // only update expansionStates if a new pipeline was added
        if (data.length > expansionStates.value.length) {
          // for new pipelines, expand the first two and collapse the rest
          const newExpansionStates = data.map(
            (_: Pipeline, index: any) => index < 2
          );
          expansionStates.value = newExpansionStates;
        }
      } catch (error) {
        console.error("Error fetching pipelines:", error);
      }
    };

    const searchPipelines = async () => {
      try {
        const token = await auth.getAccessTokenSilently();
        console.log(token)
        console.log(searchTerm.value)
        const response = await fetch(
          `${import.meta.env.VITE_API_SERVER_URL}/pipelines/${searchTerm.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        pipelines.value = data;
        // console.log("Pipelines Info", pipelines); //provides data to console for debugging purposes

        // only update expansionStates if a new pipeline was added
        if (data.length > expansionStates.value.length) {
          // for new pipelines, expand the first two and collapse the rest
          const newExpansionStates = data.map(
            (_: Pipeline, index: any) => index < 2
          );
          expansionStates.value = newExpansionStates;
        }
      } catch (error) {
        console.error("Error fetching pipelines:", error);
      }
    };

    const fetchDataOrSearch = () => {
      if (searchTerm.value === '') {
        fetchData();
      } else {
        searchPipelines();
      }
    };

    fetchDataOrSearch(); // Call the function initially

    setInterval(fetchDataOrSearch, 10000); // Call the function every 10 seconds

    // When the component is mounted, we fetch the data.
    onMounted(() => {
      fetchData();
    });

    const getPipelineColor = (status: string) => {
      switch (status) {
        case "SUCCESSFUL":
          return "#1a1a66";
        case "FAILED":
          return "#961c48";
        case "Unknown Result":
          return "#e67700";
        case "NOT_RUN":
          return "grey";
        default:
          return "#e67700";
      }
    };

    const showNavbar = () => {
      isNavbarVisible.value = true;
    };

    const hideNavbar = () => {
      isNavbarVisible.value = false;
    };

    const clearSearchTerm = () => {
      searchTerm.value = '';
      fetchData();
    };

    // We expose the pipelines ref to our template.
    return {
      pipelines,
      getPipelineColor,
      expansionStates,
      stepsName,
      searchTerm,
      searchPipelines,
      isNavbarVisible,
      showNavbar,
      hideNavbar,
      clearSearchTerm,
    };
  },
});
</script>

<template>
 <div class="fixed-top" :class="{ visible: isNavbarVisible }" @mouseover="showNavbar" @mouseout="hideNavbar"
    style="z-index: 100; background-color: rgb(37, 207, 213); display: flex; justify-content: center; padding: 10px;">
    <div  class="search-bar">
      <input v-model="searchTerm" type="text" placeholder="Search pipelines"
        style="border-radius: 10px; padding: 5px; padding-right: 25px; margin-right: 5px;" @keydown.enter="searchPipelines" />
      <button v-if="searchTerm" @click="clearSearchTerm"
        style="position: absolute; left: 1px; top: 50%; transform: translateY(-50%); margin-left: -20px; border: none; background: none; cursor: pointer;">
        <span style="color: #000;">X</span>
      </button>
      <button @click="searchPipelines" style="border-radius: 10px; padding: 5px;">Search</button>
      <button @click="refreshPage" style="border-radius: 10px; padding: 5px; margin-left: 5px;">Home</button>
    </div>
  </div>



    <div v-if="pipelines.length === 0"
      style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div v-if="pipelines.length === 0" style="text-align: center; font-style: italic;">No pipelines for branch
        '{{ searchTerm }}'' found</div>
    </div>


    <div class="card-container" >
      <div v-for="(pipeline, index) in pipelines" :key="pipeline._id" bordered class="my-card">
        <div class="q-pa-md" style="padding: 0">
          <div class="q-pa-md" style="padding: 0; background-color: lightgrey">
            <q-expansion-item v-model="expansionStates[index]">
              <template v-slot:header>
                <div :style="{ backgroundColor: getPipelineColor(pipeline.status) }" class="expansion-header">
                  {{ pipeline.branch_name }} branch
                  <span v-if="getPipelineColor(pipeline.status) === '#e67700'" class="header-loader"></span>
                </div>
              </template>

              <!-- ================================================================ ROW 1 ================================================================ -->

              <div class="row">
                <div class="col-3">
                  <Step v-if="pipeline.steps.length > 0" :step="pipeline.steps[0]" />
                  <div v-else>No Steps Available</div>
                </div>

                <div class="col details-positioning">
                  <p class="branch-name">Branch {{ pipeline.branch_name }}</p>
                </div>
                <div class="col build-info-root">
                  <p class="build-info build-size">
                    Build Number: {{ pipeline.build_number }}
                  </p>
                  <p class="build-info build-size">
                    Total Time: {{ pipeline.duration_seconds || "N/A" }}S
                  </p>
                  <p class="build-info build-size">
                    Last Activity: {{ formatTimestamp(pipeline.created_on) }}
                  </p>
                </div>
              </div>

              <!-- ================================================================ ROW 2 ================================================================ -->

              <div class="row row-2">
                <div class="col" v-if="pipeline.steps.length > 1">
                  <div>
                    <Step :step="pipeline.steps[1]" />
                  </div>
                </div>
                <div class="col" v-if="pipeline.steps.length > 3">
                  <div>
                    <Step :step="pipeline.steps[3]" />
                  </div>
                </div>
                <div class="col" v-if="pipeline.steps.length > 4">
                  <div>
                    <Step :step="pipeline.steps[4]" />
                  </div>
                </div>
                <div class="col" v-if="pipeline.steps.length > 5">
                  <div>
                    <Step :step="pipeline.steps[5]" />
                  </div>
                </div>
                <div class="col" v-if="pipeline.steps.length > 6">
                  <div>
                    <Step :step="pipeline.steps[6]" />
                  </div>
                </div>
                <div class="col" v-if="pipeline.steps.length > 7">
                  <div>
                    <Step :step="pipeline.steps[7]" />
                  </div>
                </div>
                <div class="col" v-if="pipeline.steps.length > 8">
                  <div>
                    <Step :step="pipeline.steps[8]" />
                  </div>
                </div>

                <div v-else-if="pipeline.steps.length > 0">
                  <div class="col"></div>
                </div>
              </div>

              <!-- ================================================================ ROW 3 ================================================================ -->

              <div class="row row-3">
                <div class="col-3 card-color">
                  <Step v-if="pipeline.steps.length > 0" :step="pipeline.steps[2]" />
                  <div v-else>No Steps Available</div>
                </div>
              </div>
            </q-expansion-item>
            <q-separator />
          </div>
        </div>
      </div>
    </div>
</template>

<style lang="scss" scoped>
@media (min-width: 420px) {
  .my-card {
    width: 100%;
    margin-right: 0;
  }
}

.card-container {
  display: flex;
  flex-wrap: wrap;
}

.build-info {
  margin-bottom: 0;
  font-size: 0.75rem;
}

.step-text {
  font-size: 1.5vh;
}

.expansion-header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 20px;
  border-radius: 5px;
  color: white;
  text-align: center;
}

.fixed-top {
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.fixed-top.visible {
  opacity: 1;
}

@media (max-width: 768px) {
  .build-size {
    font-size: 10px;
  }

  .branch-name {
    font-size: 1em;
  }

  .my-card {
    width: 100%;
    margin-right: 0;
  }

  .build-info-root {
    transform: translateY(-15px);
  }

  .fixed-top {
    height: 3em;
    opacity: 1;
  }

  .card-container{
    margin-top: 40px;
  }
  .search-bar{
    transform: translateY(-0.5em);
  }
}

@media (min-width: 768px) {
  .branch-name {
    font-size: 2em;
  }

}


.branch-name {
  margin-top: 0px;
  margin-bottom: 0px;
  padding-left: 40px;
}

.row-2 {
  margin-left: 1.5rem;
}

.row-3 {
  margin-left: 3rem;
}
</style>
