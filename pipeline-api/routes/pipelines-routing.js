const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Pipeline = require("../models/pipeline");

router.get("/", async (req, res) => {
  try {
    const pipelinesMain = await Pipeline.find({ branch_name: "main" }).sort({
      created_on: -1,
    });

    console.log("pipelinesMain", pipelinesMain);

    const pipelinesRecent = await Pipeline.find().sort({ created_on: -1 });
    console.log("pipelinesRecent", pipelinesRecent);

    const pipelineMap = {};
    const mergeAndFilterPipelines = (pipelines) => {
      for (const pipeline of pipelines) {
        const key = `${pipeline.branch_name}-${pipeline.build_number}`;
        if (
          !pipelineMap[key] ||
          pipelineMap[key].created_on < pipeline.created_on
        ) {
          pipelineMap[key] = pipeline;
        }
      }
    };

    mergeAndFilterPipelines(pipelinesRecent);

    // Convert the map back into an array and sort by created_on in descending order
    let pipelines = Object.values(pipelineMap).sort(
      (a, b) => b.created_on - a.created_on
    );
    
    pipelinesMain.sort((a, b) => b.created_on - a.created_on);
    
    const duplicateIndex = pipelines.findIndex(
      (pipeline) => pipeline._id.toString() === pipelinesMain[0]._id.toString()
    );
    
    if (duplicateIndex !== -1) {
      pipelines.splice(duplicateIndex, 1);
    }
    
    pipelines.unshift(pipelinesMain[0]);
    


    // Add the most recent main pipeline to the beginning of the pipelinesRecent array
  


    // Limit to 4 most recent pipelines
    pipelines = pipelines.slice(0, 4);

    res.status(200).json(pipelines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pipelines" });
  }
});


router.get("/:branchName", async (req, res) => {
  const { branchName } = req.params;

  try {
    const pipelines = await Pipeline.find({ branch_name: { $regex: branchName, $options: 'i' } })
      .sort({ created_on: -1 });

    res.status(200).json(pipelines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pipelines" });
  }
});





module.exports = router;
