/**
 * DocsFusion
 * Merge PDF page
 */

import { PDFDocument } from "pdf-lib";

import {
    formatFileSize,
    validatePdfFile
} from "./shared/file-utils.js";


// ==========================================
// CONSTANTS
// ==========================================

const MAX_FILE_SIZE =
    50 * 1024 * 1024;


// ==========================================
// DOM ELEMENTS
// ==========================================

const fileInput =
    document.getElementById("file-input");

const browseFilesButton =
    document.getElementById("browse-files-button");

const uploadDropzone =
    document.getElementById("upload-dropzone");

const selectedFilesContainer =
    document.getElementById("selected-files");

const workspaceSummary =
    document.getElementById("workspace-summary");

const workspaceActions =
    document.getElementById("workspace-actions");

const outputFilePanel =
    document.getElementById("output-file-panel");

const outputFileName =
    document.getElementById("output-file-name");    

const mergePdfsButton =
    document.getElementById("merge-pdfs-button");

const clearAllButton =
    document.getElementById("clear-all-button");

const notification =
    document.getElementById("notification");

const mobileMenuButton =
    document.getElementById("mobile-menu-button");

const mainNavigation =
    document.getElementById("main-navigation");

console.log(
    "outputFilePanel:",
    outputFilePanel
);

console.log(
    "outputFileName:",
    outputFileName
);
// ==========================================
// APPLICATION STATE
// ==========================================

let selectedFiles = [];

let draggedFileIndex = null;

let pointerDragging = false;

let dragPreview = null;


// ==========================================
// NOTIFICATIONS
// ==========================================

function showNotification(message, type = "warning") {

    notification.textContent = message;

    notification.classList.remove(
        "warning",
        "success",
        "error"
    );

    notification.classList.add(
        type,
        "is-visible"
    );

}


function clearNotification() {

    notification.textContent = "";

    notification.classList.remove(
        "warning",
        "success",
        "error",
        "is-visible"
    );

}


// ==========================================
// FILE PICKER
// ==========================================

function openFilePicker() {

    fileInput.click();

}


// ==========================================
// TOTAL FILE SIZE
// ==========================================

function calculateTotalSize() {

    return selectedFiles.reduce(
        (total, file) =>
            total + file.size,
        0
    );

}
// ==========================================
// OUTPUT FILE NAME
// ==========================================

function getOutputFileName() {

    let fileName =
        outputFileName.value.trim();


    // Use the default name if the field is empty.

    if (!fileName) {

        fileName =
            "DocsFusion-Merged";

    }


    // Remove .pdf if the user typed it.
    // We add the extension ourselves below.

    fileName =
        fileName.replace(
            /\.pdf$/i,
            ""
        );


    // Remove characters that are unsafe
    // in common operating-system filenames.

    fileName =
        fileName.replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            "-"
        );


    // Remove trailing spaces and periods.

    fileName =
        fileName.replace(
            /[.\s]+$/g,
            ""
        );


    // Fall back again if sanitizing
    // removed the whole name.

    if (!fileName) {

        fileName =
            "DocsFusion-Merged";

    }


    return `${fileName}.pdf`;

}

// ==========================================
// PROCESS FILES
// ==========================================

async function processFiles(files) {

    const filesToAdd =
        Array.from(files);

    const validFiles = [];

    const errors = [];


    filesToAdd.forEach((file) => {

        const validation =
            validatePdfFile(
                file,
                MAX_FILE_SIZE
            );


        if (!validation.valid) {

            errors.push(
                validation.message
            );

            return;

        }


        const duplicate =
            selectedFiles.some(
                (existingFile) =>
                    existingFile.name === file.name &&
                    existingFile.size === file.size &&
                    existingFile.lastModified ===
                        file.lastModified
            );


        if (duplicate) {

            errors.push(
                `${file.name} is already selected.`
            );

            return;

        }


        validFiles.push(file);

    });


    selectedFiles.push(
        ...validFiles
    );


    renderSelectedFiles();


    if (errors.length > 0) {

        showNotification(
            errors.join(" "),
            "warning"
        );

    } else if (validFiles.length > 0) {

        clearNotification();

    }

}


// ==========================================
// RENDER SELECTED FILES
// ==========================================

