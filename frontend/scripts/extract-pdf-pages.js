/**
 * DocsFusion
 * Extract PDF Pages page
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

const extractPagesPanel =
    document.getElementById("extract-pages-panel");

const extractStartPage =
    document.getElementById("extract-start-page");

const extractEndPage =
    document.getElementById("extract-end-page");

const outputFilePanel =
    document.getElementById("output-file-panel");

const outputFileName =
    document.getElementById("output-file-name");

const workspaceActions =
    document.getElementById("workspace-actions");

const extractPagesButton =
    document.getElementById("extract-pages-button");

const clearAllButton =
    document.getElementById("clear-all-button");

const notification =
    document.getElementById("notification");

const mobileMenuButton =
    document.getElementById("mobile-menu-button");

const mainNavigation =
    document.getElementById("main-navigation");


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

function getOutputFileName() {

    let fileName =
        outputFileName.value.trim();


    if (!fileName) {

        fileName =
            "DocsFusion-Extracted";

    }


    fileName =
        fileName.replace(
            /\.pdf$/i,
            ""
        );


    fileName =
        fileName.replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            "-"
        );


    fileName =
        fileName.replace(
            /[.\s]+$/g,
            ""
        );


    if (!fileName) {

        fileName =
            "DocsFusion-Extracted";

    }


    return `${fileName}.pdf`;

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


    if (selectedFiles.length > 0) {

        showNotification(
            "Extract Pages works with one PDF at a time. Remove the current PDF before adding another.",
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
            "Extract Pages works with one PDF at a time. Additional files were not added.",
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

        extractPagesPanel.classList.remove(
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


        extractStartPage.max =
            pageCount;

        extractEndPage.max =
            pageCount;

        extractStartPage.value =
            1;

        extractEndPage.value =
            pageCount;


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


        extractStartPage.max =
            "";

        extractEndPage.max =
            "";

        extractStartPage.value =
            1;

        extractEndPage.value =
            1;

    }


    workspaceSummary.classList.add(
        "is-visible"
    );

    extractPagesPanel.classList.add(
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
// EXTRACT PAGES
// ==========================================

extractPagesButton.addEventListener(
    "click",
    async () => {

        if (
            selectedFiles.length !== 1
        ) {

            showNotification(
                "Please select one PDF to extract pages.",
                "warning"
            );

            return;

        }


        const file =
            selectedFiles[0];


        const startPage =
            Number(
                extractStartPage.value
            );

        const endPage =
            Number(
                extractEndPage.value
            );


        try {

            const fileBytes =
                await file.arrayBuffer();


            const sourcePdf =
                await PDFDocument.load(
                    fileBytes
                );


            const pageCount =
                sourcePdf.getPageCount();


            if (
                !Number.isInteger(
                    startPage
                ) ||
                !Number.isInteger(
                    endPage
                ) ||
                startPage < 1 ||
                endPage > pageCount ||
                startPage > endPage
            ) {

                showNotification(
                    `Please enter a valid page range between 1 and ${pageCount}.`,
                    "warning"
                );

                return;

            }


            extractPagesButton.disabled =
                true;

            extractPagesButton.textContent =
                "Extracting...";


            const extractedPdf =
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
                await extractedPdf.copyPages(
                    sourcePdf,
                    pageIndices
                );


            copiedPages.forEach(
                (page) => {

                    extractedPdf.addPage(
                        page
                    );

                }
            );


            const extractedPdfBytes =
                await extractedPdf.save();


            const blob =
                new Blob(
                    [extractedPdfBytes],
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
                `Pages ${startPage}-${endPage} extracted successfully.`,
                "success"
            );


        } catch (error) {

            console.error(
                "PDF page extraction failed:",
                error
            );


            showNotification(
                "Unable to extract pages from this PDF.",
                "error"
            );


        } finally {

            extractPagesButton.disabled =
                false;

            extractPagesButton.textContent =
                "Extract Pages";

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

        outputFileName.value =
            "DocsFusion-Extracted";

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