$(document).ready(function() {
    let exercisesMap = {};
    let workoutsData = [];
    const workoutModal = new bootstrap.Modal('#workoutModal');

    function showToast(msg) {
        $('#toastMessage').text(msg);
        new bootstrap.Toast('#actionToast').show();
    }

    // 1. Tải dữ liệu ban đầu
    async function loadData() {
        const [exercises, workouts] = await Promise.all([API.getExercises(), API.getWorkouts()]);
        
        // Lưu map bài tập để lấy Nhóm cơ và Calo/phút
        exercises.forEach(ex => {
            exercisesMap[ex.id] = ex;
            $('#workoutExercise').append(`<option value="${ex.id}">${ex.name}</option>`);
        });

        workoutsData = workouts;
        renderTable(workouts);
    }

    // 2. Render bảng (Sử dụng jQuery để tạo hiệu ứng)
    function renderTable(data) {
        let rows = '';
        data.reverse().forEach(w => {
            const ex = exercisesMap[w.exercise_id] || { name: 'N/A', muscle_group: 'N/A', cal_per_min: 0 };
            const totalCal = Number(w.duration) * Number(ex.cal_per_min);

            rows += `
                <tr id="workout-${w.id}">
                    <td class="px-4 fw-medium text-secondary">${w.date.split('-').reverse().join('/')}</td>
                    <td class="fw-bold text-dark">${ex.name}</td>
                    <td><span class="badge bg-info-subtle text-info border border-info-subtle px-3 py-2 rounded-pill">${ex.muscle_group}</span></td>
                    <td class="fw-medium">${w.duration} phút</td>
                    <td class="text-danger fw-bold">${totalCal} kcal</td>
                    <td class="px-4 text-end">
                        <button class="btn btn-sm btn-light btn-edit me-1" data-id="${w.id}"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-light text-danger btn-delete" data-id="${w.id}"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        $('#adminWorkoutTableBody').html(rows).hide().fadeIn(500);
    }

    // 3. Mở Modal Thêm mới
    $('#btnOpenAddModal').click(() => {
        $('#workoutForm')[0].reset();
        $('#editId').val('');
        $('#modalTitle').text('Thêm buổi tập mới');
        workoutModal.show();
    });

    // 4. Mở Modal Chỉnh sửa (Đổ dữ liệu cũ vào form)
    $('#adminWorkoutTableBody').on('click', '.btn-edit', function() {
        const id = $(this).data('id');
        const item = workoutsData.find(w => w.id == id);
        if(item) {
            $('#editId').val(item.id);
            $('#workoutDate').val(item.date);
            $('#workoutExercise').val(item.exercise_id);
            $('#workoutDuration').val(item.duration);
            $('#workoutNote').val(item.note);
            $('#modalTitle').text('Chỉnh sửa buổi tập');
            workoutModal.show();
        }
    });

    // 5. Xử lý Submit (Thêm hoặc Sửa)
    $('#workoutForm').submit(async function(e) {
        e.preventDefault();
        const id = $('#editId').val();
        const payload = {
            date: $('#workoutDate').val(),
            exercise_id: $('#workoutExercise').val(),
            duration: $('#workoutDuration').val(),
            note: $('#workoutNote').val()
        };

        if(id) {
            await API.updateWorkout(id, payload);
            showToast('Đã cập nhật buổi tập!');
        } else {
            await API.addWorkout(payload);
            showToast('Đã thêm buổi tập mới!');
        }

        workoutModal.hide();
        loadData(); // Tải lại bảng
    });

    // 6. Xử lý Xóa (Sử dụng hiệu ứng jQuery fadeOut)
    $('#adminWorkoutTableBody').on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        if(confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) {
            $(`#workout-${id}`).fadeOut(400, async function() {
                await API.deleteWorkout(id);
                $(this).remove();
                showToast('Đã xóa dữ liệu!');
            });
        }
    });

    loadData();
});