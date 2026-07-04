/* =====================================
   GIAO TIẾP API - MOCKAPI & GOOGLE SHEETS
===================================== */
const FitTrackAPI = {
    /* ==================================
       QUẢN LÝ NHẬT KÝ TẬP LUYỆN (WORKOUTS)
       ================================== */
    getWorkouts: function () {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.WORKOUTS_ENDPOINT)
            .then(function (res) {
                if (!res.ok) throw new Error("Không thể tải dữ liệu workout");
                return res.json();
            });
    },

    getWorkoutById: function (id) {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.WORKOUTS_ENDPOINT + "/" + id)
            .then(function (res) {
                if (!res.ok) throw new Error("Không tìm thấy workout");
                return res.json();
            });
    },

    addWorkout: function (data) {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.WORKOUTS_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(function (res) {
            if (!res.ok) throw new Error("Thêm workout thất bại");
            return res.json();
        });
    },

    updateWorkout: function (id, data) {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.WORKOUTS_ENDPOINT + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(function (res) {
            if (!res.ok) throw new Error("Cập nhật workout thất bại");
            return res.json();
        });
    },

    deleteWorkout: function (id) {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.WORKOUTS_ENDPOINT + "/" + id, {
            method: "DELETE"
        }).then(function (res) {
            if (!res.ok) throw new Error("Xóa workout thất bại");
            return res.json();
        });
    },

    /* ==================================
       QUẢN LÝ THƯ VIỆN BÀI TẬP (EXERCISES)
       ================================== */

    getExercises: function () {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.EXERCISES_ENDPOINT)
            .then(function (res) {
                if (!res.ok) throw new Error("Không thể tải dữ liệu exercises");
                return res.json();
            });
    },

    addExercise: function (data) {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.EXERCISES_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(function (res) {
            if (!res.ok) throw new Error("Thêm bài tập thất bại");
            return res.json();
        });
    },

    updateExercise: function (id, data) {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.EXERCISES_ENDPOINT + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(function (res) {
            if (!res.ok) throw new Error("Cập nhật bài tập thất bại");
            return res.json();
        });
    },

    deleteExercise: function (id) {
        return fetch(CONFIG.MOCKAPI_BASE_URL + CONFIG.EXERCISES_ENDPOINT + "/" + id, {
            method: "DELETE"
        }).then(function (res) {
            if (!res.ok) throw new Error("Xóa bài tập thất bại");
            return res.json();
        });
    },

    /* ==================================
       XÁC THỰC NGƯỜI DÙNG
       ================================== */
    verifyLogin: function (username, password) {
        const scriptUrl = `${CONFIG.GOOGLE_SHEET_API_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        return fetch(scriptUrl)
            .then(function (res) {
                if (!res.ok) throw new Error("Không thể kết nối tới máy chủ xác thực.");
                return res.json();
            })
            .then(function (data) {
                if (data.success) {
                    return data; 
                } else {
                    throw new Error(data.message || "Tên đăng nhập hoặc mật khẩu không đúng");
                }
            });
    }
};