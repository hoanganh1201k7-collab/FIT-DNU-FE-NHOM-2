/* =====================================
   BIẾN TOÀN CỤC
===================================== */
let allWorkouts = [];
let filteredWorkouts = [];

/* =====================================
   KIỂM TRA PHIÊN ĐĂNG NHẬP
===================================== */
(function checkSession() {
    const session = JSON.parse(localStorage.getItem(CONFIG.SESSION_KEY) || "null");

    if (!session) {
        window.location.href = "index.html";
        return;
    }

    if (session.role === "admin") {
        window.location.href = "admin.html";
        return;
    }
})();

/* =====================================
   KHỞI TẠO TRANG
===================================== */
$(function () {

    // Đăng xuất
    $("#logoutBtn").on("click", function () {
        localStorage.removeItem(CONFIG.SESSION_KEY);
        window.location.href = "index.html";
    });

    loadWorkouts();
    
    $("#searchInput").on("keyup", function () {
        applyFilters();
    });

    $("#filterMuscleGroup").on("change", function () {
        applyFilters();
    });

    $("#filterDate").on("change", function () {
        applyFilters();
    });

    $("#resetFilterBtn").on("click", function () {
        $("#searchInput").val("");
        $("#filterMuscleGroup").val("");
        $("#filterDate").val("");
        applyFilters();
    });

    // Gọi các sự kiện liên quan đến thêm buổi tập
    initUserWorkoutFeatures();
});

/* =====================================
   TẢI DỮ LIỆU WORKOUT (LỊCH SỬ)
===================================== */
function loadWorkouts() {
    showSkeleton("#workoutList", 6);
    $("#emptyState").addClass("d-none");

    FitTrackAPI.getWorkouts()
        .then(function (data) {
            allWorkouts = data || [];
            filteredWorkouts = allWorkouts.slice();

            renderHero(allWorkouts);
            renderStatistics(allWorkouts);
            renderProgress(allWorkouts);
            renderWorkoutList(filteredWorkouts);
        })
        .catch(function () {
            $("#workoutList").html("");
            showToast("Không thể tải dữ liệu lịch sử tập. Vui lòng kiểm tra cấu hình!", "error");
            $("#emptyState").removeClass("d-none");
        });
}

/* =====================================
   THỐNG KÊ DỮ LIỆU
===================================== */
function renderHero(workouts) {
    const stats = getStatistics(workouts);

    $("#heroWorkouts").text(stats.totalWorkouts);
    $("#heroCalories").text(stats.totalCalories.toLocaleString("vi-VN"));
    $("#heroExercises").text(stats.totalWorkouts);
    $("#heroMuscleGroups").text(stats.totalMuscleGroups);
}

function renderStatistics(workouts) {
    const stats = getStatistics(workouts);

    $("#statTotalWorkouts").text(stats.totalWorkouts);
    $("#statTotalCalories").text(stats.totalCalories.toLocaleString("vi-VN"));
    $("#statTotalDuration").text(stats.totalDuration.toLocaleString("vi-VN"));
    $("#statMuscleGroups").text(stats.totalMuscleGroups);
}

/* =====================================
   BIỂU ĐỒ TIẾN ĐỘ (PROGRESS BAR)
===================================== */
function renderProgress(workouts) {
    const stats = getStatistics(workouts);

    const calorieGoal = 5000;
    const durationGoal = 600;
    const workoutGoal = 20;

    const caloriePercent = Math.min(100, Math.round((stats.totalCalories / calorieGoal) * 100));
    const durationPercent = Math.min(100, Math.round((stats.totalDuration / durationGoal) * 100));
    const workoutPercent = Math.min(100, Math.round((stats.totalWorkouts / workoutGoal) * 100));

    $("#progressCalories").css("width", caloriePercent + "%");
    $("#progressCaloriesLabel").text(caloriePercent + "%");

    $("#progressDuration").css("width", durationPercent + "%");
    $("#progressDurationLabel").text(durationPercent + "%");

    $("#progressWorkouts").css("width", workoutPercent + "%");
    $("#progressWorkoutsLabel").text(workoutPercent + "%");
}