function renderSelectedFiles() {

    selectedFilesContainer.innerHTML = "";


    selectedFiles.forEach(
        (file, index) => {

            const fileCard =
                document.createElement("div");

            fileCard.className =
                "file-card";

            /*
             * Keep the card draggable.
             * At <= 480px the HTML drag is
             * cancelled and pointer dragging
             * from the handle is used instead.
             */

            fileCard.draggable = true;

            fileCard.dataset.fileIndex =
                index;


            // ==================================
            // DRAG HANDLE
            // ==================================

            const dragHandle =
                document.createElement("span");

            dragHandle.className =
                "drag-handle";

            dragHandle.setAttribute(
                "aria-hidden",
                "true"
            );

            dragHandle.textContent =
                "⋮⋮";

            dragHandle.draggable =
                false;


            // ==================================
            // DESKTOP DRAG
            // ==================================

            fileCard.addEventListener(
                "dragstart",
                (event) => {

                    if (
                        window.innerWidth <= 480
                    ) {

                        event.preventDefault();

                        return;

                    }


                    draggedFileIndex =
                        index;


                    fileCard.classList.add(
                        "is-dragging"
                    );


                    event.dataTransfer
                        .effectAllowed =
                        "move";

                }
            );


            fileCard.addEventListener(
                "dragend",
                () => {

                    draggedFileIndex =
                        null;


                    fileCard.classList.remove(
                        "is-dragging"
                    );

                    fileCard.classList.remove(
                        "is-drag-over"
                    );

                }
            );


            fileCard.addEventListener(
                "dragover",
                (event) => {

                    event.preventDefault();


                    if (
                        draggedFileIndex === null ||
                        draggedFileIndex === index
                    ) {
                        return;
                    }


                    event.dataTransfer.dropEffect =
                        "move";


                    fileCard.classList.add(
                        "is-drag-over"
                    );

                }
            );


            fileCard.addEventListener(
                "dragleave",
                () => {

                    fileCard.classList.remove(
                        "is-drag-over"
                    );

                }
            );


            fileCard.addEventListener(
                "drop",
                (event) => {

                    event.preventDefault();


                    fileCard.classList.remove(
                        "is-drag-over"
                    );


                    if (
                        draggedFileIndex === null ||
                        draggedFileIndex === index
                    ) {

                        draggedFileIndex =
                            null;

                        return;

                    }


                    moveSelectedFile(
                        draggedFileIndex,
                        index,
                        event.clientY,
                        fileCard
                    );

                }
            );


            // ==================================
            // MOBILE POINTER DRAG
            // ==================================

            dragHandle.addEventListener(
                "pointerdown",
                (event) => {

                    if (
                        window.innerWidth > 480
                    ) {
                        return;
                    }


                    event.preventDefault();


                    pointerDragging =
                        true;

                    draggedFileIndex =
                        index;


                    fileCard.classList.add(
                        "is-dragging"
                    );


                    dragPreview =
                        fileCard.cloneNode(
                            true
                        );


                    dragPreview.classList.remove(
                        "is-dragging",
                        "is-drag-over"
                    );


                    const rect =
                        fileCard
                            .getBoundingClientRect();


                    dragPreview.style.position =
                        "fixed";

                    dragPreview.style.zIndex =
                        "9999";

                    dragPreview.style.pointerEvents =
                        "none";

                    dragPreview.style.width =
                        `${rect.width}px`;

                    dragPreview.style.left =
                        `${rect.left}px`;

                    dragPreview.style.top =
                        `${rect.top}px`;

                    dragPreview.style.opacity =
                        "0.95";

                    dragPreview.style.boxShadow =
                        "0 10px 24px rgba(15, 23, 42, 0.22)";

                    dragPreview.style.transform =
                        "scale(1.02)";


                    document.body.appendChild(
                        dragPreview
                    );


                    dragHandle.setPointerCapture(
                        event.pointerId
                    );

                }
            );


            dragHandle.addEventListener(
                "pointermove",
                (event) => {

                    if (
                        !pointerDragging ||
                        !dragPreview
                    ) {
                        return;
                    }


                    event.preventDefault();


                    const previewRect =
                        dragPreview
                            .getBoundingClientRect();


                    dragPreview.style.left =
                        `${
                            event.clientX -
                            previewRect.width / 2
                        }px`;

                    dragPreview.style.top =
                        `${
                            event.clientY -
                            previewRect.height / 2
                        }px`;

                }
            );


            dragHandle.addEventListener(
                "pointerup",
                (event) => {

                    if (!pointerDragging) {
                        return;
                    }


                    event.preventDefault();


                    pointerDragging =
                        false;


                    fileCard.classList.remove(
                        "is-dragging"
                    );


                    const elementAtPoint =
                        document.elementFromPoint(
                            event.clientX,
                            event.clientY
                        );


                    const targetCard =
                        elementAtPoint?.closest(
                            ".file-card"
                        );


                    if (
                        targetCard &&
                        draggedFileIndex !== null
                    ) {

                        const targetIndex =
                            Number(
                                targetCard
                                    .dataset
                                    .fileIndex
                            );


                        if (
                            !Number.isNaN(
                                targetIndex
                            ) &&
                            targetIndex !==
                                draggedFileIndex
                        ) {

                            moveSelectedFile(
                                draggedFileIndex,
                                targetIndex,
                                event.clientY,
                                targetCard
                            );

                        }

                    }


                    cleanupPointerDrag();

                }
            );


            dragHandle.addEventListener(
                "pointercancel",
                () => {

                    fileCard.classList.remove(
                        "is-dragging"
                    );

                    cleanupPointerDrag();

                }
            );


            // ==================================
            // FILE ICON
            // ==================================

            const fileIcon =
                document.createElement("div");

            fileIcon.className =
                "file-icon";

            fileIcon.setAttribute(
                "aria-hidden",
                "true"
            );

            fileIcon.textContent =
                "PDF";


            // ==================================
            // FILE DETAILS
            // ==================================

            const fileDetails =
                document.createElement("div");

            fileDetails.className =
                "file-details";


            const fileName =
                document.createElement("div");

            fileName.className =
                "file-name";

            fileName.title =
                file.name;

            fileName.textContent =
                file.name;


            const fileSize =
                document.createElement("div");

            fileSize.className =
                "file-size";

            fileSize.textContent =
                formatFileSize(
                    file.size
                );


            // ==================================
            // REMOVE BUTTON
            // ==================================

            const removeButton =
                document.createElement(
                    "button"
                );

            removeButton.type =
                "button";

            removeButton.className =
                "remove-file-button";

            removeButton.setAttribute(
                "aria-label",
                `Remove ${file.name}`
            );

            removeButton.textContent =
                "×";


            removeButton.addEventListener(
                "click",
                () => {

                    selectedFiles.splice(
                        index,
                        1
                    );


                    fileInput.value =
                        "";


                    renderSelectedFiles();

                }
            );


            // ==================================
            // BUILD CARD
            // ==================================

            fileDetails.appendChild(
                fileName
            );

            fileDetails.appendChild(
                fileSize
            );


            fileCard.appendChild(
                dragHandle
            );

            fileCard.appendChild(
                fileIcon
            );

            fileCard.appendChild(
                fileDetails
            );

            fileCard.appendChild(
                removeButton
            );


            selectedFilesContainer
                .appendChild(
                    fileCard
                );

        }
    );


    // ==========================================
    // WORKSPACE STATE
    // ==========================================

    if (selectedFiles.length > 0) {

        const totalSize =
            calculateTotalSize();


        workspaceSummary.textContent =
            `${selectedFiles.length} ${
                selectedFiles.length === 1
                    ? "file"
                    : "files"
            } • ${formatFileSize(totalSize)}`;


        workspaceSummary.classList.add(
            "is-visible"
        );


        workspaceActions.classList.add(
            "is-visible"
        );

        outputFilePanel.classList.add(
            "is-visible"
        );


        /*
         * The Merge button is visible now,
         * but its processing listener will
         * be added in the next step.
         */

        mergePdfsButton.hidden =
            false;

    } else {

        workspaceSummary.textContent =
            "";


        workspaceSummary.classList.remove(
            "is-visible"
        );


        workspaceActions.classList.remove(
            "is-visible"
        );

        outputFilePanel.classList.remove(
            "is-visible"
        );

    }

}


