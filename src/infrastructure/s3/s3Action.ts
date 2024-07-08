import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import config from "../config";
import s3 from "./s3Config";
import crypto from 'crypto';
import mime from 'mime-types';

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export async function uploadFileToS3(fileBuffer: Buffer, originalName: string): Promise<string> {
    const imageName = randomImageName();
    const extension = originalName.split('.').pop() || '';
    const contentType = mime.lookup(extension) || 'application/octet-stream';
    const params = {
        Bucket: config.bucketName,
        Key: imageName,
        Body: fileBuffer,
        ContentType: contentType,
    };
    
    try {
        // Using Upload from @aws-sdk/lib-storage for more reliable uploads
        const upload = new Upload({
            client: s3,
            params,
        });

        await upload.done();

        console.log("Saved image to S3:", imageName);
        
        return imageName;

    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw error;
    }
}
