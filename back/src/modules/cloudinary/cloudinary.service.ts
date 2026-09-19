import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'properties',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Error al subir la imagen'));
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string = 'properties',
  ): Promise<string[]> {
    const uploads = files.map((file) => this.uploadImage(file, folder));
    const results = await Promise.all(uploads);
    return results.map((result) => result.secure_url);
  }
}
