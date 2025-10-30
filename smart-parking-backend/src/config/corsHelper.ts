import cors, { CorsOptions } from "cors";

const allowedOrigins = [
  "http://localhost:3000",   // React default
  "http://localhost:5173",   // Vite default
  "https://your-staging-domain.com",
  "https://your-production-domain.com",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(` CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};

export const corsHelper = cors(corsOptions);
