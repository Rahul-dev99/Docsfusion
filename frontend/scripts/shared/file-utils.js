/**
 * DocsFusion
 * Shared file utility functions
 */


// ==========================================
// FILE SIZE
// ==========================================

export function formatFileSize(bytes) {

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

    const size =
        bytes /
        Math.pow(1024, unitIndex);

    return `${
        size.toFixed(
            unitIndex === 0 ? 0 : 1
        )
    } ${units[unitIndex]}`;

}


// ==========================================
// PDF FILE CHECK
// ==========================================

export function isPdfFile(file) {

    const fileName =
        file.name.toLowerCase();

    return (
        file.type === "application/pdf" ||
        fileName.endsWith(".pdf")
    );

}


// ==========================================
// PDF VALIDATION
// ==========================================

export function validatePdfFile(
    file,
    maxFileSize
) {

    if (!isPdfFile(file)) {

        return {
            valid: false,
            message:
                `${file.name} can't be added. Please upload PDF files only.`
        };

    }


    if (file.size > maxFileSize) {

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