/* =====================================
   BIẾN TOÀN CỤC
===================================== */
let adminWorkouts = [];
let adminFilteredWorkouts = [];
let adminExercises = [];
let currentPage = 1;
let deleteTargetId = null;
let deleteType = ""; 

/* =====================================
   KIỂM TRA PHIÊN ĐĂNG NHẬP
===================================== */
(function checkSession() {
    const session = JSON.parse(localStorage.getItem(CONFIG.SESSION_KEY) || "null");
    if (!session) {
        window.location.href = "index.html";
        return;
    }
    if (session.role !== "admin") {
        window.location.href = "user.html";
        return;
    }
})();

/* =====================================
   KHỞI TẠO TRANG
===================================== */
$(function () {
    $("#logoutBtn").on("click", function () {
        localStorage.removeItem(CONFIG.SESSION_KEY);
        window.location.href = "index.html";
    });

    loadAdminData();
    $("#adminSearchInput").on("keyup", function () {
        currentPage = 1;
        applyAdminSearch();
    });

    $("#addExerciseBtn").on("click", function () {
        $("#exerciseForm")[0].reset();
        $("#exId").val("");
        $("#exModalTitle").text("Thêm Bài Tập Chuẩn");
        new bootstrap.Modal(document.getElementById("exerciseFormModal")).show();
    });

    $("#saveExerciseBtn").on("click", function () {
        saveExercise();
    });

    $("#addWorkoutBtn").on("click", function () {
        openWorkoutForm(null);
    });

    $("#saveWorkoutBtn").on("click", function () {
        saveWorkout();
    });

    $("#confirmDeleteBtn").on("click", function () {
        confirmDelete();
    });
});

/* =====================================
   TẢI DỮ LIỆU TỪ MOCKAPI
===================================== */
function loadAdminData() {
    $("#workoutTableBody").html(`
        <tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>
    `);

    Promise.all([FitTrackAPI.getWorkouts(), FitTrackAPI.getExercises()])
        .then(function (results) {
            adminWorkouts = results[0] || [];
            adminExercises = results[1] || [];
            adminFilteredWorkouts = adminWorkouts.slice();

            renderAdminStatistics(adminWorkouts, adminExercises);
            renderWorkoutTable();
            renderExerciseTable(adminExercises);
        })
        .catch(function () {
            $("#workoutTableBody").html("");
            $("#adminEmptyState").removeClass("d-none");
            showToast("Không thể tải dữ liệu. Kiểm tra lại MockAPI!", "error");
        });
}

function renderAdminStatistics(workouts, exercises) {
    const stats = getStatistics(workouts);
    $("#adminTotalWorkouts").text(stats.totalWorkouts);
    $("#adminTotalExercises").text(exercises.length);
    $("#adminTotalCalories").text(stats.totalCalories.toLocaleString("vi-VN"));
    $("#adminTotalMuscleGroups").text(stats.totalMuscleGroups);
}

/* =====================================
   TAB 1: BÀI TẬP CHUẨN (EXERCISES)
===================================== */
function renderExerciseTable(exercises) {
    const tbody = $("#exerciseTableBody");
    tbody.html("");
    
    exercises.forEach(ex => {
        const name = ex.exerciseName || ex.name || "Chưa có tên";
        const category = ex.category || ex.muscleGroup || "Khác";
        const cal = ex.calories || 0;
        const duration = ex.duration || 0;
        const img = ex.image || "https://via.placeholder.com/100?text=No+Img";

        tbody.append(`
            <tr>
                <td><img src="${img}" alt="${name}" onerror="this.src='https://via.placeholder.com/100?text=Lỗi+Ảnh'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #dee2e6;"></td>
                <td class="fw-bold text-dark">${name}</td>
                <td><span class="badge bg-secondary px-2 py-1">${category}</span></td>
                <td class="text-danger fw-bold">${cal} kcal</td>
                <td>${duration} phút</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-action edit-ex-btn" data-id="${ex.id}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action delete-ex-btn" data-id="${ex.id}" data-name="${name}">
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>
        `);
    });

    $(".edit-ex-btn").on("click", function () {
        const id = $(this).data("id");
        const ex = adminExercises.find(e => String(e.id) === String(id));
        
        if (ex) {
            $("#exId").val(ex.id);
            $("#exName").val(ex.exerciseName || ex.name || "");
            $("#exCategory").val(ex.category || ex.muscleGroup || "Ngực");
            $("#exImage").val(ex.image || "");
            $("#exCal").val(ex.calories || "");
            $("#exDuration").val(ex.duration || "");
            $("#exModalTitle").text("Sửa Bài Tập Chuẩn");
            new bootstrap.Modal(document.getElementById("exerciseFormModal")).show();
        }
    });

    $(".delete-ex-btn").on("click", function () {
        deleteTargetId = $(this).data("id");
        deleteType = "exercise"; 
        $("#deleteWorkoutName").text("bài tập chuẩn: " + $(this).data("name"));
        new bootstrap.Modal(document.getElementById("deleteConfirmModal")).show();
    });
}

