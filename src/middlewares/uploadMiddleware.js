import multer from "multer";
import path from "path";
import { sendError } from "./responseMiddleware.js";

// Configuração do storage para salvar arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/vehicles/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Tipo de arquivo não suportado. Apenas imagens (JPEG, PNG, GIF, WebP) são permitidas."), false);
    }
};

// Configuração do multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

// Middleware para upload de imagem de veículo
export const uploadVehicleImage = upload.single("image");

// Middleware para tratar erros de upload
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") return sendError(res, "Arquivo muito grande. Tamanho máximo: 5MB", 400);
        if (err.code === "LIMIT_FILE_COUNT") return sendError(res, "Muitos arquivos. Apenas 1 imagem por vez.", 400);
        return sendError(res, "Erro no upload do arquivo", 400);
    }
    if (err.message.includes("Tipo de arquivo não suportado")) return sendError(res, err.message, 400);
    return sendError(res, "Erro interno no servidor", 500);
};

// Função para gerar URL da imagem
export const getImageUrl = (filename) => {
    if (!filename) return null;
    return `/uploads/vehicles/${filename}`;
}; 