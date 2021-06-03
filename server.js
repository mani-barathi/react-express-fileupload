import express from "express"
import multer from "multer"
import cors from "cors"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import stream from "stream"
import { fileURLToPath } from "url"

// This is just to get the __dirname because I've set type = "module" in package.json
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const upload = multer()
const pipeline = promisify(stream.pipeline)
const PORT = 4000

const app = express()
app.use(cors("*"))
app.use(express.static("public"))

app.get("/", (_, res) => res.send("Hello world"))

app.post("/upload", upload.single("image"), async (req, res) => {
  //   console.log("req.file", req.file)
  const { file, body } = req

  if (!file) {
    return res.json({ message: `No image uploaded`, ok: false })
  }

  // validation can done by checking the file type
  if (!file.detectedMimeType || !file.detectedMimeType.startsWith("image")) {
    return res.json({ message: `Only image can be uploaded`, ok: false })
  }

  const randomString = Math.floor(Math.random() * 1000)
  const filename = "img_" + randomString + file.originalName // originalName inlcudes extention
  const filePath = path.join(__dirname, `./public/images/${filename}`)
  const imageUrl = `http://localhost:${PORT}/images/${filename}`

  // using the stream method present in the file obj
  await file.stream.pipe(fs.createWriteStream(filePath))

  // alternate way to pipe a stream
  // await pipeline(file.stream, fs.createWriteStream(filePath))

  // save imageUrl to database
  const data = { imageUrl, description: body.description || "" }

  res.json({ ok: true, data })
})

app.listen(PORT, () => console.log(`URL: http://localhost:${PORT}`))
