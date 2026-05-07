const BASE_URL = 'https://69fbf37dfce564e25917170d.mockapi.io/api/v1';

const API = {
    // CRUD Exercises (Danh mục bài tập)
    getExercises: async () => (await fetch(`${BASE_URL}/exercises`)).json(),
    addExercise: async (data) => (await fetch(`${BASE_URL}/exercises`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) })).json(),
    updateExercise: async (id, data) => (await fetch(`${BASE_URL}/exercises/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) })).json(),
    deleteExercise: async (id) => await fetch(`${BASE_URL}/exercises/${id}`, { method: 'DELETE' }),

    // CRUD Workouts (Nhật ký tập luyện)
    getWorkouts: async () => (await fetch(`${BASE_URL}/workouts`)).json(),
    addWorkout: async (data) => (await fetch(`${BASE_URL}/workouts`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) })).json(),
    updateWorkout: async (id, data) => (await fetch(`${BASE_URL}/workouts/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) })).json(),
    deleteWorkout: async (id) => await fetch(`${BASE_URL}/workouts/${id}`, { method: 'DELETE' })
};