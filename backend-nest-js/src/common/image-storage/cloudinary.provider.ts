import { Provider } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY = "Cloudinary";

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  useFactory: () => {
    // Cloudinary automatically parses the CLOUDINARY_URL environment variable
    // We just need to return the cloudinary instance so it can be injected if needed
    // However, it's also configured globally once imported.
    return cloudinary;
  },
};
