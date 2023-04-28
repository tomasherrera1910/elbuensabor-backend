const { v2: cloudinary } = require('cloudinary')

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env

cloudinary.config({
  cloud_name: CLOUDINARY_NAME ?? '',
  api_key: CLOUDINARY_KEY ?? '',
  api_secret: CLOUDINARY_SECRET ?? '',
  secure: true
})

async function uploadImage (filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'elbuensabor'
  })
}
async function deleteImage (publicId) {
  return await cloudinary.uploader.destroy(publicId)
}
module.exports = { uploadImage, deleteImage }
