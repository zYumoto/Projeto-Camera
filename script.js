const video = document.getElementById("video");
const captureButton = document.getElementById("capture");
const cameraSelect = document.getElementById("camera-select");
const photoCountInput = document.getElementById("photo-count");
const photoIntervalInput = document.getElementById("photo-interval");
const saveButton = document.getElementById("save");
const photosDiv = document.getElementById("photos");

let mediaStream = null;
let photoTimer = null;
let photoCount = parseInt(photoCountInput.value);
let photoInterval = parseInt(photoIntervalInput.value);
let photos = [];

function getCameras() {
  return navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      const cameras = devices.filter(device => device.kind === "videoinput");
      return Promise.resolve(cameras);
    });
}

function startCameraStream(cameraId) {
  const constraints = {
    audio: false,
    video: { deviceId: { exact: cameraId } }
  };
  return navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      mediaStream = stream;
      video.srcObject = stream;
      return Promise.resolve();
    });
}

function stopCameraStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
    video.srcObject = null;
  }
}

function takePhoto() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const photoData = canvas.toDataURL("image/png");
  const photoImg = document.createElement("img");
  photoImg.src = photoData;
  photos.push(photoData);
  photosDiv.appendChild(photoImg);
  if (photos.length === photoCount) {
    clearInterval(photoTimer);
  }
}

function savePhotos() {
  for (let i = 0; i < photos.length; i++) {
    const link = document.createElement("a");
    link.href = photos[i];
    link.download = `photo_${i + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

getCameras()
  .then(cameras => {
    for (let i = 0; i < cameras.length; i++) {
      const option = document.createElement("option");
      option.value = cameras[i].deviceId;
      option.text = cameras[i].label || `Camera ${cameraSelect.length + 1}`;
      cameraSelect.appendChild(option);
    }
  })
  .then(() => {
    startCameraStream(cameraSelect.value);
  });

cameraSelect.addEventListener("change", event => {
  stopCameraStream();
  startCameraStream(event.target.value);
});

captureButton.addEventListener("click", event => {
  photos = [];
  photoCount = parseInt(photoCountInput.value);
  photoInterval = parseInt(photoIntervalInput.value);
  photoTimer = setInterval(takePhoto, photoInterval);
});

saveButton.addEventListener("click", event => {
  savePhotos();
});

window.addEventListener("beforeunload", event => {
  stopCameraStream();
});

//====================================================
const toggleButton = document.getElementById("toggle-view");

// Função para verificar e alternar a visualização com base na largura da janela
function checkWindowSize() {
  const isMobileView = window.innerWidth <= 768; // Defina a largura desejada para a visualização móvel

  if (isMobileView) {
    // Adicione classes ou faça alterações específicas para a visualização móvel
    document.body.classList.add("mobile-view");
  } else {
    // Remova as classes ou faça alterações específicas para a visualização de desktop
    document.body.classList.remove("mobile-view");
  }
}

// Verifique o tamanho da janela inicialmente
checkWindowSize();

// Adicione um evento de redimensionamento da janela para verificar novamente quando a janela for redimensionada
window.addEventListener("resize", checkWindowSize);

// Adicione um evento de clique ao botão de alternância
toggleButton.addEventListener("click", () => {
  // Verifique se está na visualização móvel
  const isMobileView = document.body.classList.contains("mobile-view");

  if (isMobileView) {
    // Caso esteja na visualização móvel, remova a classe para visualização móvel
    document.body.classList.remove("mobile-view");
  } else {
    // Caso contrário, adicione a classe para visualização móvel
    document.body.classList.add("mobile-view");
  }
});
