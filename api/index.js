// server/app.ts
import express from "express";
import cors from "cors";
import path2 from "path";
import fs2 from "fs";
import rateLimit from "express-rate-limit";
import mongoose3 from "mongoose";

// server/config/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
var envLocal = path.resolve(process.cwd(), ".env.local");
var envDefault = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
}
if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
}
function getMongoUri() {
  let uri = process.env.MONGODB_URI || process.env.MONGODBURL || "";
  if (!uri && fs.existsSync(envLocal)) {
    const content = fs.readFileSync(envLocal, "utf8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      if (trimmed.startsWith("MONGODB_URI=")) uri = trimmed.slice(12).trim();
      else if (trimmed.startsWith("MONGODBURL:")) uri = trimmed.slice(11).trim();
      else if (trimmed.startsWith("MONGODB_URI:")) uri = trimmed.slice(12).trim();
      else if (trimmed.startsWith("MONGODBURL=")) uri = trimmed.slice(11).trim();
    }
  }
  if (!uri) {
    throw new Error(
      "MISSING_MONGODB_URI: MONGODB_URI or MONGODBURL is not defined in environment variables or .env.local."
    );
  }
  if (uri.endsWith(".mongodb.net/")) {
    uri += "love_sketchbook?retryWrites=true&w=majority";
  } else if (uri.endsWith(".mongodb.net")) {
    uri += "/love_sketchbook?retryWrites=true&w=majority";
  }
  return uri;
}
var cachedConn = null;
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once("connected", resolve);
    });
    return mongoose;
  }
  const uri = getMongoUri();
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
  console.log(`[Database] Connecting to MongoDB Atlas (${maskedUri})...`);
  try {
    cachedConn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8e3,
      autoIndex: process.env.NODE_ENV !== "production"
    });
    console.log(`[Database] Connected successfully to database "${mongoose.connection.name}".`);
    return cachedConn;
  } catch (err) {
    console.error("[Database] Fatal: Unable to connect to MongoDB Atlas:", err.message);
    throw err;
  }
}

// server/routes/giftRoutes.ts
import { Router } from "express";

// server/models/Gift.ts
import mongoose2, { Schema } from "mongoose";
var PhotoSubSchema = new Schema(
  {
    id: { type: String, required: true },
    url: {
      type: String,
      required: true,
      validate: {
        validator: (v) => !v.startsWith("data:image/"),
        message: "Base64 image strings are not allowed in MongoDB documents. Images must be hosted externally (ImgBB)."
      }
    },
    caption: { type: String, default: "", maxlength: 100 },
    rotation: { type: Number, default: 0 },
    publicId: { type: String, default: "" },
    displayUrl: { type: String, default: "" },
    deleteUrl: { type: String, default: "" },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    bytes: { type: Number },
    order: { type: Number, default: 0 }
  },
  { _id: false }
);
var GiftSchema = new Schema(
  {
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"]
    },
    recipient_name: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
      minlength: [1, "Recipient name cannot be empty"],
      maxlength: [100, "Recipient name cannot exceed 100 characters"]
    },
    sender_name: {
      type: String,
      required: [true, "Sender name is required"],
      trim: true,
      minlength: [1, "Sender name cannot be empty"],
      maxlength: [100, "Sender name cannot exceed 100 characters"]
    },
    opening_message: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Opening message cannot exceed 500 characters"]
    },
    messages: {
      type: [String],
      required: [true, "At least one wish message is required"],
      validate: [
        {
          validator: (arr) => arr.length > 0 && arr.length <= 15,
          message: "Number of messages must be between 1 and 15"
        }
      ]
    },
    closing_message: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Closing message cannot exceed 500 characters"]
    },
    photos: {
      type: [PhotoSubSchema],
      validate: [
        {
          validator: (arr) => arr.length <= 30,
          message: "Maximum 30 photos allowed per gift"
        }
      ],
      default: []
    },
    theme_color: {
      type: String,
      default: "#C9757C",
      maxlength: 20
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);
var Gift = mongoose2.models.Gift || mongoose2.model("Gift", GiftSchema);

