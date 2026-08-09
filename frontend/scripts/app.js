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
const selectedFilesContainer = document.getElementById("selected-files");
const mobileMenuButton =
    document.getElementById("mobile-menu-button");

const mainNavigation =
    document.getElementById("main-navigation");
const workspaceSummary =
    document.getElementById("workspace-summary");
const workspaceActions =
    document.getElementById("workspace-actions");

const clearAllButton =
    document.getElementById("clear-all-button");
const notification =
    document.getElementById("notification");

// ==========================================
// APPLICATION STATE
// ==========================================

let selectedFiles = [];

// ==========================================
// FILE CONFIGURATION
// ==========================================

const allowedFileTypes = [
    "application/pdf",

    "image/jpeg",
    "image/png",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint"
];

// 50 MB for now.
// We'll revisit limits when the complete processing architecture is built.
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// ==========================================
// FILE PICKER
// ==========================================

function openFilePicker() {

    fileInput.click();

}

// ==========================================
// FILE VALIDATION
// ==========================================

function validateFile(file) {

    if (!allowedFileTypes.includes(file.type)) {

        return {
            valid: false,
            message:
    `${file.name} can't be added. This file type isn't supported.`
        };

    }

    if (file.size > MAX_FILE_SIZE) {

        return {
            valid: false,
            message:
    `${file.name} can't be added because it is larger than 50 MB.`
        };

    }

    return {
        valid: true,
        message: ""
    };

}

// ==========================================
// FILE SIZE FORMATTING
// ==========================================

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 Bytes";
    }

    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    const unitIndex = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    const size = bytes / Math.pow(1024, unitIndex);

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;

}
function getFileTypeBadge(fileName) {

    const extension =
        fileName
            .split(".")
            .pop()
            .toLowerCase();

    const badges = {

        pdf: "PDF",

        doc: "DOC",
        docx: "DOC",

        xls: "XLS",
        xlsx: "XLS",

        ppt: "PPT",
        pptx: "PPT",

        jpg: "IMG",
        jpeg: "IMG",
        png: "IMG",
        webp: "IMG",

    };

    return badges[extension] || "FILE";

}
function calculateTotalSize() {

    return selectedFiles.reduce(
        (total, file) => total + file.size,
        0
    );

}

// ==========================================
// DISPLAY FILES
// ==========================================

function renderSelectedFiles() {

    selectedFilesContainer.innerHTML = "";

    selectedFiles.forEach((file, index) => {

        const fileCard = document.createElement("div");
        fileCard.className = "file-card";

        const fileIcon = document.createElement("div");
        fileIcon.className = "file-icon";
        fileIcon.setAttribute("aria-hidden", "true");
        fileIcon.textContent =
    getFileTypeBadge(file.name);

        const fileDetails = document.createElement("div");
        fileDetails.className = "file-details";

        const fileName = document.createElement("div");
        fileName.className = "file-name";
        fileName.title = file.name;
        fileName.textContent = file.name;

        const fileSize = document.createElement("div");
        fileSize.className = "file-size";
        fileSize.textContent = formatFileSize(file.size);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-file-button";
        removeButton.dataset.fileIndex = index;
        removeButton.setAttribute(
            "aria-label",
            `Remove ${file.name}`
        );
        removeButton.textContent = "×";

        fileDetails.appendChild(fileName);
        fileDetails.appendChild(fileSize);

        fileCard.appendChild(fileIcon);
        fileCard.appendChild(fileDetails);
        fileCard.appendChild(removeButton);

        selectedFilesContainer.appendChild(fileCard);

    });

   if (selectedFiles.length > 0) {

    const totalSize =
        calculateTotalSize();

    workspaceSummary.textContent =
        `${selectedFiles.length} ${
            selectedFiles.length === 1
                ? "file"
                : "files"
        } • ${formatFileSize(totalSize)}`;

    workspaceSummary.classList.add("is-visible");

    workspaceActions.classList.add("is-visible");

    
} else {

    workspaceSummary.textContent = "";

    workspaceSummary.classList.remove("is-visible");

    workspaceActions.classList.remove("is-visible");

    

}
}
// ==========================================
// NOTIFICATIONS
// ==========================================

