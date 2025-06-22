import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 configuration
const accountId = import.meta.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = import.meta.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.CLOUDFLARE_BUCKET_NAME;
const publicUrl = import.meta.env.CLOUDFLARE_PUBLIC_URL;

// Debug logging
console.log('R2 Configuration:', {
  accountId: accountId ? 'SET' : 'MISSING',
  accessKeyId: accessKeyId ? 'SET' : 'MISSING',
  secretAccessKey: secretAccessKey ? 'SET' : 'MISSING',
  bucketName: bucketName || 'MISSING',
  publicUrl: publicUrl || 'MISSING'
});

// Create S3 client for R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

// Upload file to R2
export async function uploadToR2(filePath: string, fileBuffer: Buffer, contentType: string) {
  try {
    console.log('Uploading to R2:', {
      filePath,
      contentType,
      bufferSize: fileBuffer.length,
      bucketName,
      publicUrl
    });

    await r2Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: fileBuffer,
      ContentType: contentType,
      // R2 doesn't support ACLs like S3, remove this line
      // ACL: 'public-read',
    }));    // Return the public URL of the uploaded file
    // Asegurar que se use HTTPS para el dominio personalizado
    const baseUrl = publicUrl?.startsWith('http') ? publicUrl : `https://${publicUrl}`;
    
    // Normalizar la URL para evitar dobles barras
    const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    const finalUrl = `${normalizedBaseUrl}/${normalizedFilePath}`;
    
    console.log('Upload successful, final URL:', finalUrl);
    
    return finalUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
}

// Get a signed URL for temporary access (if not using public bucket)
export async function getSignedR2Url(filePath: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });
    
    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

// Get public URL (if using public bucket)
export function getPublicUrl(filePath: string) {
  const baseUrl = publicUrl?.startsWith('http') ? publicUrl : `https://${publicUrl}`;
  const directUrl = `${baseUrl}/${filePath}`;
  // When running in browser, use the proxy endpoint to avoid CORS issues
  if (typeof window !== 'undefined') {
    return `/r2-proxy?url=${encodeURIComponent(directUrl)}`;
  }
  return directUrl;
}

// List all files in a directory
export async function listFiles(prefix?: string) {
  try {
    const command = new ListObjectsCommand({
      Bucket: bucketName,
      Prefix: prefix,
    });
    
    const response = await r2Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

// Delete a file
export async function deleteFile(filePath: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });
    
    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
