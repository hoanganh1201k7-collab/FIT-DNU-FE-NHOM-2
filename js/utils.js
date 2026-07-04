/* =====================================
   HÀM HỖ TRỢ DÙNG CHUNG
===================================== */

/* ===== ĐỊNH DẠNG NGÀY THÁNG ===== */
function formatDate(dateString) {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return day + "/" + month + "/" + year;
}

/* ===== ĐỊNH DẠNG CALORIES ===== */
function formatCalories(value) {
    const num = Number(value) || 0;
    return num.toLocaleString("vi-VN") + " kcal";
}

/* ===== ĐỊNH DẠNG THỜI GIAN (PHÚT) ===== */
function formatDuration(value) {
    const num = Number(value) || 0;
    return num + " phút";
}

/* ===== HIỂN THỊ TOAST BOOTSTRAP ===== */
function showToast(message, type) {
    type = type || "success";

    const toastContainer = $("#toastContainer");
    if (toastContainer.length === 0) {
        $("body").append('<div id="toastContainer" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1080;"></div>');
    }

    const bgClass = type === "success" ? "bg-success"
        : type === "error" ? "bg-danger"
        : type === "warning" ? "bg-warning"
        : "bg-info";

    const iconClass = type === "success" ? "bi-check-circle-fill"
        : type === "error" ? "bi-x-circle-fill"
        : type === "warning" ? "bi-exclamation-triangle-fill"
        : "bi-info-circle-fill";

    const toastId = "toast-" + Date.now();

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${iconClass} me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    $("#toastContainer").append(toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    toastElement.addEventListener("hidden.bs.toast", function () {
        $(this).remove();
    });
}

/* ===== KIỂM TRA URL HỢP LỆ ===== */
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (e) {
        return false;
    }
}

/* ===== VALIDATE FORM WORKOUT ===== */
function validateWorkout(data) {
    const errors = {};

    if (!data.name || data.name.trim() === "") {
        errors.name = "Tên bài tập không được để trống";
    }

    if (!data.muscleGroup || data.muscleGroup.trim() === "") {
        errors.muscleGroup = "Vui lòng chọn nhóm cơ";
    }

    if (!data.calories || Number(data.calories) <= 0) {
        errors.calories = "Calories phải lớn hơn 0";
    }

    if (!data.duration || Number(data.duration) <= 0) {
        errors.duration = "Thời gian phải lớn hơn 0";
    }

    if (!data.image || !isValidUrl(data.image)) {
        errors.image = "URL ảnh không hợp lệ";
    }

    if (!data.date || data.date.trim() === "") {
        errors.date = "Vui lòng chọn ngày tập";
    }

    return errors;
}

/* ===== TÍNH THỐNG KÊ TỔNG QUAN ===== */
function getStatistics(workouts) {
    const stats = {
        totalWorkouts: workouts.length,
        totalCalories: 0,
        totalDuration: 0,
        muscleGroups: new Set()
    };

    workouts.forEach(function (w) {
        stats.totalCalories += Number(w.calories) || 0;
        stats.totalDuration += Number(w.duration) || 0;
        if (w.muscleGroup) stats.muscleGroups.add(w.muscleGroup);
    });

    stats.totalMuscleGroups = stats.muscleGroups.size;
    return stats;
}

/* ===== HIỂN THỊ LỖI VALIDATION TRÊN FORM ===== */
function displayFormErrors(errors, prefix) {
    prefix = prefix || "";
    $("." + prefix + "error-feedback").text("").removeClass("d-block");
    $("." + prefix + "form-control, ." + prefix + "form-select").removeClass("is-invalid");

    Object.keys(errors).forEach(function (field) {
        const input = $("#" + prefix + field);
        input.addClass("is-invalid");
        input.siblings(".error-feedback").addClass("d-block").text(errors[field]);
    });
}

/* ===== XÓA LỖI VALIDATION TRÊN FORM ===== */
function clearFormErrors(prefix) {
    prefix = prefix || "";
    $("#" + prefix + "Form").find(".is-invalid").removeClass("is-invalid");
    $("#" + prefix + "Form").find(".error-feedback").text("").removeClass("d-block");
}

/* ===== HIỂN THỊ / ẨN SKELETON LOADING ===== */
function showSkeleton(containerSelector, count) {
    count = count || 4;
    let html = "";
    for (let i = 0; i < count; i++) {
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card skeleton-card">
                    <div class="skeleton skeleton-img"></div>
                    <div class="card-body">
                        <div class="skeleton skeleton-line w-75 mb-2"></div>
                        <div class="skeleton skeleton-line w-50 mb-2"></div>
                        <div class="skeleton skeleton-line w-100"></div>
                    </div>
                </div>
            </div>
        `;
    }
    $(containerSelector).html(html);
}





/* =====================================
   CHUYỂN ĐỔI GIAO DIỆN SÁNG / TỐI (DARK MODE)
===================================== */
$(function () {
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark') {
        $('html').attr('data-theme', 'dark'); 
        $('#theme-icon').removeClass('bi-moon-fill').addClass('bi-sun-fill text-warning'); // Đổi icon sang Mặt trời
    }
    $('#theme-toggle').on('click', function () {
        const htmlTag = $('html');
        const icon = $('#theme-icon');
        if (htmlTag.attr('data-theme') === 'dark') {
            htmlTag.removeAttr('data-theme');
            localStorage.setItem('theme', 'light');
            icon.removeClass('bi-sun-fill text-warning').addClass('bi-moon-fill text-dark');
        } else {
            htmlTag.attr('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            
            icon.removeClass('bi-moon-fill text-dark').addClass('bi-sun-fill text-warning');
        }
    });
});