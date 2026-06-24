interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        id: string;
        username: string;
        role: string;
    };
}

interface ApiError {
    detail: string;
}

// Simulando a chamada de Login
export async function mockLogin(username: string, password: string): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Regra para o teste passar visualmente
            if (username && password.length >= 6) {
                resolve({
                    access_token: "mock-jwt-token-ey123456789...",
                    token_type: "Bearer",
                    user: {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        username: username,
                        role: "professor"
                    }
                });
            } else {
                reject({detail: "Email inválido ou senha muito curta."} satisfies ApiError);
            }
        }, 1000); // 1 segundo de delay para simular a rede
    });
}