// server/routes/giftRoutes.ts
var giftRouter = Router();
function generateGiftSlug(name) {
  const prefix = name ? name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 15) : "love";
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix || "love"}-${randomStr}`;
}
giftRouter.get("/:slug", async (req, res) => {
  try {
    const rawSlug = req.params.slug;
    if (!rawSlug || typeof rawSlug !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid gift identifier."
      });
    }
    const cleanSlug = rawSlug.toLowerCase().trim();
    const gift = await Gift.findOne({ slug: cleanSlug }).lean();
    if (!gift) {
      return res.status(404).json({
        success: false,
        message: "Kh\xF4ng t\xECm th\u1EA5y cu\u1ED1n s\u1ED5 qu\xE0 t\u1EB7ng n\xE0y trong h\u1EC7 th\u1ED1ng."
      });
    }
    return res.status(200).json({
      success: true,
      data: gift
    });
  } catch (error) {
    console.error("[Gifts] Error retrieving gift:", error);
    return res.status(500).json({
      success: false,
      message: "L\u1ED7i truy v\u1EA5n c\u01A1 s\u1EDF d\u1EEF li\u1EC7u MongoDB Atlas."
    });
  }
});
giftRouter.post("/", async (req, res) => {
  try {
    const {
      recipient_name,
      sender_name,
      opening_message,
      messages,
      closing_message,
      photos = [],
      theme_color
    } = req.body;
    if (!recipient_name || typeof recipient_name !== "string" || !recipient_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "T\xEAn ng\u01B0\u1EDDi nh\u1EADn kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng."
      });
    }
    if (!sender_name || typeof sender_name !== "string" || !sender_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "T\xEAn ng\u01B0\u1EDDi g\u1EEDi kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng."
      });
    }
    if (!Array.isArray(messages) || messages.filter((m) => typeof m === "string" && m.trim()).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui l\xF2ng nh\u1EADp \xEDt nh\u1EA5t m\u1ED9t l\u1EDDi ch\xFAc y\xEAu th\u01B0\u01A1ng."
      });
    }
    if (!Array.isArray(photos)) {
      return res.status(400).json({
        success: false,
        message: "Danh s\xE1ch \u1EA3nh kh\xF4ng h\u1EE3p l\u1EC7."
      });
    }
    if (photos.length > 30) {
      return res.status(400).json({
        success: false,
        message: "M\u1ED7i m\xF3n qu\xE0 ch\u1EC9 \u0111\u01B0\u1EE3c t\u1ED1i \u0111a 30 \u1EA3nh."
      });
    }
    const processedPhotos = [];
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      const photoUrl = typeof p?.url === "string" ? p.url.trim() : "";
      if (photoUrl.startsWith("data:image/") || photoUrl.startsWith("data:")) {
        return res.status(400).json({
          success: false,
          message: `\u1EA2nh th\u1EE9 ${i + 1} \u0111ang \u1EDF \u0111\u1ECBnh d\u1EA1ng Base64. T\u1EA5t c\u1EA3 \u1EA3nh ph\u1EA3i \u0111\u01B0\u1EE3c t\u1EA3i tr\u1EF1c ti\u1EBFp l\xEAn ImgBB t\u1EEB tr\xECnh duy\u1EC7t tr\u01B0\u1EDBc khi t\u1EA1o qu\xE0.`
        });
      }
      if (!photoUrl) {
        return res.status(400).json({
          success: false,
          message: `\u1EA2nh th\u1EE9 ${i + 1} kh\xF4ng c\xF3 \u0111\u01B0\u1EDDng d\u1EABn URL h\u1EE3p l\u1EC7.`
        });
      }
      processedPhotos.push({
        id: p.id || `photo-${Date.now()}-${i}`,
        url: photoUrl,
        displayUrl: typeof p.displayUrl === "string" && p.displayUrl.trim() ? p.displayUrl.trim() : photoUrl,
        deleteUrl: typeof p.deleteUrl === "string" ? p.deleteUrl.trim() : "",
        caption: typeof p.caption === "string" ? p.caption.trim().slice(0, 100) : "",
        rotation: typeof p.rotation === "number" ? p.rotation : 0,
        publicId: typeof p.publicId === "string" ? p.publicId.trim() : "",
        width: typeof p.width === "number" ? p.width : void 0,
        height: typeof p.height === "number" ? p.height : void 0,
        bytes: typeof p.bytes === "number" ? p.bytes : void 0,
        format: typeof p.format === "string" ? p.format : void 0,
        order: i
      });
    }
    let slug = generateGiftSlug(recipient_name);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await Gift.findOne({ slug }).select("_id").lean();
      if (!existing) break;
      slug = generateGiftSlug(recipient_name);
      attempts++;
    }
    const newGift = await Gift.create({
      slug,
      recipient_name: recipient_name.trim(),
      sender_name: sender_name.trim(),
      opening_message: (opening_message || "").trim(),
      messages: messages.map((m) => String(m).trim()).filter(Boolean),
      closing_message: (closing_message || "").trim(),
      photos: processedPhotos,
      theme_color: theme_color || "#C9757C"
    });
    console.log(`[Gifts] Created gift "${slug}" for recipient "${newGift.recipient_name}" with ${processedPhotos.length} photos.`);
    return res.status(201).json({
      success: true,
      data: newGift
    });
  } catch (error) {
    console.error("[Gifts] Error creating gift:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "L\u1ED7i l\u01B0u tr\u1EEF qu\xE0 t\u1EB7ng v\xE0o MongoDB Atlas."
    });
  }
});

// server/routes/uploadRoutes.ts
import { Router as Router2 } from "express";
var uploadRouter = Router2();
uploadRouter.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    provider: "imgbb",
    directUpload: true,
    maxPhotos: 30,
    message: "H\u1EC7 th\u1ED1ng s\u1EED d\u1EE5ng ImgBB API. \u1EA2nh \u0111\u01B0\u1EE3c t\u1EA3i tr\u1EF1c ti\u1EBFp t\u1EEB tr\xECnh duy\u1EC7t c\u1EE7a ng\u01B0\u1EDDi d\xF9ng l\xEAn ImgBB."
  });
});
var handleLegacySign = (_req, res) => {
  return res.status(200).json({
    success: false,
    configured: false,
    provider: "imgbb",
    message: "D\u1EF1 \xE1n \u0111\xE3 chuy\u1EC3n sang ImgBB. Kh\xF4ng c\u1EA7n t\u1EA1o ch\u1EEF k\xFD (signature) qua m\xE1y ch\u1EE7."
  });
};
uploadRouter.get("/sign", handleLegacySign);
uploadRouter.post("/sign", handleLegacySign);
uploadRouter.post("/", (_req, res) => {
  return res.status(400).json({
    success: false,
    provider: "imgbb",
    message: "T\u1EA3i \u1EA3nh qua m\xE1y ch\u1EE7 \u0111\xE3 b\u1ECB v\xF4 hi\u1EC7u h\xF3a. T\u1EA5t c\u1EA3 \u1EA3nh ph\u1EA3i \u0111\u01B0\u1EE3c t\u1EA3i tr\u1EF1c ti\u1EBFp t\u1EEB tr\xECnh duy\u1EC7t l\xEAn ImgBB."
  });
});

// server/app.ts
var app = express();
app.set("trust proxy", 1);
var allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
var uploadsDir = path2.resolve(process.cwd(), "uploads");
if (fs2.existsSync(uploadsDir)) {
  app.use("/uploads", express.static(uploadsDir));
  app.use("/api/uploads", express.static(uploadsDir));
}
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." }
});
app.use(async (req, res, next) => {
  if (req.path.includes("/gifts") || req.path.includes("/health")) {
    try {
      await connectDB();
    } catch (err) {
      console.error("[Database Middleware Error]:", err.message);
      return res.status(503).json({
        success: false,
        message: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i \u0111\u1EBFn c\u01A1 s\u1EDF d\u1EEF li\u1EC7u MongoDB Atlas."
      });
    }
  }
  next();
});
app.use("/api", apiLimiter);
app.use("/api/gifts", giftRouter);
app.use("/gifts", giftRouter);
app.use("/api/upload", uploadRouter);
app.use("/upload", uploadRouter);
var handleHealth = (_req, res) => {
  const isDbConnected = mongoose3.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? "healthy" : "database_disconnected",
    database: isDbConnected ? "MongoDB Atlas Connected" : "Disconnected",
    uptime: process.uptime(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};
app.get("/api/health", handleHealth);
app.get("/health", handleHealth);
app.use((err, _req, res, _next) => {
  console.error("[Server Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "L\u1ED7i h\u1EC7 th\u1ED1ng m\xE1y ch\u1EE7."
  });
});
var app_default = app;
export {
  app,
  app_default as default
};