function showNotification(
    message,
    type = "warning"
) {

    const icons = {
        warning: "⚠",
        error: "✕",
        success: "✓"
    };

    notification.innerHTML = "";

    const icon = document.createElement("span");
    icon.className = "notification-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = icons[type] || icons.warning;

    const content = document.createElement("div");
    content.className = "notification-content";
    content.textContent = message;

    notification.appendChild(icon);
    notification.appendChild(content);

    notification.className =
        `notification ${type} is-visible`;

}
// ==========================================
// PROCESS SELECTED FILES
// ==========================================

function processFiles(files) {

    const filesToAdd = Array.from(files);

    const validFiles = [];
    const errors = [];

    filesToAdd.forEach((file) => {

        const validation = validateFile(file);

        if (!validation.valid) {

            errors.push(validation.message);

            return;

        }

        const duplicate = selectedFiles.some(
            (existingFile) =>
                existingFile.name === file.name &&
                existingFile.size === file.size &&
                existingFile.lastModified === file.lastModified
        );

        if (duplicate) {

            errors.push(
    `${file.name} is already selected.`
);

            return;

        }

        validFiles.push(file);

    });

    selectedFiles.push(...validFiles);

renderSelectedFiles();

if (errors.length > 0) {

    showNotification(
        errors.join(" "),
        "warning"
    );

} else if (validFiles.length > 0) {

    notification.classList.remove("is-visible");

}

}

// ==========================================
// REMOVE FILE
// ==========================================

selectedFilesContainer.addEventListener("click", (event) => {

    const removeButton =
        event.target.closest(".remove-file-button");

    if (!removeButton) {
        return;
    }

    const fileIndex =
        Number(removeButton.dataset.fileIndex);

    selectedFiles.splice(fileIndex, 1);

    renderSelectedFiles();

});

// ==========================================
// EVENT LISTENERS
// ==========================================

browseFilesButton.addEventListener(
    "click",
    openFilePicker
);

uploadDropzone.addEventListener("click", (event) => {

    if (event.target === browseFilesButton) {
        return;
    }

    openFilePicker();

});

fileInput.addEventListener("change", () => {

    processFiles(fileInput.files);

    // Allows the user to select the same file again
    // after removing it from the list.
    fileInput.value = "";

});
// ==========================================
// DRAG & DROP
// ==========================================

uploadDropzone.addEventListener("dragenter", (event) => {

    event.preventDefault();

    uploadDropzone.classList.add("drag-over");

});

uploadDropzone.addEventListener("dragover", (event) => {

    event.preventDefault();

    uploadDropzone.classList.add("drag-over");

});

uploadDropzone.addEventListener("dragleave", (event) => {

    event.preventDefault();

    // Only remove the state when the pointer actually
    // leaves the dropzone.
    if (!uploadDropzone.contains(event.relatedTarget)) {

        uploadDropzone.classList.remove("drag-over");

    }

});

uploadDropzone.addEventListener("drop", (event) => {

    event.preventDefault();

    uploadDropzone.classList.remove("drag-over");

    const droppedFiles = event.dataTransfer.files;

    if (droppedFiles.length === 0) {
        return;
    }

    processFiles(droppedFiles);

});
// ==========================================
// MOBILE NAVIGATION
// ==========================================

mobileMenuButton.addEventListener("click", () => {

    const isOpen =
        mainNavigation.classList.toggle("is-open");

    mobileMenuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    mobileMenuButton.setAttribute(
        "aria-label",
        isOpen
            ? "Close navigation menu"
            : "Open navigation menu"
    );

});
// ==========================================
// CLEAR ALL FILES
// ==========================================

clearAllButton.addEventListener("click", () => {

    selectedFiles = [];

    fileInput.value = "";

    renderSelectedFiles();

});