import { supabase } from '../config/supabase'

// convert any image to jpeg using canvas
const convertToJpeg = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target.result
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas conversion failed'))
          }
        },
        'image/jpeg',
        0.85          // 85% quality — good balance of size and quality
      )
    }

    img.onerror = () => reject(new Error('Image load failed'))
    reader.onerror = () => reject(new Error('File read failed'))

    reader.readAsDataURL(file)
  })
}

export const uploadImage = async (file, productCode) => {
  try {
    const fileName = `${productCode}.jpeg`     // always .jpeg

    console.log("Converting to JPEG:", fileName)

    // convert image to jpeg
    const jpegBlob = await convertToJpeg(file)

    console.log("Uploading:", fileName)

    // delete old image first
    await supabase.storage
      .from('product-images')
      .remove([
        `${productCode}.jpg`,
        `${productCode}.jpeg`,
        `${productCode}.png`,
        `${productCode}.webp`
      ])

    // upload converted jpeg
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, jpegBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error("Upload error:", uploadError.message)
      return { url: null, error: uploadError }
    }

    // get public URL
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    console.log("Public URL:", data.publicUrl)

    return { url: data.publicUrl, error: null }

  } catch (err) {
    console.error("Upload error:", err.message)
    return { url: null, error: err }
  }
}