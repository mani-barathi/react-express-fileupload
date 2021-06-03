import React, { useRef, useState } from "react"
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

const cropDefaultValues = {
  aspect: 1 / 1,
  unit: "px",
  x: 0,
  y: 0,
  width: 200,
  height: 200,
}

function ImageResize() {
  const inputRef = useRef()
  const [crop, setCrop] = useState(cropDefaultValues)
  const [image, setImage] = useState(null)
  const [filename, setFilename] = useState("")
  const [imageBlob, setImageBlob] = useState(null)
  const [info, setInfo] = useState("")

  const resetInput = () => (inputRef.current.value = "")

  const handleOnSelect = (e) => {
    const imageFile = e.target.files[0]
    // validation can be done here
    if (!imageFile.type.startsWith("image")) {
      alert("Only image can be uploaded")
      return resetInput()
    }

    // just taking the first image
    const reader = new FileReader()
    reader.readAsDataURL(imageFile)
    reader.onloadend = () => {
      setImageBlob(reader.result)
    }
    setImage(imageFile)
    const name = imageFile.name.split(".")[0]
    setFilename(name)
  }

  const extractImageFileExtensionFromBase64 = (base64Data) => {
    return base64Data.substring(
      "data:image/".length,
      base64Data.indexOf(";base64")
    )
  }

  const base6ToFile = (base64String, filename) => {
    let arr = base64String.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const processImage = () => {
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext("2d")

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    const croppedBase64Image = canvas.toDataURL("image/jpeg")
    const imageFileExtension = extractImageFileExtensionFromBase64(imageBlob)
    const imageFilename = filename + "." + imageFileExtension
    const croppedImageFile = base6ToFile(croppedBase64Image, imageFilename)
    console.log(croppedImageFile)
    return croppedImageFile
  }

  const handleUpload = async () => {
    setInfo(null)
    const cropedImage = processImage()
    const payload = new FormData()
    payload.append("description", `This is description ${new Date().getTime()}`)
    payload.append("image", cropedImage)

    console.log("payload", payload) // this won't show the upload file in the browser console

    try {
      const response = await fetch(`http://localhost:4000/upload`, {
        method: "POST",
        body: payload,
      })
      const { ok, data, message } = await response.json()
      console.log("upload Response:", { ok, data, message })

      if (ok) {
        setInfo(data)
        setImageBlob(null)
        resetInput()
      } else {
        alert("Error: " + message)
      }
    } catch (e) {
      console.log(e)
      alert("something nwent wrong")
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" onChange={handleOnSelect} />
      {imageBlob && ( // ReactCrop
        <div>
          <ReactCrop
            src={imageBlob}
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onImageLoaded={setImage}
          />
          <br />
          <button onClick={handleUpload}>Upload</button>
        </div>
      )}

      {info && ( //  response after the upload
        <div>
          <h3>Response</h3>
          <pre>{info && JSON.stringify(info, null, 2)}</pre>
          <a href={info.imageUrl} target="_blank" rel="noreferrer">
            <img src={info.imageUrl} alt="" />
          </a>
        </div>
      )}

      {(imageBlob || info) && ( // reset button
        <button
          onClick={() => {
            setImageBlob(null)
            setInfo(null)
            resetInput()
          }}
        >
          Reset
        </button>
      )}
    </div>
  )
}

export default ImageResize
