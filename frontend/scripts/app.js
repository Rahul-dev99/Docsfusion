/**
 * DocsFusion
 * Main application entry point
 */
import { PDFDocument } from "pdf-lib";
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
const extractPagesPanel =
    document.getElementById("extract-pages-panel");

const extractStartPage =
    document.getElementById("extract-start-page");

const extractEndPage =
    document.getElementById("extract-end-page");

const extractPagesButton =
    document.getElementById("extract-pages-button");
const splitPdfPanel =
    document.getElementById("split-pdf-panel");

const splitPageRanges =
    document.getElementById("split-page-ranges");

const splitPdfButton =
    document.getElementById("split-pdf-button");

const clearAllButton =
    document.getElementById("clear-all-button");
const mergePdfsButton =
    document.getElementById("merge-pdfs-button");
const notification =
    document.getElementById("notification");

// ==========================================
// APPLICATION STATE
// ==========================================

let selectedFiles = [];
let draggedFileIndex = null;

let pointerDragging = false;
let pointerDragStartX = 0;
let pointerDragStartY = 0;
let dragPreview = null;
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

async function renderSelectedFiles() {

    selectedFilesContainer.innerHTML = "";

    selectedFiles.forEach((file, index) => {

        const fileCard = document.createElement("div");

        fileCard.className = "file-card";

        fileCard.draggable = true;

        fileCard.dataset.fileIndex = index;


        // ==========================================
        // DRAG HANDLE
        // ==========================================

        const dragHandle =
            document.createElement("span");

        dragHandle.className = "drag-handle";

        dragHandle.setAttribute(
            "aria-hidden",
            "true"
        );

        dragHandle.textContent = "⋮⋮";

        dragHandle.draggable = false;


        // ==========================================
        // DESKTOP DRAG - WHOLE CARD
        // ==========================================

        fileCard.addEventListener(
    "dragstart",
    (event) => {

        if (window.innerWidth <= 480) {
            event.preventDefault();
            return;
        }

        draggedFileIndex = index;

        fileCard.classList.add(
            "is-dragging"
        );

        event.dataTransfer.effectAllowed =
            "move";

    }
);

        fileCard.addEventListener(
            "dragend",
            () => {

                draggedFileIndex = null;

                fileCard.classList.remove(
                    "is-dragging"
                );

                fileCard.classList.remove(
                    "is-drag-over"
                );

            }
        );


        // ==========================================
        // DESKTOP DROP TARGET
        // ==========================================

        fileCard.addEventListener(
            "dragover",
            (event) => {

                event.preventDefault();

                if (
                    draggedFileIndex === null
                ) {
                    return;
                }

                if (
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
                    draggedFileIndex === null
                ) {
                    return;
                }

                if (
                    draggedFileIndex === index
                ) {

                    draggedFileIndex = null;

                    fileCard.classList.remove(
                        "is-dragging"
                    );

                    return;
                }


                const draggedFile =
                    selectedFiles[
                        draggedFileIndex
                    ];


                selectedFiles.splice(
                    draggedFileIndex,
                    1
                );


                const targetRect =
                    fileCard.getBoundingClientRect();


                const dropAfter =
                    event.clientY >
                    targetRect.top +
                    targetRect.height / 2;


                let newIndex = index;


                if (
                    draggedFileIndex < index
                ) {

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


                draggedFileIndex = null;


                fileCard.classList.remove(
                    "is-dragging"
                );

                fileCard.classList.remove(
                    "is-drag-over"
                );


                renderSelectedFiles();

            }
        );


        // ==========================================
        // MOBILE POINTER DRAG
        // ==========================================

        dragHandle.addEventListener(
            "pointerdown",
            (event) => {

                if (window.innerWidth > 480) {
                    return;
                }

                event.preventDefault();

                pointerDragging = true;

                draggedFileIndex = index;

                pointerDragStartX =
                    event.clientX;

                pointerDragStartY =
                    event.clientY;


                fileCard.classList.add(
                    "is-dragging"
                );


                // Create floating preview

                dragPreview =
                    fileCard.cloneNode(true);


                dragPreview.classList.remove(
                    "is-dragging"
                );

                dragPreview.classList.remove(
                    "is-drag-over"
                );


                dragPreview.style.position =
                    "fixed";

                dragPreview.style.zIndex =
                    "9999";

                dragPreview.style.pointerEvents =
                    "none";

                dragPreview.style.width =
                    `${fileCard.getBoundingClientRect().width}px`;

                dragPreview.style.boxShadow =
                    "0 10px 24px rgba(15, 23, 42, 0.22)";

                dragPreview.style.opacity =
                    "0.95";

                dragPreview.style.transform =
                    "scale(1.02)";


                const rect =
                    fileCard.getBoundingClientRect();


                dragPreview.style.left =
                    `${rect.left}px`;

                dragPreview.style.top =
                    `${rect.top}px`;


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
                    dragPreview.getBoundingClientRect();


                dragPreview.style.left =
                    `${event.clientX - previewRect.width / 2}px`;

                dragPreview.style.top =
                    `${event.clientY - previewRect.height / 2}px`;

            }
        );


        dragHandle.addEventListener(
            "pointerup",
            (event) => {

                if (!pointerDragging) {
                    return;
                }

                event.preventDefault();

                pointerDragging = false;

                fileCard.classList.remove(
                    "is-dragging"
                );


                const cleanupPreview = () => {

                    if (dragPreview) {

                        dragPreview.remove();

                        dragPreview = null;

                    }

                };


                if (
                    draggedFileIndex === null
                ) {

                    cleanupPreview();

                    return;

                }


                const elementAtPoint =
                    document.elementFromPoint(
                        event.clientX,
                        event.clientY
                    );


                const targetCard =
                    elementAtPoint?.closest(
                        ".file-card"
                    );


                if (!targetCard) {

                    draggedFileIndex = null;

                    cleanupPreview();

                    return;

                }


                const targetIndex =
                    Number(
                        targetCard.dataset.fileIndex
                    );


                if (
                    Number.isNaN(targetIndex) ||
                    targetIndex === draggedFileIndex
                ) {

                    draggedFileIndex = null;

                    cleanupPreview();

                    return;

                }


                const draggedFile =
                    selectedFiles[
                        draggedFileIndex
                    ];


                selectedFiles.splice(
                    draggedFileIndex,
                    1
                );


                const targetRect =
                    targetCard.getBoundingClientRect();


                const dropAfter =
                    event.clientY >
                    targetRect.top +
                    targetRect.height / 2;


                let newIndex = targetIndex;


                if (
                    draggedFileIndex < targetIndex
                ) {

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


                draggedFileIndex = null;


                cleanupPreview();


                renderSelectedFiles();

            }
        );


        dragHandle.addEventListener(
            "pointercancel",
            () => {

                pointerDragging = false;

                draggedFileIndex = null;

                fileCard.classList.remove(
                    "is-dragging"
                );


                if (dragPreview) {

                    dragPreview.remove();

                    dragPreview = null;

                }

            }
        );


        // ==========================================
        // FILE ICON
        // ==========================================

        const fileIcon =
            document.createElement("div");

        fileIcon.className =
            "file-icon";

        fileIcon.setAttribute(
            "aria-hidden",
            "true"
        );

        fileIcon.textContent =
            getFileTypeBadge(file.name);


        // ==========================================
        // FILE DETAILS
        // ==========================================

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
            formatFileSize(file.size);


        // ==========================================
        // REMOVE BUTTON
        // ==========================================

        const removeButton =
            document.createElement("button");

        removeButton.type =
            "button";

        removeButton.className =
            "remove-file-button";

        removeButton.dataset.fileIndex =
            index;

        removeButton.setAttribute(
            "aria-label",
            `Remove ${file.name}`
        );

        removeButton.textContent =
            "×";


        // ==========================================
        // BUILD FILE CARD
        // ==========================================

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


        selectedFilesContainer.appendChild(
            fileCard
        );

    });


    // ==========================================
    // WORKSPACE SUMMARY
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


    // Show page extraction controls
    // only when exactly one PDF is selected.

    if (selectedFiles.length === 1) {

    extractPagesPanel.classList.add(
        "is-visible"
    );
    splitPdfPanel.classList.add(
    "is-visible"
    );

    const selectedFile =
        selectedFiles[0];

    try {

        const pageCount =
            await getPdfPageCount(
                selectedFile
            );

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
            "Unable to read PDF page count:",
            error
        );

        extractStartPage.max = "";

        extractEndPage.max = "";

        extractStartPage.value = 1;

        extractEndPage.value = 1;

    }

} else {

    extractPagesPanel.classList.remove(
        "is-visible"
    );
    splitPdfPanel.classList.remove(
    "is-visible"
    );

}

} else {

    workspaceSummary.textContent = "";

    workspaceSummary.classList.remove(
        "is-visible"
    );

    workspaceActions.classList.remove(
        "is-visible"
    );

    extractPagesPanel.classList.remove(
        "is-visible"
    );
    splitPdfPanel.classList.remove(
    "is-visible"
    );
  
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

async function processFiles(files) {

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
async function getPdfPageCount(file) {

    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFDocument.load(arrayBuffer);

    return pdfDoc.getPageCount();

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
mergePdfsButton.addEventListener("click", async () => {

    if (selectedFiles.length === 0) {

        showNotification(
            "Please select at least one PDF.",
            "warning"
        );

        return;

    }

    try {

        mergePdfsButton.disabled = true;

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


            copiedPages.forEach((page) => {

                mergedPdf.addPage(page);

            });

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
            URL.createObjectURL(blob);


        const downloadLink =
            document.createElement("a");


        downloadLink.href =
            downloadUrl;

        downloadLink.download =
            "DocsFusion-Merged.pdf";


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

        mergePdfsButton.disabled = false;

        mergePdfsButton.textContent =
            "Merge PDFs";

    }

});
extractPagesButton.addEventListener("click", async () => {

    if (selectedFiles.length !== 1) {

        showNotification(
            "Please select one PDF to extract pages.",
            "warning"
        );

        return;

    }


    const file =
        selectedFiles[0];


    const startPage =
        Number(extractStartPage.value);

    const endPage =
        Number(extractEndPage.value);


    try {

        const fileBytes =
            await file.arrayBuffer();


        const sourcePdf =
            await PDFDocument.load(
                fileBytes
            );


        const pageCount =
            sourcePdf.getPageCount();


        // Validate the requested page range

        if (
            !Number.isInteger(startPage) ||
            !Number.isInteger(endPage) ||
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


        extractPagesButton.disabled = true;

        extractPagesButton.textContent =
            "Extracting...";


        const extractedPdf =
            await PDFDocument.create();


        // pdf-lib uses page indexes starting at 0.
        // Users use page numbers starting at 1.

        const pageIndices = [];

        for (
            let pageNumber = startPage;
            pageNumber <= endPage;
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


        copiedPages.forEach((page) => {

            extractedPdf.addPage(page);

        });


        const extractedPdfBytes =
            await extractedPdf.save();


        const blob =
            new Blob(
                [extractedPdfBytes],
                {
                    type: "application/pdf"
                }
            );


        const downloadUrl =
            URL.createObjectURL(blob);


        const downloadLink =
            document.createElement("a");


        downloadLink.href =
            downloadUrl;

        downloadLink.download =
            "DocsFusion-Extracted.pdf";


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

        extractPagesButton.disabled = false;

        extractPagesButton.textContent =
            "Extract Pages";

    }

});
splitPdfButton.addEventListener("click", async () => {

    if (selectedFiles.length !== 1) {

        showNotification(
            "Please select one PDF to split.",
            "warning"
        );

        return;

    }


    const file =
        selectedFiles[0];


    const rangesText =
        splitPageRanges.value.trim();


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
                .map((range) => range.trim())
                .filter(Boolean);


        const parsedRanges = [];


        for (const range of rangeParts) {

            const match =
                range.match(/^(\d+)(?:-(\d+))?$/);


            if (!match) {

                showNotification(
                    `Invalid page range: ${range}`,
                    "warning"
                );

                return;

            }


            const startPage =
                Number(match[1]);

            const endPage =
                match[2]
                    ? Number(match[2])
                    : startPage;


            if (
                startPage < 1 ||
                endPage > pageCount ||
                startPage > endPage
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


        splitPdfButton.disabled = true;

        splitPdfButton.textContent =
            "Splitting...";


        for (
            let rangeIndex = 0;
            rangeIndex < parsedRanges.length;
            rangeIndex++
        ) {

            const {
                startPage,
                endPage
            } = parsedRanges[rangeIndex];


            const splitPdf =
                await PDFDocument.create();


            const pageIndices = [];


            for (
                let pageNumber = startPage;
                pageNumber <= endPage;
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


            copiedPages.forEach((page) => {

                splitPdf.addPage(page);

            });


            const splitPdfBytes =
                await splitPdf.save();


            const blob =
                new Blob(
                    [splitPdfBytes],
                    {
                        type: "application/pdf"
                    }
                );


            const downloadUrl =
                URL.createObjectURL(blob);


            const downloadLink =
                document.createElement("a");


            downloadLink.href =
                downloadUrl;


            downloadLink.download =
                `DocsFusion-Split-${rangeIndex + 1}.pdf`;


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
            `${parsedRanges.length} split PDF${
                parsedRanges.length === 1
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

        splitPdfButton.disabled = false;

        splitPdfButton.textContent =
            "Split PDF";

    }

});