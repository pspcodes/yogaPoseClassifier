// Inspired from "The Coding Train (Daniel Shiffman)"
// Retrained the model to detect and classify three yoga postures,
// Tadaasana (mountain), Adhomukhashwanasana (inverted V or downward 
// dog) and Bhujangaasana (cobra).

let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = "";
let poseName = "";

let state = 'waiting';
let targeLabel;

function keyPressed() {
 if (key == 's') {
   
    brain.saveData();
   console.log('s is pressed');
  } else if (key == 't') {
    brain.normalizeData();
    brain.train({epochs: 50}, finished); 
  }
  
  
  else {
    targetLabel = key;
    console.log(targetLabel);
    setTimeout(function() {
      console.log('collecting');
      state = 'collecting';
      setTimeout(function() {
        console.log('not collecting');
        state = 'waiting';
      }, 10000);
    }, 10000);
  }
}

function gotResult(error, results) {  
 if (results[0].confidence > 0.75) {
   poseLabel = results[0].label.toUpperCase();
   //console.log(poseLabel);
 }
 classifyPose();
}

function classifyPose() {
 if (pose) {
   let inputs = [];
   for (let i = 0; i < pose.keypoints.length; i++) {
     let x = pose.keypoints[i].position.x;
     let y = pose.keypoints[i].position.y;
     inputs.push(x);
     inputs.push(y);
   }
   brain.classify(inputs, gotResult);
   //console.log('inside brain.classify');
 } else {
   setTimeout(classifyPose, 100);
 }
}

function brainLoaded() {
 //console.log('pose classification ready!');
 classifyPose();
}

function setup() {
  createCanvas(640, 480);
  
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 3,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  
  //brain.loadData('yoga.json');
  const modelInfo = {
   model: 'model/model.json',
   metadata: 'model/model_meta.json',
   weights: 'model/model.weights.bin',
 };
 brain.load(modelInfo, brainLoaded);
  background(200);

}

function gotPoses(poses) {
  // console.log(poses); 
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == 'collecting') {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function finished() {
  console.log('model trained');
  brain.save();
 // classifyPose();
}


function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
      
      
      }
  }
  pop();
  
  fill(255, 0, 0);
  noStroke();
  textSize(35);
  textAlign(CENTER, BOTTOM);
  
  AssignLabel(poseLabel);
  text(poseName, width / 2, height);
}


function AssignLabel(poseLabel) {
  //console.log("AssignLabel function entered");
 if (poseLabel == 'M')
  {
  poseName = "Tadasana"
  }
  else if (poseLabel == 'D')
    {
  poseName = "Adho Mukha Swanasana"
  }
  else if (poseLabel == 'C')
    {
  poseName = "Bhujangasana"
  }    
}
