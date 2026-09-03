import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import {
  IImageStorageService,
  UploadImageResult,
} from "./image-storage.interface";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import * as streamifier from "streamifier";

@Injectable()
export class CloudinaryService implements IImageStorageService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadImageResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          // Cloudinary can handle format and optimization on the fly,
          // or we can enforce format conversions here:
          // format: 'webp',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result) {
            this.logger.error("Error uploading image to Cloudinary", error);
            return reject(
              new InternalServerErrorException("Error uploading image"),
            );
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      // We pipe the buffer to the stream
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      if (!publicId) return;
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(
        `Deleted image ${publicId} with result: ${result.result}`,
      );
    } catch (error) {
      this.logger.error(`Error deleting image ${publicId}`, error);
      // We don't throw an error here to prevent a failing deletion
      // from breaking a larger transaction (like deleting a product),
      // but we do log it.
    }
  }
}
