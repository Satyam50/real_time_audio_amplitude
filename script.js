let mediaRecorder;
let audioChunks = [];

const recordButton = document.getElementById('recordButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const stopButton = document.getElementById('stopButton');
const playButton = document.getElementById('playButton');

recordButton.addEventListener('click', startRecording);
pauseButton.addEventListener('click', pauseRecording);
resumeButton.addEventListener('click', resumeRecording);
stopButton.addEventListener('click', stopRecording);
playButton.addEventListener('click', playRecording);

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                playButton.disabled = false;
                analyzeAudio(audio);
            };

            mediaRecorder.start();
            recordButton.disabled = true;
            pauseButton.disabled = false;
            stopButton.disabled = false;
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
        });
}

function pauseRecording() {
    mediaRecorder.pause();
    pauseButton.disabled = true;
    resumeButton.disabled = false;
}

function resumeRecording() {
    mediaRecorder.resume();
    pauseButton.disabled = false;
    resumeButton.disabled = true;
}

function stopRecording() {
    mediaRecorder.stop();
    recordButton.disabled = false;
    pauseButton.disabled = true;
    resumeButton.disabled = true;
    stopButton.disabled = true;
}

function playRecording() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
}

function analyzeAudio(audio) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    const amplitude = Math.max(...dataArray);
    document.getElementById('audioAmplitude').innerText = `Amplitude: ${amplitude} dB`;
}