function saveExercise() {
    const id = $("#exId").val();
    
    const payload = {
        exerciseName: $("#exName").val().trim(),
        category: $("#exCategory").val(),
        calories: Number($("#exCal").val()) || 0,
        duration: Number($("#exDuration").val()) || 0,
        image: $("#exImage").val().trim()
    };

    if(!payload.exerciseName) return showToast("Vui lòng nhập tên bài tập", "warning");

    const btn = $("#saveExerciseBtn");
    const spinner = $("#saveExSpinner");
    
    btn.prop("disabled", true);
    btn.find(".btn-text").text("Đang lưu...");
    spinner.removeClass("d-none");

    const apiCall = id ? FitTrackAPI.updateExercise(id, payload) : FitTrackAPI.addExercise(payload);

    apiCall.then(() => {
        bootstrap.Modal.getInstance(document.getElementById("exerciseFormModal")).hide();
        showToast(id ? "Cập nhật bài tập thành công!" : "Đã thêm bài tập chuẩn vào thư viện!", "success");
        loadAdminData(); 
    }).catch(() => {
        showToast("Lỗi khi lưu bài tập", "error");
    }).finally(() => {
        btn.prop("disabled", false);
        btn.find(".btn-text").text("Lưu Bài Tập");
        spinner.addClass("d-none");
    });
}

/* =====================================
   TAB 2: NHẬT KÝ WORKOUT
===================================== */
function applyAdminSearch() {
    const keyword = $("#adminSearchInput").val().trim().toLowerCase();
    adminFilteredWorkouts = adminWorkouts.filter(function (w) {
        return !keyword || (w.name && w.name.toLowerCase().includes(keyword));
    });
    renderWorkoutTable();
}

