import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";
import { PostgresConnectionRepository } from "@aletis/infrastructure";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const friendId = formData.get("friendId") as string | null;

    if (!file || !friendId) {
      return NextResponse.json({ success: false, message: "Dados incompletos para o envio da mídia." }, { status: 400 });
    }

    const fileSizeMB = file.size / (1024 * 1024);
    const filename = file.name;
    const mimeType = file.type.toLowerCase();
    const extension = filename.includes(".") ? `.${filename.split(".").pop()?.toLowerCase()}` : "";

    const MAX_IMAGE_SIZE_MB = 25;
    const MAX_VIDEO_SIZE_MB = 200;
    const MAX_PDF_SIZE_MB = 50;

    const isVideo = mimeType.startsWith("video/") || [".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v"].includes(extension);
    const isImage = mimeType.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic", ".bmp", ".svg"].includes(extension);

    if (isVideo && fileSizeMB > MAX_VIDEO_SIZE_MB) {
      return NextResponse.json({
        success: false,
        message: `Este vídeo (${fileSizeMB.toFixed(1)} MB) é muito grande. O tamanho máximo permitido para vídeos é de ${MAX_VIDEO_SIZE_MB} MB.`,
      }, { status: 400 });
    }

    if (isImage && fileSizeMB > MAX_IMAGE_SIZE_MB) {
      return NextResponse.json({
        success: false,
        message: `Esta foto (${fileSizeMB.toFixed(1)} MB) é muito grande. O tamanho máximo permitido para fotos é de ${MAX_IMAGE_SIZE_MB} MB.`,
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    const type = isVideo ? "video" : "image";

    const repo = new PostgresConnectionRepository();
    const message = await repo.sendMessage(friendId, filename, type, base64Data, user.id);

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    console.error("Erro na API /api/media/upload:", error);
    return NextResponse.json({
      success: false,
      message: "Ocorreu uma falha no servidor ao processar sua mídia. Por favor, tente novamente.",
    }, { status: 500 });
  }
}
