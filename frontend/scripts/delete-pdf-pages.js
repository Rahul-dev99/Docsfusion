/**
 * DocsFusion
 * Delete PDF Pages page
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

const deletePagesPanel =
    document.getElementById("delete-pages-panel");

const deletePageRanges =
    document.getElementById("delete-page-ranges");

const outputFilePanel =
    document.getElementById("output-file-panel");

const outputFileName =
    document.getElementById("output-file-name");

const workspaceActions =
    document.getElementById("workspace-actions");

const deletePagesButton =
    document.getElementById("delete-pages-button");

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
            "DocsFusion-Pages-Removed";

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
            "DocsFusion-Pages-Removed";

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
            "Delete Pages works with one PDF at a time. Remove the current PDF before adding another.",
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
            "Delete Pages works with one PDF at a time. Additional files were not added.",
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

        deletePagesPanel.classList.remove(
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

            fileInput.value =
                "";

            deletePageRanges.value =
                "";

            outputFileName.value =
                "DocsFusion-Pages-Removed";

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


        const pdfDoc =
            await PDFDocument.load(
                fileBytes
            );


        const pageCount =
            pdfDoc.getPageCount();


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


        deletePageRanges.placeholder =
            pageCount === 1
                ? "1"
                : `2, 4, 7-${pageCount}`;


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

    deletePagesPanel.classList.add(
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
// PARSE PAGES TO DELETE
// ==========================================

function getPageIndexesToDelete(
    pageCount
) {

    const rangesText =
        deletePageRanges
            .value
            .trim();


    if (!rangesText) {

        throw new Error(
            "Please enter the pages you want to delete."
        );

    }


    const parts =
        rangesText
            .split(",")
            .map(
                (part) =>
                    part.trim()
            )
            .filter(Boolean);


    const pageIndexes =
        new Set();


    for (const part of parts) {

        const match =
            part.match(
                /^(\d+)(?:-(\d+))?$/
            );


        if (!match) {

            throw new Error(
                `Invalid page selection: ${part}`
            );

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
            endPage > pageCount ||
            startPage > endPage
        ) {

            throw new Error(
                `Please enter pages between 1 and ${pageCount}.`
            );

        }


        for (
            let pageNumber =
                startPage;
            pageNumber <=
                endPage;
            pageNumber++
        ) {

            pageIndexes.add(
                pageNumber - 1
            );

        }

    }


    const indexes =
        Array.from(
            pageIndexes
        );


    if (
        indexes.length >=
        pageCount
    ) {

        throw new Error(
            "You cannot delete every page. At least one page must remain in the PDF."
        );

    }


    return indexes;

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
// DELETE PAGES
// ==========================================

deletePagesButton.addEventListener(
    "click",
    async () => {

        if (
            selectedFiles.length !== 1
        ) {

            showNotification(
                "Please select one PDF to remove pages.",
                "warning"
            );

            return;

        }


        try {

            const file =
                selectedFiles[0];


            const fileBytes =
                await file.arrayBuffer();


            const sourcePdf =
                await PDFDocument.load(
                    fileBytes
                );


            const pageCount =
                sourcePdf.getPageCount();


            let indexesToDelete;


            try {

                indexesToDelete =
                    getPageIndexesToDelete(
                        pageCount
                    );

            } catch (error) {

                showNotification(
                    error.message,
                    "warning"
                );

                return;

            }


            deletePagesButton.disabled =
                true;

            deletePagesButton.textContent =
                "Deleting...";


            /*
             * Remove pages from highest index
             * to lowest index so earlier page
             * numbers do not shift while deleting.
             */

            indexesToDelete
                .sort(
                    (a, b) =>
                        b - a
                )
                .forEach(
                    (pageIndex) => {

                        sourcePdf.removePage(
                            pageIndex
                        );

                    }
                );


            const updatedPdfBytes =
                await sourcePdf.save();


            const blob =
                new Blob(
                    [updatedPdfBytes],
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
                `${
                    indexesToDelete.length
                } ${
                    indexesToDelete.length === 1
                        ? "page"
                        : "pages"
                } deleted successfully.`,
                "success"
            );


        } catch (error) {

            console.error(
                "PDF page deletion failed:",
                error
            );


            showNotification(
                "Unable to remove pages from this PDF.",
                "error"
            );


        } finally {

            deletePagesButton.disabled =
                false;

            deletePagesButton.textContent =
                "Delete Pages";

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

        fileInput.value =
            "";

        deletePageRanges.value =
            "";

        outputFileName.value =
            "DocsFusion-Pages-Removed";

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