function renderWorkoutTable() {
    const tbody = $("#workoutTableBody");
    tbody.html("");

    if (!adminFilteredWorkouts || adminFilteredWorkouts.length === 0) {
        $("#adminEmptyState").removeClass("d-none");
        $("#paginationContainer").html("");
        return;
    }

    $("#adminEmptyState").addClass("d-none");
    const totalPages = Math.ceil(adminFilteredWorkouts.length / CONFIG.ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const pageItems = adminFilteredWorkouts.slice(start, start + CONFIG.ITEMS_PER_PAGE);

    pageItems.forEach(function (workout) {
        const img = workout.image || "https://via.placeholder.com/100?text=No+Img";
        const row = `
            <tr>
                <td><img src="${img}" alt="${workout.name}" onerror="this.src='https://via.placeholder.com/100?text=Lỗi+Ảnh'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
                <td class="fw-semibold text-dark">${workout.name}</td>
                <td><span class="badge bg-secondary">${workout.muscleGroup}</span></td>
                <td class="text-danger fw-bold">${formatCalories(workout.calories)}</td>
                <td>${formatDuration(workout.duration)}</td>
                <td>${formatDate(workout.date)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-action edit-wo-btn" data-id="${workout.id}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action delete-wo-btn" data-id="${workout.id}" data-name="${workout.name}">
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });

    $(".edit-wo-btn").on("click", function () {
        const id = $(this).data("id");
        const workout = adminWorkouts.find(w => String(w.id) === String(id));
        if (workout) openWorkoutForm(workout);
    });

    $(".delete-wo-btn").on("click", function () {
        deleteTargetId = $(this).data("id");
        deleteType = "workout"; 
        $("#deleteWorkoutName").text("nhật ký: " + $(this).data("name"));
        new bootstrap.Modal(document.getElementById("deleteConfirmModal")).show();
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = $("#paginationContainer");
    container.html("");
    if (totalPages <= 1) return;

    container.append(`<li class="page-item ${currentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage - 1}"><i class="bi bi-chevron-left"></i></a></li>`);
    for (let i = 1; i <= totalPages; i++) {
        container.append(`<li class="page-item ${i === currentPage ? "active" : ""}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
    }
    container.append(`<li class="page-item ${currentPage === totalPages ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage + 1}"><i class="bi bi-chevron-right"></i></a></li>`);

    $(".page-link").on("click", function (e) {
        e.preventDefault();
        const page = Number($(this).data("page"));
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderWorkoutTable();
        }
    });
}

/* =====================================
   MỞ FORM THÊM NHẬT KÝ VÀ RENDER BẢNG CHỌN
===================================== */
function openWorkoutForm(workout) {
    clearFormErrors("workout");
    const listBody = $("#exerciseSelectList");
    listBody.empty();

    adminExercises.forEach(function (ex) {
        const name = ex.exerciseName || ex.name || "Chưa có tên";
        const cat = ex.category || ex.muscleGroup || "Khác";
        const cal = ex.calories || 0;
        const dur = ex.duration || 0;
        const img = ex.image || "https://via.placeholder.com/40?text=Img";
        const row = $(`
            <tr style="cursor: pointer;">
                <td><img src="${img}" onerror="this.src='https://via.placeholder.com/40?text=Err'" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;"></td>
                <td class="align-middle fw-bold">${name}</td>
                <td class="align-middle"><span class="badge bg-secondary">${cat}</span></td>
            </tr>
        `);
        row.on("click", function () {
            listBody.find("tr").removeClass("table-primary");
            $(this).addClass("table-primary");
            $("#name").val(name);
            $("#muscleGroup").val(cat);
            $("#calories").val(cal);
            $("#duration").val(dur);
            $("#image").val(img);
        });

        listBody.append(row);
    });
    if (workout) {
        $("#formModalTitle").text("Sửa Workout (Nhật ký User)");
        $("#workoutId").val(workout.id);
        
        $("#name").val(workout.name);
        $("#muscleGroup").val(workout.muscleGroup);
        $("#calories").val(workout.calories);
        $("#duration").val(workout.duration);
        $("#image").val(workout.image);
        $("#date").val(workout.date);
        $("#notes").val(workout.notes);
    } else {
        $("#formModalTitle").text("Thêm Workout (Nhật ký User)");
        $("#workoutForm")[0].reset();
        $("#workoutId").val("");
    }

    new bootstrap.Modal(document.getElementById("workoutFormModal")).show();
}

function saveWorkout() {
    const formData = {
        name: $("#name").val().trim(), 
        muscleGroup: $("#muscleGroup").val().trim(),
        calories: $("#calories").val(),
        duration: $("#duration").val(),
        image: $("#image").val().trim(),
        date: $("#date").val(),
        notes: $("#notes").val().trim()
    };

    if(!formData.name) {
        showToast("Vui lòng click chọn 1 bài tập từ thư viện phía trên!", "warning");
        return;
    }

    const errors = validateWorkout(formData);
    if (Object.keys(errors).length > 0) {
        displayValidationErrors(errors);
        return;
    }

    clearFormErrors("workout");
    const id = $("#workoutId").val();

    $("#saveWorkoutBtn").prop("disabled", true);
    $("#saveSpinner").removeClass("d-none");

    const apiCall = id ? FitTrackAPI.updateWorkout(id, formData) : FitTrackAPI.addWorkout(formData);

    apiCall.then(function () {
        showToast(id ? "Cập nhật workout thành công!" : "Thêm workout thành công!", "success");
        bootstrap.Modal.getInstance(document.getElementById("workoutFormModal")).hide();
        loadAdminData();
    }).catch(function () {
        showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    }).finally(function () {
        $("#saveWorkoutBtn").prop("disabled", false);
        $("#saveSpinner").addClass("d-none");
    });
}

function displayValidationErrors(errors) {
    clearFormErrors("workout");
    Object.keys(errors).forEach(function (field) {
        const input = $("#" + field);
        input.addClass("is-invalid");
        input.siblings(".error-feedback").addClass("d-block").text(errors[field]);
    });
}

/* =====================================
   XÓA DỮ LIỆU (CHUNG)
===================================== */
function confirmDelete() {
    if (!deleteTargetId) return;

    $("#confirmDeleteBtn").prop("disabled", true);
    $("#deleteSpinner").removeClass("d-none");

    const apiCall = (deleteType === "exercise") 
        ? FitTrackAPI.deleteExercise(deleteTargetId) 
        : FitTrackAPI.deleteWorkout(deleteTargetId);

    apiCall.then(function () {
        showToast("Đã xóa dữ liệu thành công!", "success");
        bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal")).hide();
        deleteTargetId = null;
        loadAdminData(); 
    }).catch(function () {
        showToast("Không thể xóa. Vui lòng thử lại!", "error");
    }).finally(function () {
        $("#confirmDeleteBtn").prop("disabled", false);
        $("#deleteSpinner").addClass("d-none");
    });
}