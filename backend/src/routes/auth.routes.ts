import { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  findUserByEmail,
  findUserProfileById,
  resetPassword,
  verifyEmailUser,
  registerOrLoginGoogleUser,
} from "../services/auth.service";
import { checkAuth } from "../middlewares/auth.middleware";
import { sendEmail } from "../services/email.service";

const minSessionDuration = Number(process.env.MIN_SESSION_DURATION) || 1; // en horas
const maxSessionDuration = Number(process.env.MAX_SESSION_DURATION) || 30; // en días

const registerSchema = z.object({
  email: z.string().email("Correo electrónico inválido").max(255),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido").max(255),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  rememberMe: z.boolean().optional(),
});
const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido").max(255),
});
const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const verfyEmailSchema = z.object({
  token: z.string(),
});
const sendEmailVerificationSchema = z.object({
  id: z.string(),
  email: z.email(),
});
const getUserParamsSchema = z.object({
  id: z.string(),
});
export async function authRoutes(fastify: FastifyInstance) {
  const errorServer = (error: any, reply: FastifyReply) => {
    // 💥 Cualquier otro error inesperado (base de datos caída, etc.) lo enviamos como 500
    fastify.log.error(error);
    return reply.status(500).send({
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado",
    });
  };
  const sendVerificationEmail = async (id: string, email: string) => {
    const verificationToken = fastify.jwt.sign(
      { id: id },
      { expiresIn: "24h" }, // Más tiempo que el de password, ya que el usuario puede tardar en revisar su inbox
    );
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Confirma tu cuenta de correo electrónico",
      html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #111827;">¡Te damos la bienvenida!</h2>
            <p style="color: #4b5563;">Gracias por registrarte. Para activar tu cuenta, por favor confirma tu dirección de correo haciendo clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Confirmar Correo Electrónico
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 0.875rem;">Este enlace expirará en 24 horas.</p>
          </div>
        `,
    });
  };
  // 📝 1. Registro de usuarios
  fastify.post("/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      // Si la validación falla, respondemos con un error 400 y los detalles del error
      return reply.status(400).send({
        error: "Datos de registro inválidos",
        details: parsed.error.format(),
      });
    }
    // 🔍 Aquí adentro validaremos lo que viene en el cuerpo de la petición (request.body)
    try {
      const nuevoUsuario = await registerUser(
        parsed.data.email,
        parsed.data.password,
      );
      await sendVerificationEmail(nuevoUsuario.id, nuevoUsuario.email);
      // Verificar email
      /*const verificationToken = fastify.jwt.sign(
        { id: nuevoUsuario.id },
        { expiresIn: "24h" }, // Más tiempo que el de password, ya que el usuario puede tardar en revisar su inbox
      );
       const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: nuevoUsuario.email,
        subject: "Confirma tu cuenta de correo electrónico",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #111827;">¡Te damos la bienvenida!</h2>
            <p style="color: #4b5563;">Gracias por registrarte. Para activar tu cuenta, por favor confirma tu dirección de correo haciendo clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Confirmar Correo Electrónico
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 0.875rem;">Este enlace expirará en 24 horas.</p>
          </div>
        `,
      }); */
      return reply.status(201).send({
        message: "Usuario registrado exitosamente",
        user: nuevoUsuario,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        return reply
          .status(409)
          .send({ error: "El correo electrónico ya está registrado" });
      }
      errorServer(error, reply);
    }
  });
  fastify.post("/send-verification-email", async (request, reply) => {
    const parsed = sendEmailVerificationSchema.safeParse(request.body);
    if (!parsed.success) {
      // Si la validación falla, respondemos con un error 400 y los detalles del error
      return reply.status(400).send({
        error: "Datos de registro inválidos",
        details: parsed.error.format(),
      });
    }
    try {
      // Verificar email
      await sendVerificationEmail(parsed.data.id, parsed.data.email);
      return reply.status(200).send({
        message: "Email enviado",
      });
    } catch (error) {
      errorServer(error, reply);
    }
  });
  // 🔐 2. Inicio de sesión local
  fastify.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      // Si la validación falla, respondemos con un error 400 y los detalles del error
      return reply.status(400).send({
        error: "Datos de inicio de sesión inválidos",
        details: parsed.error.format(),
      });
    }
    try {
      const user = await loginUser(parsed.data.email, parsed.data.password);
      const token = await reply.jwtSign(
        { id: user.id, email: user.email, emailVerified: user.emailVerified },
        {
          expiresIn: parsed.data.rememberMe
            ? `${maxSessionDuration}d`
            : `${minSessionDuration}h`,
        },
      );

      reply.setCookie("identificadorSesion", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: parsed.data.rememberMe
          ? maxSessionDuration * 24 * 60 * 60
          : undefined,
      });
      return reply.status(200).send({
        message: "Inicio de sesión exitoso",
        user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
        return reply
          .status(401)
          .send({ error: "Correo electrónico o contraseña incorrectos" });
      }
      errorServer(error, reply);
    }
  });

  // 🚶‍♂️ 3. Cierre de sesión
  fastify.post("/logout", async (request, reply) => {
    reply.clearCookie("identificadorSesion", {
      path: "/",
    });

    return reply.status(200).send({
      message: "Sesión cerrada con éxito 🚪",
    });
  });

  // 🔒 4. Ruta protegida
  fastify.get("/me", { preHandler: [checkAuth] }, async (request, reply) => {
    const user = await findUserProfileById((request.user as { id: string }).id);
    if (!user) {
      return reply.status(404).send({ error: "Usuario no encontrado" });
    }
    return reply.status(200).send({
      message: "Perfil recuperado con éxito",
      user,
    });
  });

  // 5. Recuperacion de contraseña
  fastify.post(
    "/forgot-password",
    {
      config: {
        rateLimit: {
          max: 5, // Máximo 5 peticiones
          timeWindow: 5 * 60 * 1000, // 5 minutos
        },
      },
    },
    async (request, reply) => {
      const parsed = forgotPasswordSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Datos inválidos",
          details: parsed.error.format(),
        });
      }
      try {
        const existingUser = await findUserByEmail(parsed.data.email);
        if (existingUser) {
          const resetToken = await fastify.jwt.sign(
            { id: existingUser.id },
            { expiresIn: "15m" }, // 👈 Así limitamos su vida útil
          );
          const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
          await sendEmail({
            to: existingUser.email,
            subject: "Restablecer tu contraseña",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #111827;">Recuperación de contraseña</h2>
                <p style="color: #4b5563;">Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar (este enlace expira en 15 minutos):</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Restablecer Contraseña
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 0.875rem;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
              </div>
            `,
          });
        }
        return reply.status(200).send({
          message:
            "Si el correo existe, se ha enviado un enlace de recuperación",
        });
      } catch (error) {
        errorServer(error, reply);
      }
    },
  );

  // 6. Restablecimiento de contraseña
  fastify.post("/reset-password", async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Datos inválidos",
        details: parsed.error.format(),
      });
    }
    try {
      const decoded = await fastify.jwt.verify(parsed.data.token);
      const userId = (decoded as { id: string }).id;
      await resetPassword(userId, parsed.data.newPassword);
      return reply
        .status(200)
        .send({ message: "Contraseña restablecida con éxito" });
    } catch (error: any) {
      if (
        error.code === "FAST_JWT_EXPIRED" ||
        error.code === "FAST_JWT_MALFORMED"
      ) {
        return reply.status(400).send({
          error: "Token inválido o expirado",
          message:
            "El enlace de recuperación ya no es válido. Por favor, solicita uno nuevo.",
        });
      }
      errorServer(error, reply);
    }
  });

  // 7. Verificar Emnail
  fastify.post("/verify-email", async (request, reply) => {
    const parsed = verfyEmailSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Datos inválidos",
        details: parsed.error.format(),
      });
    }
    try {
      const decoded = fastify.jwt.verify(parsed.data.token);
      const userId = (decoded as { id: string }).id;

      await verifyEmailUser(userId);
      return reply.status(200).send({ message: "Email verfificado" });
    } catch (error: any) {
      if (
        error.code === "FAST_JWT_EXPIRED" ||
        error.code === "FAST_JWT_MALFORMED"
      ) {
        return reply.status(400).send({
          error: "Token inválido o expirado",
          message:
            "El enlace de recuperación ya no es válido. Por favor, solicita uno nuevo.",
        });
      }
      errorServer(error, reply);
    }
  });

  // 8. OAuth Google
  fastify.get("/google", async (request, reply) => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
      redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);

    return reply.redirect(`${rootUrl}?${qs.toString()}`);
  });

  // 9. Callback
  fastify.get("/google/callback", async (request, reply) => {
    const { code } = request.query as { code: string };

    if (!code) {
      return reply
        .status(400)
        .send({ error: "Código de autorización ausente" });
    }

    try {
      // 1. Intercambiar el código por tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
          grant_type: "authorization_code",
        }),
      });
      if (!tokenResponse.ok) {
        const errorToken = await tokenResponse.json();
        fastify.log.error(
          "Error al intercambiar el código de Google:",
          errorToken,
        );
        return reply
          .status(401)
          .send({ error: "No se pudo obtener el token de acceso de Google" });
      }

      const tokenData = (await tokenResponse.json()) as {
        access_token: string;
      };

      // 2. Solicitar los datos del perfil del usuario
      const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        },
      );

      if (!userResponse.ok) {
        const errorUser = await userResponse.json();
        fastify.log.error("Error en userinfo de Google:", errorUser);
        return reply.status(401).send({
          error: "No se pudieron obtener los datos del usuario de Google",
        });
      }

      const googleUser = (await userResponse.json()) as {
        email: string;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        id: string;
      };
      const user = await registerOrLoginGoogleUser(googleUser);

      const token = await reply.jwtSign({
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        givenName: user.givenName,
        familyName: user.familyName,
        picture: user.picture,
      }, { expiresIn: "7d" });

      reply
        .setCookie("identificadorSesion", token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 días
        })
        .redirect(`${process.env.FRONTEND_URL}/dashboard`);

      return reply.send({ message: "Autenticado con Google", googleUser });
    } catch (error) {
      console.log(error);
      fastify.log.error(error);
      return reply
        .status(500)
        .send({ error: "Fallo en la autenticación con Google" });
    }
  });

  // 10. Get User
  fastify.get("/user/:id", async (request, reply) => {
    const parsed = getUserParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Datos inválidos",
        details: parsed.error.format(),
      });
    }
    try {
      const user = await findUserProfileById(parsed.data.id);
      if (!user) {
        return reply.status(404).send({
          error: "Usuario no encontrado",
        });
      }
      return reply.status(200).send({
        message: "Usuario recuperado con exito",
        user: user,
      });
    } catch (error: any) {
      errorServer(error, reply);
    }
  });
}