/* =====================================
   RENDER LỊCH SỬ WORKOUT
===================================== */
function renderWorkoutList(workouts) {
    const container = $("#workoutList");
    container.html("");

    if (!workouts || workouts.length === 0) {
        $("#emptyState").removeClass("d-none");
        return;
    }

    $("#emptyState").addClass("d-none");

    workouts.forEach(function (workout, index) {
        const displayDuration = workout.duration > 0 ? formatDuration(workout.duration) : "-";
        
        const card = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="workout-card" data-id="${workout.id}" style="animation-delay: ${index * 0.05}s">
                    <img src="${workout.image}" class="workout-img" alt="${workout.name}"
                         onerror="this.src='https://via.placeholder.com/400x250?text=FitTrack'">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="fw-bold mb-0">${workout.name}</h6>
                            <span class="muscle-badge">${workout.muscleGroup}</span>
                        </div>
                        <div class="workout-meta d-flex justify-content-between">
                            <span><i class="bi bi-fire text-danger me-1"></i>${formatCalories(workout.calories)}</span>
                            <span><i class="bi bi-clock me-1"></i>${displayDuration}</span>
                        </div>
                        <div class="workout-meta mt-1">
                            <i class="bi bi-calendar3 me-1"></i>${formatDate(workout.date)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.append(card);
    });

    $(".workout-card").on("click", function () {
        const id = $(this).data("id");
        openWorkoutDetail(id);
    });
}

/* =====================================
   CHI TIẾT WORKOUT (MODAL)
===================================== */
function openWorkoutDetail(id) {
    const workout = allWorkouts.find(function (w) { return String(w.id) === String(id); });
    if (!workout) return;

    $("#detailTitle").text(workout.name);
    $("#detailImage").attr("src", workout.image);
    $("#detailMuscleGroup").text(workout.muscleGroup);
    $("#detailCalories").text(formatCalories(workout.calories));
    $("#detailDuration").text(workout.duration > 0 ? formatDuration(workout.duration) : "-");
    $("#detailDate").text(formatDate(workout.date));
    $("#detailNotes").text(workout.notes && workout.notes.trim() !== "" ? workout.notes : "Không có ghi chú");

    const modal = new bootstrap.Modal(document.getElementById("workoutDetailModal"));
    modal.show();
}

/* =====================================
   ÁP DỤNG BỘ LỌC - TÌM KIẾM
===================================== */
function applyFilters() {
    const keyword = $("#searchInput").val().trim().toLowerCase();
    const muscleGroup = $("#filterMuscleGroup").val();
    const date = $("#filterDate").val();

    filteredWorkouts = allWorkouts.filter(function (w) {
        const matchName = !keyword || (w.name && w.name.toLowerCase().includes(keyword));
        const matchMuscle = !muscleGroup || w.muscleGroup === muscleGroup;
        const matchDate = !date || w.date === date;

        return matchName && matchMuscle && matchDate;
    });

    renderWorkoutList(filteredWorkouts);
}

/* =====================================
   CHỨC NĂNG THÊM BÀI TẬP CỦA USER (BẢNG TRỰC QUAN)
===================================== */
function initUserWorkoutFeatures() {
    
    function loadExerciseOptions() {
        FitTrackAPI.getExercises().then(function(exercises) {
            const listBody = $("#userExerciseSelectList");
            listBody.empty();

            if(exercises.length === 0) {
                listBody.append('<tr><td colspan="3" class="text-center text-muted py-3">Chưa có bài tập nào trong thư viện</td></tr>');
                return;
            }

            exercises.forEach(function(ex) {
                const name = ex.exerciseName || ex.name || "Chưa có tên";
                const cat = ex.category || ex.muscleGroup || "Khác";
                const cal = ex.calories || ex.cal_per_min || 0;
                const dur = ex.duration || 0;
                const img = ex.image || "https://via.placeholder.com/40?text=Img";

                const row = $(`
                    <tr style="cursor: pointer;">
                        <td><img src="${img}" onerror="this.src='https://via.placeholder.com/40?text=Err'" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid #dee2e6;"></td>
                        <td class="align-middle fw-bold">${name}</td>
                        <td class="align-middle"><span class="badge bg-secondary">${cat}</span></td>
                    </tr>
                `);

                row.on("click", function () {
                    listBody.find("tr").removeClass("table-primary");
                    $(this).addClass("table-primary");
                    $("#userSelectedName").val(name);
                    $("#userSelectedMuscle").val(cat);
                    $("#userCalories").val(cal);
                    $("#userSelectedDuration").val(dur);
                    $("#userSelectedImage").val(img);
                });

                listBody.append(row);
            });
        }).catch(function() {
            $("#userExerciseSelectList").html('<tr><td colspan="3" class="text-center text-danger py-3">Lỗi tải danh sách bài tập!</td></tr>');
        });
    }

    // Mở Modal & Khởi tạo dữ liệu
    $("#openUserWorkoutModal").on("click", function() {
        $("#userWorkoutForm")[0].reset();
        $("#userSelectedName").val("");
        $("#userSelectedMuscle").val("");
        $("#userSelectedDuration").val("");
        $("#userSelectedImage").val("");
        
        // Lấy ngày hôm nay theo giờ địa phương
        const today = new Date();
        const offset = today.getTimezoneOffset() * 60000;
        const localToday = (new Date(today - offset)).toISOString().split('T')[0];
        const dateInput = document.getElementById('userDate');
        dateInput.value = localToday;
        dateInput.max = localToday; // Chặn chọn ngày tương lai
        loadExerciseOptions();
        
        new bootstrap.Modal(document.getElementById("userWorkoutModal")).show();
    });

    // Xử lý lưu dữ liệu lên MockAPI
    $("#saveUserWorkoutBtn").on("click", function() {
        const name = $("#userSelectedName").val();
        const date = $("#userDate").val();
        const calories = $("#userCalories").val();
        const muscleGroup = $("#userSelectedMuscle").val();
        const duration = $("#userSelectedDuration").val();
        const image = $("#userSelectedImage").val() || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=60";

        if(!name) {
            showToast("Vui lòng click chọn 1 bài tập từ thư viện phía trên!", "warning");
            return;
        }

        const selectedDate = new Date(date);
        const todayDate = new Date();
        todayDate.setHours(23, 59, 59, 999);

        if (selectedDate > todayDate) {
            showToast("Không thể ghi nhận bài tập cho ngày ở tương lai!", "error");
            return;
        }

        const btn = $(this);
        btn.prop("disabled", true).text("Đang lưu...");

        const newWorkout = {
            name: name,
            muscleGroup: muscleGroup,
            calories: Number(calories) || 0,
            duration: Number(duration) || 0, 
            date: date,
            image: image, 
            notes: "Bài tập chọn từ thư viện"
        };

        FitTrackAPI.addWorkout(newWorkout).then(function() {
            bootstrap.Modal.getInstance(document.getElementById("userWorkoutModal")).hide();
            showToast("Ghi nhận buổi tập thành công!", "success");
            loadWorkouts(); // Tự động làm mới giao diện và lịch sử
        }).catch(function() {
            showToast("Đã có lỗi xảy ra. Vui lòng thử lại!", "error");
        }).finally(function() {
            btn.prop("disabled", false).text("Lưu bài tập");
        });
    });
}