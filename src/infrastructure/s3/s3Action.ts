import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import config from "../config";
import s3 from "./s3Config";
import crypto from 'crypto';
import mime from 'mime-types';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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


export async function fetchFileFromS3(files: { url: string, filename: string }[]): Promise<{ url: string, filename: string }[]> {
    
    const s3Promises = files.map(async (file) => {
        console.log("dadadadadadadadadadaddadad",file.url);
        
        const getObjectParams = {
            Bucket: config.bucketName,
            Key: file.url,
        };
        const command = new GetObjectCommand(getObjectParams);
        const imageUrl = await getSignedUrl(s3, command, { expiresIn: 604800 });
        return { url: imageUrl, filename: file.filename };
    });

    try {
        const fileData = await Promise.all(s3Promises);
        return fileData;
    } catch (error) {
        console.error("Error fetching files from S3:", error);
        throw error;
    }
}


export async function deleteFileFromS3(url:string):Promise<{success:boolean,message: string}>{
    try {
        const key = url.split('/').pop()?.split('?')[0];
        if (!key) {
            return { success: false, message: "Invalid URL format" };
        }
        const params = {
            Bucket: config.bucketName,
            Key: key
        }
        const command = new DeleteObjectCommand(params);
        const result = await s3.send(command);
        if(!result){
            return {success:false, message:"error occured cant delete file"}
        }
        console.log("removed file successfully from s333333");
        
        return {success:true, message:"Delete successfully"}
    } catch (error) {
        console.log("Error deleting file from s3",error);
        throw new Error("Error occured while removing file from s3")
    }
}


