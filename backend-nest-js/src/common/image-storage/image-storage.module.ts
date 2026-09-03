import { Module } from "@nestjs/common";
import { CloudinaryProvider } from "./cloudinary.provider";
import { CloudinaryService } from "./cloudinary.service";
import { IMAGE_STORAGE_SERVICE } from "./image-storage.interface";

@Module({
  providers: [
    CloudinaryProvider,
    {
      provide: IMAGE_STORAGE_SERVICE,
      useClass: CloudinaryService,
    },
  ],
  exports: [IMAGE_STORAGE_SERVICE, CloudinaryProvider],
})
export class ImageStorageModule {}
