'use client';

import { createClient } from './supabase/client';

const BUCKET = 'portfolio';
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// Downscale and re-encode as WebP before upload: a phone photo of ~5 MB typically ends up under 300 KB.
async function optimize(file: File, maxSize: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', .85));
  if (!blob) throw new Error('Não foi possível processar a imagem.');
  return blob;
}

export async function uploadImage(file: File, folder: string, maxSize = 1800): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error('Use JPG, PNG, WebP ou AVIF.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Arquivo muito grande (máx. 20 MB antes da otimização).');
  const blob = await optimize(file, maxSize);
  if (blob.size > 5 * 1024 * 1024) throw new Error('Mesmo otimizada, a imagem passou de 5 MB. Use uma imagem menor.');
  const supabase = createClient();
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
  if (error) throw new Error(error.message.includes('row-level security') ? 'Sem permissão para enviar. Entre novamente.' : error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
