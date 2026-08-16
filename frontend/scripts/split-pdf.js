/**
 * DocsFusion
 * Split PDF page
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
    document.getElementById(
        "browse-files-button"
    );

const uploadDropzone =
    document.getElementById(
        "upload-dropzone"
    );

const selectedFilesContainer =
    document.getElementById(
        "selected-files"
    );

const workspaceSummary =
    document.getElementById(
        "workspace-summary"
    );

const splitPdfPanel =
    document.getElementById(
        "split-pdf-panel"
    );

const splitPageRanges =
    document.getElementById(
        "split-page-ranges"
    );

const outputFilePanel =
    document.getElementById(
        "output-file-panel"
    );

const outputFileName =
    document.getElementById(
        "output-file-name"
    );

const workspaceActions =
    document.getElementById(
        "workspace-actions"
    );

const splitPdfButton =
    document.getElementById(
        "split-pdf-button"
    );

const clearAllButton =
    document.getElementById(
        "clear-all-button"
    );

const notification =
    document.getElementById(
        "notification"
    );

const mobileMenuButton =
    document.getElementById(
        "mobile-menu-button"
    );

const mainNavigation =
    document.getElementById(
        "main-navigation"
    );


// ==========================================
// APPLICATION STATE
// ==========================================

let selectedFiles = [];


// ==========================================
// NOTIFICATIONS
// ==========================================

function showNotification(
    message,
    type = "warning"
) {

    notification.textContent =
        message;

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
// OUTPUT FILE NAME
// ==========================================

function getOutputBaseName() {

    let fileName =
        outputFileName.value.trim();


    if (!fileName) {

        fileName =
            "DocsFusion-Split";

    }


    // Remove .pdf if the user typed it.

    fileName =
        fileName.replace(
            /\.pdf$/i,
            ""
        );


    // Replace unsafe filename characters.

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


    if (!fileName) {

        fileName =
            "DocsFusion-Split";

    }


    return fileName;

}


// ==========================================
// PROCESS FILES
// ==========================================

async function processFiles(files) {

    const filesToAdd =
        Array.from(files);


    if (filesToAdd.length === 0) {
        return;
    }


    /*
     * Split PDF accepts only one file.
     */

    if (
        selectedFiles.length > 0
    ) {

        showNotification(
            "Split PDF works with one PDF at a time. Remove the current PDF before adding another.",
            "warning"
        );

        return;

    }


    const firstFile =
        filesToAdd[0];


    const validation =
        validatePdfFile(
            firstFile,
            MAX_FILE_SIZE
        );


    if (!validation.valid) {

        showNotification(
            validation.message,
            "warning"
        );

        return;

    }


    selectedFiles = [
        firstFile
    ];


    await renderSelectedFile();


    if (filesToAdd.length > 1) {

        showNotification(
            "Split PDF works with one PDF at a time. Additional files were not added.",
            "warning"
        );

    } else {

        clearNotification();

    }

}


// ==========================================
// RENDER SELECTED FILE
// ==========================================

