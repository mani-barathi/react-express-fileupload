import { useState } from "react"
import FileUpload from "./FileUpload"
import ImageResize from "./ImageResize"

function App() {
  const [isImageResize, setIsImageResize] = useState(false)

  return (
    <div className="app">
      <div className="header">
        <h1> {isImageResize ? "Image Resize" : "File Upload"} </h1>
        <button onClick={() => setIsImageResize((p) => !p)}>
          Try {isImageResize ? "File Upload" : "Image Resize"}
        </button>
      </div>

      {isImageResize ? <ImageResize /> : <FileUpload />}
    </div>
  )
}

export default App