// ==========================================
// REORDER SELECTED FILE
// ==========================================

function moveSelectedFile(
    fromIndex,
    targetIndex,
    clientY,
    targetCard
) {

    const draggedFile =
        selectedFiles[fromIndex];


    selectedFiles.splice(
        fromIndex,
        1
    );


    const targetRect =
        targetCard.getBoundingClientRect();


    const dropAfter =
        clientY >
        targetRect.top +
        targetRect.height / 2;


    let newIndex =
        targetIndex;


    if (fromIndex < targetIndex) {

        newIndex--;

    }


    if (dropAfter) {

        newIndex++;

    }


    selectedFiles.splice(
        newIndex,
        0,
        draggedFile
    );


    draggedFileIndex =
        null;


    renderSelectedFiles();

}


// ==========================================
// POINTER DRAG CLEANUP
// ==========================================

function cleanupPointerDrag() {

    pointerDragging =
        false;

    draggedFileIndex =
        null;


    if (dragPreview) {

        dragPreview.remove();

        dragPreview =
            null;

    }

}


// ==========================================
// BROWSE FILES
// ==========================================

browseFilesButton.addEventListener(
    "click",
    openFilePicker
);


uploadDropzone.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            browseFilesButton
        ) {
            return;
        }

        openFilePicker();

    }
);


