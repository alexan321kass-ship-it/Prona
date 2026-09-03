export const IMAGE_STORAGE_SERVICE = "IMAGE_STORAGE_SERVICE";

export interface UploadImageResult {
  url: string;
  publicId: string;
}

export interface IImageStorageService {
  /**
   * Sube una imagen al proveedor de almacenamiento
   * @param file Archivo recibido por Multer
   * @param folder Carpeta o ruta lógica dentro del almacenamiento (e.g. 'productos')
   */
  uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadImageResult>;

  /**
   * Elimina una imagen del proveedor usando su identificador único
   * @param publicId Identificador único de la imagen en el proveedor
   */
  deleteImage(publicId: string): Promise<void>;
}
