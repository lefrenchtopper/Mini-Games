function persistUser(user) {
    if (!user) return;

    if (window.API?.syncAuthUser) {
        window.API.syncAuthUser(user);
        return;
    }

    localStorage.setItem("minihub_user", JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "Player"
    }));
}

async function signupUser(username, email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: username
            }
        }
    });

    if (error) {
        throw error;
    }

    if (data.session) persistUser(data.user);
    return data;
}

async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        throw error;
    }

    persistUser(data.user);
    return data;
}

async function logout() {
    try {
        await window.API.signOut();
    } catch (error) {
        console.error("Logout error:", error);
    }
    window.location.href = "login.html";
}

async function getUser() {
    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
}