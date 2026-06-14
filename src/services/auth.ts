interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        id: string;
        name: string;
        role: string;
    };
}

interface RegisterResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface ApiError {
    detail: string;
}

// Simulando a chamada de Login
export async function mockLogin(email: string, password: string): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Regra para o teste passar visualmente
            if (email && password.length >= 6) {
                resolve({
                    access_token: "mock-jwt-token-ey123456789...",
                    token_type: "Bearer",
                    user: {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        name: "Professor Teste",
                        role: "professor"
                    }
                });
            } else {
                reject({detail: "Email inválido ou senha muito curta."} satisfies ApiError);
            }
        }, 1000); // 1 segundo de delay para simular a rede
    });
}

// Simulando a chamada de Cadastro (Register)
export async function mockRegister(name: string, email: string, password: string, role: string): Promise<RegisterResponse> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email && password.length >= 6) {
                resolve({
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: name,
                    email: email,
                    role: role,
                    created_at: new Date().toISOString()
                });
            } else {
                reject({detail: "Preencha todos os campos corretamente."} satisfies ApiError);
            }
        }, 1000); // 1 segundo de delay para simular a rede
    });
}