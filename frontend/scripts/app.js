/**
 * DocsFusion
 * Main application entry point
 */

// ==========================================
// DOM ELEMENTS
// ==========================================

const fileInput = document.getElementById("file-input");
const browseFilesButton = document.getElementById("browse-files-button");
const uploadDropzone = document.getElementById("upload-dropzone");
const uploadMessage = document.getElementById("upload-message");

// ==========================================
// FILE SELECTION
// ==========================================

function openFilePicker() {
    fileInput.click();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

browseFilesButton.addEventListener("click", openFilePicker);

uploadDropzone.addEventListener("click", (event) => {

    // Don't trigger the file picker twice
    // when the Browse Files button itself is clicked.
    if (event.target === browseFilesButton) {
        return;
    }

    openFilePicker();

});

fileInput.addEventListener("change", () => {

    const selectedFiles = Array.from(fileInput.files);

    if (selectedFiles.length === 0) {
        return;
    }

    uploadMessage.textContent =
        `${selectedFiles.length} file(s) selected.`;

});