// ==========================================
// FILE INPUT
// ==========================================

fileInput.addEventListener(
    "change",
    (event) => {

        processFiles(
            event.target.files
        );

        /*
         * Reset input so choosing the same
         * file again after removing it works.
         */

        fileInput.value =
            "";

    }
);


// ==========================================
// DROPZONE
// ==========================================

uploadDropzone.addEventListener(
    "dragenter",
    (event) => {

        event.preventDefault();

        uploadDropzone.classList.add(
            "drag-over"
        );

    }
);


uploadDropzone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        uploadDropzone.classList.add(
            "drag-over"
        );

    }
);


uploadDropzone.addEventListener(
    "dragleave",
    (event) => {

        event.preventDefault();


        if (
            !uploadDropzone.contains(
                event.relatedTarget
            )
        ) {

            uploadDropzone.classList.remove(
                "drag-over"
            );

        }

    }
);


uploadDropzone.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();


        uploadDropzone.classList.remove(
            "drag-over"
        );


        const droppedFiles =
            event.dataTransfer.files;


        if (
            droppedFiles.length === 0
        ) {
            return;
        }


        processFiles(
            droppedFiles
        );

    }
);


// ==========================================
// DROPZONE KEYBOARD
// ==========================================

uploadDropzone.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            openFilePicker();

        }

    }
);


// ==========================================
// CLEAR ALL
// ==========================================

clearAllButton.addEventListener(
    "click",
    () => {

        selectedFiles = [];

        fileInput.value = "";

        clearNotification();

        renderSelectedFiles();

    }
);

// ==========================================
// MERGE PDFs
// ==========================================

mergePdfsButton.addEventListener(
    "click",
    async () => {

        if (selectedFiles.length === 0) {

            showNotification(
                "Please select at least one PDF.",
                "warning"
            );

            return;

        }


        try {

            mergePdfsButton.disabled =
                true;

            mergePdfsButton.textContent =
                "Merging...";


            const mergedPdf =
                await PDFDocument.create();


            for (const file of selectedFiles) {

                const fileBytes =
                    await file.arrayBuffer();


                const sourcePdf =
                    await PDFDocument.load(
                        fileBytes
                    );


                const pageIndices =
                    sourcePdf.getPageIndices();


                const copiedPages =
                    await mergedPdf.copyPages(
                        sourcePdf,
                        pageIndices
                    );


                copiedPages.forEach(
                    (page) => {

                        mergedPdf.addPage(
                            page
                        );

                    }
                );

            }


            const mergedPdfBytes =
                await mergedPdf.save();


            const blob =
                new Blob(
                    [mergedPdfBytes],
                    {
                        type: "application/pdf"
                    }
                );


            const downloadUrl =
                URL.createObjectURL(
                    blob
                );


            const downloadLink =
                document.createElement(
                    "a"
                );


            downloadLink.href =
                downloadUrl;

            downloadLink.download =
            getOutputFileName();


            document.body.appendChild(
                downloadLink
            );


            downloadLink.click();

            downloadLink.remove();


            URL.revokeObjectURL(
                downloadUrl
            );


            showNotification(
                "PDFs merged successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "PDF merge failed:",
                error
            );


            showNotification(
                "Unable to merge the selected PDFs.",
                "error"
            );


        } finally {

            mergePdfsButton.disabled =
                false;

            mergePdfsButton.textContent =
                "Merge PDFs";

        }

    }
);
// ==========================================
// MOBILE NAVIGATION
// ==========================================

if (
    mobileMenuButton &&
    mainNavigation
) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                mobileMenuButton
                    .getAttribute(
                        "aria-expanded"
                    ) === "true";


            mobileMenuButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );


            mainNavigation.classList.toggle(
                "is-open"
            );

        }
    );

}


// ==========================================
// INITIAL RENDER
// ==========================================

renderSelectedFiles();


console.log(
    "Merge PDF page loaded."
);