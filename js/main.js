document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) document.getElementById('mainNav').classList.add('scrolled');
        else document.getElementById('mainNav').classList.remove('scrolled');
    });

    const $grid = $('#workoutGrid');
    let exercisesMap = {};

    async function loadData() {
        try {
            const [exercises, workouts] = await Promise.all([API.getExercises(), API.getWorkouts()]);
            
            // Render select box
            const selectEx = document.getElementById('workoutExercise');
            selectEx.innerHTML = '<option value="">-- Chọn bài tập --</option>';
            exercises.forEach(ex => {
                exercisesMap[ex.id] = ex;
                selectEx.innerHTML += `<option value="${ex.id}">${ex.name}</option>`;
            });

            let html = '';
            let totalCal = 0, totalDuration = 0;

            workouts.reverse().forEach(w => {
                const ex = exercisesMap[w.exercise_id];
                if(ex) {
                    const cal = calculateTotalCalories(w.duration, ex.cal_per_min);
                    totalCal += cal;
                    totalDuration += Number(w.duration);
                    
                    html += `
                    <div class="col-md-6 col-xl-4 workout-item" data-muscle="${ex.muscle_group}" data-name="${ex.name.toLowerCase()}">
                        <div class="premium-card hover-lift p-4 h-100 bg-white d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-light text-primary border px-3 py-2 rounded-pill fw-semibold">${ex.muscle_group}</span>
                                <small class="text-muted fw-medium">${formatDate(w.date)}</small>
                            </div>
                            <h5 class="fw-bold mb-3">${ex.name}</h5>
                            <div class="mt-auto">
                                <div class="d-flex gap-2 mb-3">
                                    <div class="bg-light p-2 rounded-3 flex-fill text-center">
                                        <small class="d-block text-muted">Thời gian</small>
                                        <span class="fw-bold text-dark fs-5">${w.duration} <span class="fs-6 fw-normal">phút</span></span>
                                    </div>
                                    <div class="bg-primary bg-opacity-10 p-2 rounded-3 flex-fill text-center">
                                        <small class="d-block text-primary">Tiêu hao</small>
                                        <span class="fw-bold text-primary fs-5">${cal} <span class="fs-6 fw-normal">kcal</span></span>
                                    </div>
                                </div>
                                ${w.note ? `<p class="text-secondary small mb-0 mt-2"><i class="bi bi-chat-text me-1"></i> ${w.note}</p>` : ''}
                            </div>
                        </div>
                    </div>`;
                }
            });

            const GOAL = 5000;
            let percent = (totalCal / GOAL) * 100;
            if(percent > 100) percent = 100;

            $('#statWorkouts').text(workouts.length);
            $('#statCalories').text(totalCal.toLocaleString());
            $('#statDuration').text((totalDuration / 60).toFixed(1));
            
            setTimeout(() => {
                document.getElementById('weeklyProgress').style.background = `conic-gradient(var(--bs-blue) ${percent}%, #e9ecef 0%)`;
                document.querySelector('.circular-value').innerText = Math.round(percent) + '%';
            }, 500);

            $grid.html(html).hide().fadeIn(600);

        } catch (error) { console.error('Lỗi lấy dữ liệu:', error); }
    }

    document.getElementById('formAddWorkout').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            date: document.getElementById('workoutDate').value,
            exercise_id: document.getElementById('workoutExercise').value,
            duration: document.getElementById('workoutDuration').value,
            note: document.getElementById('workoutNote').value
        };
        await API.addWorkout(payload);
        e.target.reset();
        document.getElementById('explore').scrollIntoView({behavior: 'smooth'});
        loadData();
    });

    $('#searchInput, #filterMuscle').on('input change', function() {
        const text = $('#searchInput').val().toLowerCase();
        const muscle = $('#filterMuscle').val();
        
        $('.workout-item').each(function() {
            const matchText = $(this).data('name').includes(text);
            const matchMuscle = muscle === 'all' || $(this).data('muscle') === muscle;
            if(matchText && matchMuscle) $(this).fadeIn(300); else $(this).fadeOut(300);
        });
    });

    loadData();
});