async function renderSelectedFile() {

    selectedFilesContainer.innerHTML =
        "";


    if (selectedFiles.length === 0) {

        workspaceSummary.textContent =
            "";

        workspaceSummary.classList.remove(
            "is-visible"
        );

        splitPdfPanel.classList.remove(
            "is-visible"
        );

        outputFilePanel.classList.remove(
            "is-visible"
        );

        workspaceActions.classList.remove(
            "is-visible"
        );

        return;

    }


    const file =
        selectedFiles[0];


    // ==========================================
    // FILE CARD
    // ==========================================

    const fileCard =
        document.createElement("div");

    fileCard.className =
        "file-card";


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


    const removeButton =
        document.createElement("button");

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

            selectedFiles = [];

            fileInput.value = "";

            splitPageRanges.value =
                "";

            clearNotification();

            renderSelectedFile();

        }
    );


    fileDetails.appendChild(
        fileName
    );

    fileDetails.appendChild(
        fileSize
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


    selectedFilesContainer.appendChild(
        fileCard
    );


    // ==========================================
    // READ PAGE COUNT
    // ==========================================

    try {

        const fileBytes =
            await file.arrayBuffer();


        const sourcePdf =
            await PDFDocument.load(
                fileBytes
            );


        const pageCount =
            sourcePdf.getPageCount();


        workspaceSummary.textContent =
            `1 file • ${
                formatFileSize(
                    file.size
                )
            } • ${pageCount} ${
                pageCount === 1
                    ? "page"
                    : "pages"
            }`;


        splitPageRanges.placeholder =
            pageCount === 1
                ? "1"
                : `1-${pageCount}`;


    } catch (error) {

        console.error(
            "Unable to read PDF:",
            error
        );


        workspaceSummary.textContent =
            `1 file • ${
                formatFileSize(
                    file.size
                )
            }`;

    }


    workspaceSummary.classList.add(
        "is-visible"
    );

    splitPdfPanel.classList.add(
        "is-visible"
    );

    outputFilePanel.classList.add(
        "is-visible"
    );

    workspaceActions.classList.add(
        "is-visible"
    );

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


        fileInput.value = "";

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
// SPLIT PDF
// ==========================================

splitPdfButton.addEventListener(
    "click",
    async () => {

        if (
            selectedFiles.length !== 1
        ) {

            showNotification(
                "Please select one PDF to split.",
                "warning"
            );

            return;

        }


        const file =
            selectedFiles[0];


        const rangesText =
            splitPageRanges
                .value
                .trim();


        if (!rangesText) {

            showNotification(
                "Please enter at least one page range.",
                "warning"
            );

            return;

        }


        try {

            const fileBytes =
                await file.arrayBuffer();


            const sourcePdf =
                await PDFDocument.load(
                    fileBytes
                );


            const pageCount =
                sourcePdf.getPageCount();


            const rangeParts =
                rangesText
                    .split(",")
                    .map(
                        (range) =>
                            range.trim()
                    )
                    .filter(Boolean);


            const parsedRanges =
                [];


            for (
                const range
                of rangeParts
            ) {

                const match =
                    range.match(
                        /^(\d+)(?:-(\d+))?$/
                    );


                if (!match) {

                    showNotification(
                        `Invalid page range: ${range}`,
                        "warning"
                    );

                    return;

                }


                const startPage =
                    Number(
                        match[1]
                    );


                const endPage =
                    match[2]
                        ? Number(
                            match[2]
                        )
                        : startPage;


                if (
                    startPage < 1 ||
                    endPage >
                        pageCount ||
                    startPage >
                        endPage
                ) {

                    showNotification(
                        `Please enter ranges between 1 and ${pageCount}.`,
                        "warning"
                    );

                    return;

                }


                parsedRanges.push({
                    startPage,
                    endPage
                });

            }


            splitPdfButton.disabled =
                true;

            splitPdfButton.textContent =
                "Splitting...";


            const baseName =
                getOutputBaseName();


            for (
                let rangeIndex = 0;
                rangeIndex <
                    parsedRanges.length;
                rangeIndex++
            ) {

                const {
                    startPage,
                    endPage
                } =
                    parsedRanges[
                        rangeIndex
                    ];


                const splitPdf =
                    await PDFDocument.create();


                const pageIndices =
                    [];


                for (
                    let pageNumber =
                        startPage;
                    pageNumber <=
                        endPage;
                    pageNumber++
                ) {

                    pageIndices.push(
                        pageNumber - 1
                    );

                }


                const copiedPages =
                    await splitPdf.copyPages(
                        sourcePdf,
                        pageIndices
                    );


                copiedPages.forEach(
                    (page) => {

                        splitPdf.addPage(
                            page
                        );

                    }
                );


                const splitPdfBytes =
                    await splitPdf.save();


                const blob =
                    new Blob(
                        [splitPdfBytes],
                        {
                            type:
                                "application/pdf"
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
                    `${
                        baseName
                    }-${
                        rangeIndex + 1
                    }.pdf`;


                document.body.appendChild(
                    downloadLink
                );


                downloadLink.click();

                downloadLink.remove();


                URL.revokeObjectURL(
                    downloadUrl
                );

            }


            showNotification(
                `${
                    parsedRanges.length
                } split PDF${
                    parsedRanges.length ===
                    1
                        ? ""
                        : "s"
                } created successfully.`,
                "success"
            );


        } catch (error) {

            console.error(
                "PDF split failed:",
                error
            );


            showNotification(
                "Unable to split this PDF.",
                "error"
            );


        } finally {

            splitPdfButton.disabled =
                false;

            splitPdfButton.textContent =
                "Split PDF";

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

        splitPageRanges.value =
            "";

        outputFileName.value =
            "DocsFusion-Split";

        clearNotification();

        renderSelectedFile();

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

renderSelectedFile();