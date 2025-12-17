import { prisma } from '@/lib/prisma';
import { comparePassword, generateTokenPair } from '@/lib/auth-utils';
import {
  successResponse,
  errorResponse,
  ValidationError,
  AuthenticationError,
  getJsonBody,
  generateRequestId,
  validateRequired,
  validateEmail,
} from '@/lib/error-handler';
import { applySecurityMiddleware } from '@/lib/security-headers';

export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    // Extrair e validar body
    const body = await getJsonBody<{ email?: string; password?: string }>(request);
    const { email, password } = body;

    // Validação de entrada
    validateRequired(email, 'Email');
    validateRequired(password, 'Senha');

    // Type narrowing após validações
    if (typeof email !== 'string') {
      throw new ValidationError('Email deve ser uma string', 'email');
    }
    if (typeof password !== 'string') {
      throw new ValidationError('Senha deve ser uma string', 'password');
    }

    validateEmail(email);

    // Buscar usuário pelo email
    const user = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AuthenticationError('Email ou senha incorretos');
    }

    // Verificar senha usando bcrypt
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new AuthenticationError('Email ou senha incorretos');
    }

    // Gerar tokens JWT
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: 'admin',
      permissions: [],
    });

    console.log(`✅ Login realizado: ${user.email} (${requestId})`);

    // Criar resposta
    const response = successResponse(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'admin',
          permissions: [],
        },
      },
      200
    );

    // Adicionar security headers
    return applySecurityMiddleware(response, requestId);
  } catch (error) {
    return errorResponse(error, undefined, requestId);
  }
}
