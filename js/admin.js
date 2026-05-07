$(document).ready(function() {
    const exModal = new bootstrap.Modal('#exerciseModal');
    const woModal = new bootstrap.Modal('#workoutModal');
    let exercisesMap = {};
    let workoutsData = [];
    let exercisesData = [];

    function showToast(msg) {
        $('#toastMessage').text(msg);
        new bootstrap.Toast('#actionToast').show();
    }

    // Đổi màu tab khi click
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        $('.nav-link').removeClass('text-dark').addClass('text-secondary');
        $(e.target).removeClass('text-secondary').addClass('text-dark');
    });

    async function loadData() {
        const [exercises, workouts] = await Promise.all([API.getExercises(), API.getWorkouts()]);
        exercisesData = exercises;
        workoutsData = workouts;
        
        $('#woExercise').empty().append('<option value="">Chọn bài tập...</option>');
        exercises.forEach(ex => {
            exercisesMap[ex.id] = ex;
            $('#woExercise').append(`<option value="${ex.id}">${ex.name}</option>`);
        });

        renderExerciseTable();
        renderWorkoutTable();
    }

    // ==== PHẦN 1: QUẢN LÝ BÀI TẬP ====
    function renderExerciseTable() {
        let rows = '';
        exercisesData.forEach(ex => {
            rows += `
                <tr id="ex-row-${ex.id}">
                    <td class="px-4 fw-bold">${ex.name}</td>
                    <td><span class="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">${ex.muscle_group}</span></td>
                    <td class="fw-bold text-danger">${ex.cal_per_min} kcal/phút</td>
                    <td class="px-4 text-end">
                        <button class="btn btn-sm btn-light text-primary btn-edit-ex me-1" data-id="${ex.id}"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-light text-danger btn-delete-ex" data-id="${ex.id}"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`;
        });
        $('#exerciseTableBody').html(rows).hide().fadeIn(300);
    }

    $('#btnOpenAddExercise').click(() => {
        $('#exerciseForm')[0].reset();
        $('#exEditId').val('');
        $('#exModalTitle').text('Thêm Bài Tập');
        exModal.show();
    });

    $('#exerciseTableBody').on('click', '.btn-edit-ex', function() {
        const id = $(this).data('id');
        const ex = exercisesData.find(e => e.id == id);
        if(ex) {
            $('#exEditId').val(ex.id);
            $('#exName').val(ex.name);
            $('#exMuscle').val(ex.muscle_group);
            $('#exCal').val(ex.cal_per_min);
            $('#exModalTitle').text('Sửa Bài Tập');
            exModal.show();
        }
    });

    $('#exerciseForm').submit(async function(e) {
        e.preventDefault();
        const id = $('#exEditId').val();
        const data = { name: $('#exName').val(), muscle_group: $('#exMuscle').val(), cal_per_min: $('#exCal').val() };
        if(id) await API.updateExercise(id, data); else await API.addExercise(data);
        exModal.hide();
        loadData();
        showToast("Đã cập nhật bài tập!");
    });

    $('#exerciseTableBody').on('click', '.btn-delete-ex', function() {
        const id = $(this).data('id');
        if(confirm('Xóa bài tập này?')) {
            $(`#ex-row-${id}`).fadeOut(300, async function() {
                await API.deleteExercise(id);
                loadData();
                showToast('Đã xóa bài tập!');
            });
        }
    });

    // ==== PHẦN 2: QUẢN LÝ NHẬT KÝ ====
    function renderWorkoutTable() {
        let rows = '';
        workoutsData.reverse().forEach(w => {
            const ex = exercisesMap[w.exercise_id] || { name: 'N/A', muscle_group: 'N/A', cal_per_min: 0 };
            const totalCal = calculateTotalCalories(w.duration, ex.cal_per_min);
            rows += `
                <tr id="wo-row-${w.id}">
                    <td class="px-4 fw-medium text-secondary">${formatDate(w.date)}</td>
                    <td class="fw-bold text-dark">${ex.name}</td>
                    <td><span class="badge bg-light text-dark border px-3 py-2 rounded-pill">${ex.muscle_group}</span></td>
                    <td class="fw-medium">${w.duration} phút</td>
                    <td class="text-danger fw-bold">${totalCal} kcal</td>
                    <td class="px-4 text-end">
                        <button class="btn btn-sm btn-light text-primary btn-edit-wo me-1" data-id="${w.id}"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-light text-danger btn-delete-wo" data-id="${w.id}"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`;
        });
        $('#adminWorkoutTableBody').html(rows).hide().fadeIn(300);
    }

    $('#btnOpenAddWorkout').click(() => {
        $('#workoutForm')[0].reset();
        $('#woEditId').val('');
        $('#woModalTitle').text('Thêm Buổi Tập');
        woModal.show();
    });

    $('#adminWorkoutTableBody').on('click', '.btn-edit-wo', function() {
        const id = $(this).data('id');
        const item = workoutsData.find(w => w.id == id);
        if(item) {
            $('#woEditId').val(item.id);
            $('#woDate').val(item.date);
            $('#woExercise').val(item.exercise_id);
            $('#woDuration').val(item.duration);
            $('#woNote').val(item.note);
            $('#woModalTitle').text('Sửa Buổi Tập');
            woModal.show();
        }
    });

    $('#workoutForm').submit(async function(e) {
        e.preventDefault();
        const id = $('#woEditId').val();
        const data = { date: $('#woDate').val(), exercise_id: $('#woExercise').val(), duration: $('#woDuration').val(), note: $('#woNote').val() };
        if(id) await API.updateWorkout(id, data); else await API.addWorkout(data);
        woModal.hide();
        loadData();
        showToast("Đã cập nhật nhật ký!");
    });

    $('#adminWorkoutTableBody').on('click', '.btn-delete-wo', function() {
        const id = $(this).data('id');
        if(confirm('Xóa nhật ký này?')) {
            $(`#wo-row-${id}`).fadeOut(300, async function() {
                await API.deleteWorkout(id);
                $(this).remove();
                showToast('Đã xóa dữ liệu!');
            });
        }
    });

    loadData();
});