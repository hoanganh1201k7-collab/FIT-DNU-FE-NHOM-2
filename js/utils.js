function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function calculateTotalCalories(duration, calPerMin) {
    return (Number(duration) * Number(calPerMin)) || 0;
}
function calculateTotalCalories(duration, calPerMin) {
    return (Number(duration) * Number(calPerMin)) || 0;
}

function calculateTotalCalories(duration, calPerMin) {
    return (Number(duration) * Number(calPerMin)) || 0;
}

function createWorkoutCardHTML(workout, exerciseDetails) {
    const totalCal = calculateTotalCalories(workout.duration, exerciseDetails.cal_per_min);
    const dateFormatted = formatDate(workout.date);
    
    return `
        <div class="col-md-6 mb-4">
            <div class="glass-panel h-100 p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="fw-bold text-white mb-0">${exerciseDetails.name}</h5>
                    <span class="badge bg-dark border border-secondary text-light-gray">${dateFormatted}</span>
                </div>
                
                <div class="d-flex gap-3 mb-3">
                    <div>
                        <small class="text-light-gray d-block mb-1">Thời gian</small>
                        <span class="fs-5 fw-bold text-info">${workout.duration} <span class="fs-6 fw-normal">phút</span></span>
                    </div>
                    <div>
                        <small class="text-light-gray d-block mb-1">Calo đã đốt</small>
                        <span class="fs-5 fw-bold text-danger">${totalCal} <span class="fs-6 fw-normal">kcal</span></span>
                    </div>
                </div>
                
                ${workout.note ? `<div class="p-2 rounded mt-3" style="background: rgba(255,255,255,0.05);"><small class="text-light-gray">📝 ${workout.note}</small></div>` : ''}
            </div>
        </div>
    `;
}