const inputImg = document.getElementById("inputImg");
const previewImg = document.getElementById("previewImg");

inputImg.addEventListener("change", (e) => {
    const file = inputImg.files[0];

    if (!file) return;

    previewImg.src = URL.createObjectURL(file);
    previewImg.style.display = "block";
})