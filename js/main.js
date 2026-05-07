document.addEventListener('DOMContentLoaded', async () => {
    // 1. Scroll effect for Navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            document.getElementById('mainNav').classList.add('scrolled');
        } else {
            document.getElementById('mainNav').classList.remove('scrolled');
        }
    });

    const $grid = $('#workoutGrid');
    const $loading = $('#loadingState');
    
    // Render Skeletons
    let skeletons = '';
    for(let i=0; i<6; i++) {
        skeletons += `
        <div class="col-md-6 col-xl-4">
            <div class="premium-card p-4 h-100 bg-white">
                <div class="skeleton" style="height: 20px; width: 40%; margin-bottom: 15px;"></div>
                <div class="skeleton" style="height: 30px; width: 80%; margin-bottom: 20px;"></div>
                <div class="d-flex gap-2">
                    <div class="skeleton" style="height: 40px; width: 50%; border-radius: 8px;"></div>
                    <div class="skeleton" style="height: 40px; width: 50%; border-radius: 8px;"></div>
                </div>
            </div>
        </div>`;
    }
    $loading.html(skeletons);

    // 2. Fetch Data
    try {
        const [exercises, workouts] = await Promise.all([API.getExercises(), API.getWorkouts()]);
        
        let exMap = {};
        exercises.forEach(ex => exMap[ex.id] = ex);

        let html = '';
        let totalCal = 0, totalDuration = 0;

        // Render Data
        workouts.reverse().forEach(w => {
            const ex = exMap[w.exercise_id];
            if(ex) {
                const cal = Number(w.duration) * Number(ex.cal_per_min);
                totalCal += cal;
                totalDuration += Number(w.duration);
                
                // Card HTML
                html += `
                <div class="col-md-6 col-xl-4 workout-item" data-muscle="${ex.muscle_group}" data-name="${ex.name.toLowerCase()}">
                    <div class="premium-card p-4 h-100 bg-white d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-light text-primary border px-3 py-2 rounded-pill fw-semibold">${ex.muscle_group}</span>
                            <small class="text-muted fw-medium">${w.date.split('-').reverse().join('/')}</small>
                        </div>
                        <h4 class="fw-bolder mb-3" style="font-family: 'Poppins';">${ex.name}</h4>
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

        // 3. Cập nhật Thống kê
        const GOAL = 5000;
        let percent = (totalCal / GOAL) * 100;
        if(percent > 100) percent = 100;

        $('#statWorkouts').text(workouts.length);
        $('#statCalories').text(totalCal.toLocaleString());
        $('#statDuration').text((totalDuration / 60).toFixed(1));
        
        // CSS Circular Chart Animation
        setTimeout(() => {
            document.getElementById('weeklyProgress').style.background = `conic-gradient(var(--bs-blue) ${percent}%, #e9ecef 0%)`;
            document.querySelector('.circular-value').innerText = Math.round(percent) + '%';
        }, 500);

        // 4. Render Layout & jQuery Effects
        $loading.fadeOut(300, function() {
            if(workouts.length === 0) {
                $('#emptyState').fadeIn();
            } else {
                $grid.html(html).hide().fadeIn(600);
            }
        });

    } catch (error) {
        $loading.hide();
        $('#errorState').fadeIn();
    }

    // 5. jQuery Filter Logic
    $('#searchInput, #filterMuscle').on('input change', function() {
        const text = $('#searchInput').val().toLowerCase();
        const muscle = $('#filterMuscle').val();
        
        $('.workout-item').each(function() {
            const itemText = $(this).data('name');
            const itemMuscle = $(this).data('muscle');
            
            const matchText = itemText.includes(text);
            const matchMuscle = muscle === 'all' || itemMuscle === muscle;
            
            if(matchText && matchMuscle) {
                $(this).fadeIn(300);
            } else {
                $(this).fadeOut(300);
            }
        });
    });
});