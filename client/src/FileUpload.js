import React, { useRef, useState } from "react"

function FileUpload() {
  const inputRef = useRef()
  const [message, setMessage] = useState("")
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState("")
  const [info, setInfo] = useState("")

  const resetInput = () => (inputRef.current.value = "")

  const handleOnChange = (e) => {
    // validation can be done here

    // just taking the first image
    setFile(e.target.files[0])
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    setInfo(null)
    setMessage("")

    const payload = new FormData()
    payload.append("description", description)
    payload.append("image", file)
    console.log("payload", payload) // this won't show the upload file in the browser console

    // To verify, we can send an request to httpbin, it will parse the form data send a response back
    try {
      // const httpbinRes = await fetch(`https://httpbin.org/anything`, {
      //   method: "POST",
      //   body: payload,
      // })
      // const httpbinData = await httpbinRes.json()
      // console.log("httpbin:", httpbinData)

      // Actual upload to our server
      const response = await fetch(`http://localhost:4000/upload`, {
        method: "POST",
        body: payload,
      })
      const { ok, data, message } = await response.json()
      console.log("upload Response:", { ok, data, message })

      if (ok) {
        setInfo(data)
        setDescription("")
        setFile(undefined)
        resetInput()
      } else {
        setMessage("Error: " + message)
      }
    } catch (e) {
      alert("something went wrong!")
      return console.log(e)
    }
  }

  return (
    <div className="app">
      <form onSubmit={handleFormSubmit}>
        <input ref={inputRef} type="file" onChange={handleOnChange} />
        <br /> <br />
        <input
          type="text"
          placeholder="Enter a description about the file (optional)"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
        <p>{message}</p>
        <button type="submit">Submit</button>
      </form>

      <br />

      {info && (
        <div>
          <h3>Response</h3>
          <pre>{info && JSON.stringify(info, null, 2)}</pre>
          <a href={info.imageUrl} target="_blank" rel="noreferrer">
            <img className="img" src={info.imageUrl} alt="" />
          </a>
        </div>
      )}

      {(file || info) && ( // reset button
        <button
          onClick={() => {
            setInfo(null)
            setFile(null)
            setMessage("")
            setDescription("")
            resetInput()
          }}
        >
          Reset
        </button>
      )}
    </div>
  )
}

export default FileUpload
