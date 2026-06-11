import { supabase } from '../config/supabase'

const convertToJpeg = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log("Blob type:", blob.type, "size:", blob.size)
              resolve(blob)
            } else {
              reject(new Error('toBlob failed'))
            }
          },
          'image/jpeg',
          0.85
        )
      }

      img.onerror = (err) => reject(new Error('Image load failed: ' + err))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}

export const uploadImage = async (file, productCode) => {
  try {
    if (!file) return { url: null, error: new Error('No file provided') }
    if (!productCode) return { url: null, error: new Error('No product code') }

    console.log("=== UPLOAD START ===")
    console.log("File:", file.name, "Type:", file.type, "Size:", file.size)
    console.log("Product code:", productCode)

    // convert to jpeg
    const jpegBlob = await convertToJpeg(file)
    console.log("JPEG blob ready:", jpegBlob.type, jpegBlob.size)

    const fileName = `${productCode}.jpeg`
    console.log("Target filename:", fileName)

    // delete ALL possible old filenames
    const filesToDelete = [
      `${productCode}.jpeg`,
      `${productCode}.jpg`,
      `${productCode}.png`,
      `${productCode}.webp`,
      `${productCode}.heic`,
      `${productCode}.PNG`,
      `${productCode}.JPG`,
      `${productCode}.JPEG`,
    ]

    console.log("Deleting old files:", filesToDelete)
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove(filesToDelete)

    if (deleteError) {
      console.warn("Delete warning (ok to ignore):", deleteError.message)
    } else {
      console.log("Old files deleted")
    }

    // wait for delete
    await new Promise(r => setTimeout(r, 800))

    // upload fresh jpeg
    console.log("Uploading fresh file...")
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, jpegBlob, {
        contentType: 'image/jpeg',
        cacheControl: '1',           // 👈 cache for 1 second only — forces refresh
        upsert: true
      })

    if (uploadError) {
      console.error("Upload FAILED:", uploadError)
      return { url: null, error: uploadError }
    }

    console.log("Upload success:", uploadData)

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    // cache buster
    const freshUrl = `${data.publicUrl}?t=${Date.now()}`
    console.log("=== UPLOAD DONE ===")
    console.log("URL:", freshUrl)

    return { url: freshUrl, error: null }

  } catch (err) {
    console.error("=== UPLOAD ERROR ===", err)
    return { url: null, error: err }
  }
}