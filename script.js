let model = tf.sequential();
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
canvas.width = 28;
canvas.height = 28;
let drawingCanvas = document.getElementById('canvas');
drawingCanvas.id = "dctx";
let dctx = drawingCanvas.getContext('2d');
drawingCanvas.width = 280;
drawingCanvas.height = 280;
dctx.fillStyle = "black";

dctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
let imagesToLearn = 10;
const configHidden = {
    units: 784,
    inputShape: 784,
    activation: 'sigmoid',
};
const configOutput = {
    units: imagesToLearn,
    activation: 'sigmoid',

};


const hidden = tf.layers.dense(configHidden);
const output = tf.layers.dense(configOutput);
model.add(tf.layers.conv2d({
    inputShape: [28, 28, 1],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'VarianceScaling'
}));
model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
}));
model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'VarianceScaling'
}));
model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
}));
model.add(tf.layers.flatten());
model.add(tf.layers.dense({
    units: 10,
    kernelInitializer: 'VarianceScaling',
    activation: 'softmax'
}));
const sgdOptimizer = tf.train.sgd(0.1);
const config = {
    optimizer: sgdOptimizer,
    loss: tf.losses.meanSquaredError
};
let arrIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
pickRandomIndex = () =>{
    if(arrIndex.length <= 0){
        for(let i =0; i < 10; i++){
            arrIndex[i] = i;
        }
        return arrIndex.splice(Math.floor(Math.random() * arrIndex.length), 1);
    }else {
        return arrIndex.splice(Math.floor(Math.random() * arrIndex.length), 1);
    }
};


async function start(){
    model = await tf.loadModel('https://sirdomin.github.io/DigitRecognition/model/my-model-1.json');
    model.compile(config);
}
async function getDataBytesView(imageData){
    let array = [];
    for(let j = 0; j < imageData.data.length / 4; j++){
        array[j] = imageData.data[j * 4] / 255;
    }
    return array;
}

async function guessImage(){
    let imageToGuess = new Image();
    imageToGuess.onload = function(){
         ctx.drawImage(imageToGuess,0 , 0, 28, 28);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            getDataBytesView(imageData).then((dataBytesView)=>{
                predictModel(dataBytesView)
            });
    };
    imageToGuess.id = "imageToPredict";
    imageToGuess.width = 28;
    imageToGuess.height = 28;
    imageToGuess.src = drawingCanvas.toDataURL();
}
async function predictModel(xs){
    let highestScore = [0, 0];
    let input = tf.tensor2d([xs]);
    let output = await model.predict(input.reshape([1, 28, 28, 1]));
    let outputData = JSON.parse(output.toString().slice(13,150).split(',]')[0]);
    for(let i = 0; i < imagesToLearn; i++){

        if(outputData[i] > highestScore[0])highestScore = [outputData[i], i];
    }
    for(let i = 0 ;i < 10; i++){
        document.getElementsByClassName("result")[i].innerText = ` Guess: ${i} `;
        document.getElementsByClassName("result")[i].innerText += ` chance: ${Math.round(Math.round(outputData[i] * 1000000) / 10000)}%`;
        if(highestScore[1] === i) {
            document.getElementsByClassName("result")[i].style.color="red";
            document.getElementsByClassName("result")[i].style.border = 'solid 2px black'
        }
        else {
            //document.getElementsByClassName("result")[i].style.color="red";
        }
    }
}
let drawingArray = [];
let test=false;
draw = () =>{
    if(drawing){
        drawingArray.unshift({x: drawingX, y: drawingY});
        if(drawingArray.length > 1){
            dctx.beginPath();
            dctx.lineJoin="round";
            dctx.lineWidth = 12;
            dctx.moveTo(drawingArray[0].x, drawingArray[0].y);
            dctx.lineTo(drawingArray[1].x, drawingArray[1].y);
            dctx.strokeStyle='#ffffff';
            dctx.closePath();
            dctx.stroke();
            test = true;
        }
    }
    setTimeout(draw, 1000/60);
};
start().then(()=>{
    console.log("Load complete");
});
document.getElementById('btn').onclick = function(){
    for(let i = 0 ;i < 10; i++){
        document.getElementsByClassName("result")[i].style.color="black";
        document.getElementsByClassName("result")[i].style.border = 'black'
        document.getElementsByClassName("result")[i].style.borderRadius = '50%'
    }
  guessImage();

};