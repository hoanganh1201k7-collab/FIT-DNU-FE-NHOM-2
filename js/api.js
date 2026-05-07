const BASE_URL = 'https://69fbf37dfce564e25917170d.mockapi.io/api/v1'; // Thay ID của bạn

const API = {
    getExercises: async () => {
        const res = await fetch(`${BASE_URL}/exercises`);
        return await res.json();
    },
    getWorkouts: async () => {
        const res = await fetch(`${BASE_URL}/workouts`);
        return await res.json();
    },
    // Thêm mới (POST)
    addWorkout: async (data) => {
        const res = await fetch(`${BASE_URL}/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    // Chỉnh sửa (PUT)
    updateWorkout: async (id, data) => {
        const res = await fetch(`${BASE_URL}/workouts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    // Xóa (DELETE)
    deleteWorkout: async (id) => {
        await fetch(`${BASE_URL}/workouts/${id}`, { method: 'DELETE' });
    }
};